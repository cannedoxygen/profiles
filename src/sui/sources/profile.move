/*
  _____           _ _             _             
 |_   _|_ _ _ __ __| (_)_ __   __ _| |_ ___  _ __ 
   | |/ _` | '__/ _` | | '_ \ / _` | __/ _ \| '__|
   | | (_| | | | (_| | | | | | (_| | || (_) | |   
   |_|\__,_|_|  \__,_|_|_| |_|\__,_|\__\___/|_|   
                                                  
  ___            __ _ _      
 | _ \_ _ ___ / _(_) |___ 
 |  _/ '_/ _ \ |_| | / -_)
 |_| |_| \___/  (_)_|\___|
                          
*/

module tardinator_profile::profile
{
    use std::string::{String, utf8};
    use std::vector;
    use std::option::{Self, Option};
    use sui::clock::{Self, Clock};
    use sui::display::{Self};
    use sui::dynamic_field;
    use sui::dynamic_object_field;
    use sui::event;
    use sui::object::{Self, ID, UID};
    use sui::package::{Self};
    use sui::table::{Self, Table};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};

    /* Error Constants */
    
    const ENameAlreadyTaken: u64 = 100;
    const EInvalidUsername: u64 = 101;
    const ECantRemoveLastRegistry: u64 = 102;

    /* Structs */

    struct Registry has key {
        id: UID,
        name: String,
        profiles: Table<address, address>,
    }

    /// Stores username to owner address mapping to enforce uniqueness
    struct NameRegistry has key {
        id: UID,
        name_to_owner: Table<String, address>,
    }

    struct TardinatorProfile has key {
        id: UID,
        name: String,           // Unique Tardinator alias
        image_url: String,      // URL to profile image on IPFS/Arweave
        description: String,
        data: String,           // Additional JSON data
        x_account: Option<String>,    // Optional: X (Twitter) handle
        telegram: Option<String>,     // Optional: Telegram username
        created_at: u64,        // Timestamp of profile creation
    }

    /* Events */

    struct EventCreateRegistry has copy, drop {
        registry_id: ID,
    }

    struct EventCreateProfile has copy, drop {
        profile_id: ID,
        registry_id: ID,
        name: String,
    }

    struct EventNameRegistered has copy, drop {
        name: String,
        owner: address,
    }

    /* Functions */

    // Initialize the system with a name registry
    fun init(otw: PROFILE, ctx: &mut TxContext) {
        let publisher = package::claim(otw, ctx);

        // Create the name registry for unique usernames
        let name_registry = NameRegistry {
            id: object::new(ctx),
            name_to_owner: table::new(ctx),
        };
        transfer::share_object(name_registry);

        // Set up display for the profile objects
        let profile_display = display::new_with_fields<TardinatorProfile>(
            &publisher,
            vector[
                utf8(b"name"),
                utf8(b"image_url"),
                utf8(b"description"),
                utf8(b"link"),
                utf8(b"creator"),
                utf8(b"project_name"),
                utf8(b"project_url"),
                utf8(b"project_image_url"),
            ], vector[
                utf8(b"{name}"), // name
                utf8(b"{image_url}"), // image_url
                utf8(b"{description}"), // description
                utf8(b"https://tardinator.app/profile/{id}"), // link
                utf8(b"https://tardinator.app"), // creator
                utf8(b"Tardinator Profile"), // project_name
                utf8(b"https://tardinator.app"), // project_url
                utf8(b"https://tardinator.app/img/project_image.png"), // project_image_url
            ], ctx
        );

        display::update_version(&mut profile_display);

        transfer::public_transfer(publisher, tx_context::sender(ctx));
        transfer::public_transfer(profile_display, tx_context::sender(ctx));
    }

    /// Create a new registry to hold profiles
    public entry fun create_registry(
        name: vector<u8>,
        ctx: &mut TxContext,
    ) {
        let registry_uid = object::new(ctx);
        let registry_id = object::uid_to_inner(&registry_uid);

        let registry = Registry {
            id: registry_uid,
            name: utf8(name),
            profiles: table::new(ctx),
        };
        transfer::share_object(registry);

        event::emit(EventCreateRegistry { registry_id });
    }

    /// Check if a username is available
    public fun check_name_availability(
        name_registry: &NameRegistry,
        name: vector<u8>,
    ): bool {
        let name_string = utf8(name);
        !table::contains(&name_registry.name_to_owner, name_string)
    }

    /// Validate username format
    fun validate_username(name: &String): bool {
        let bytes = *string::bytes(name);
        let length = vector::length(&bytes);
        
        // Username must be between 3 and 20 characters
        if (length < 3 || length > 20) {
            return false
        };
        
        // Only allow alphanumeric characters and underscores
        let i = 0;
        while (i < length) {
            let char = *vector::borrow(&bytes, i);
            
            // ASCII ranges: 0-9 (48-57), A-Z (65-90), a-z (97-122), underscore (95)
            let is_valid = 
                (char >= 48 && char <= 57) || // 0-9
                (char >= 65 && char <= 90) || // A-Z
                (char >= 97 && char <= 122) || // a-z
                char == 95; // underscore
                
            if (!is_valid) {
                return false
            };
            
            i = i + 1;
        };
        
        true
    }

    /// Create a new Profile for the sender, and add it to a Registry.
    /// Aborts if the sender already has a Profile inside the Registry.
    /// Aborts if the username is already taken.
    public entry fun create_profile(
        registry: &mut Registry,
        name_registry: &mut NameRegistry,
        name: vector<u8>,
        image_url: vector<u8>,
        description: vector<u8>,
        data: vector<u8>,
        x_account: vector<u8>,
        telegram: vector<u8>,
        clock: &Clock,
        ctx: &mut TxContext,
    ) {
        let name_string = utf8(name);
        
        // Validate username format
        assert!(validate_username(&name_string), EInvalidUsername);
        
        // Check if the name is already taken
        assert!(!table::contains(&name_registry.name_to_owner, name_string), ENameAlreadyTaken);
        
        let profile_uid = object::new(ctx);
        let profile_id = object::uid_to_inner(&profile_uid);
        let profile_addr = object::uid_to_address(&profile_uid);
        let sender_addr = tx_context::sender(ctx);
        
        // Register the username
        table::add(&mut name_registry.name_to_owner, name_string, sender_addr);
        
        // Create x_account and telegram optional fields
        let x_account_option = if (vector::length(&x_account) > 0) {
            option::some(utf8(x_account))
        } else {
            option::none()
        };
        
        let telegram_option = if (vector::length(&telegram) > 0) {
            option::some(utf8(telegram))
        } else {
            option::none()
        };
        
        // Get current timestamp
        let timestamp = clock::timestamp_ms(clock);

        let profile = TardinatorProfile {
            id: profile_uid,
            name: name_string,
            image_url: utf8(image_url),
            description: utf8(description),
            data: utf8(data),
            x_account: x_account_option,
            telegram: telegram_option,
            created_at: timestamp,
        };
        
        // Add profile to registry
        table::add(&mut registry.profiles, sender_addr, profile_addr);
        transfer::transfer(profile, sender_addr);

        // Emit events
        event::emit(EventCreateProfile {
            profile_id,
            registry_id: object::id(registry),
            name: name_string,
        });
        
        event::emit(EventNameRegistered {
            name: name_string,
            owner: sender_addr,
        });
    }

    /// Add a Profile (and the sender) to a Registry.
    /// Aborts if the sender already has a Profile inside the Registry.
    public entry fun add_to_registry(
        registry: &mut Registry,
        profile: &mut TardinatorProfile,
        ctx: &mut TxContext,
    ) {
        let sender_addr = tx_context::sender(ctx);
        let profile_addr = object::id_address(profile);
        table::add(&mut registry.profiles, sender_addr, profile_addr);
    }

    /// Edit a profile. Name cannot be changed since it must remain unique.
    public entry fun edit_profile(
        profile: &mut TardinatorProfile,
        image_url: vector<u8>,
        description: vector<u8>,
        data: vector<u8>,
        x_account: vector<u8>,
        telegram: vector<u8>,
        _ctx: &mut TxContext,
    ) {
        // Update the profile fields
        profile.image_url = utf8(image_url);
        profile.description = utf8(description);
        profile.data = utf8(data);
        
        // Update optional social media fields
        profile.x_account = if (vector::length(&x_account) > 0) {
            option::some(utf8(x_account))
        } else {
            option::none()
        };
        
        profile.telegram = if (vector::length(&telegram) > 0) {
            option::some(utf8(telegram))
        } else {
            option::none()
        };
    }

    struct LookupResult {
        lookup_addr: address,
        profile_addr: address,
    }
    
    /// Find profiles in a registry by the addresses of their owners.
    /// Addresses that don't have a profile in the registry don't get included in the results.
    /// Clients are expected to use the sui_devInspectTransaction RPC API.
    public fun get_profiles(
        registry: &Registry,
        lookup_addresses: vector<address>,
    ): vector<LookupResult>
    {
        let results = vector::empty<LookupResult>();
        let length = vector::length(&lookup_addresses);
        let index = 0;
        while ( index < length ) {
            let lookup_addr = *vector::borrow(&lookup_addresses, index);
            if ( table::contains(&registry.profiles, lookup_addr) ) {
                let profile_addr = *table::borrow(&registry.profiles, lookup_addr);
                let result = LookupResult { lookup_addr, profile_addr };
                vector::push_back(&mut results, result);
            };
            index = index + 1
        };
        return results
    }

    /// Aborts with `EFieldAlreadyExists` if the object already has that field with that name.
    public fun add_dynamic_field<Name: copy + drop + store, Value: store>(
        profile: &mut TardinatorProfile,
        name: Name,
        value: Value,
    ) {
        dynamic_field::add(&mut profile.id, name, value);
    }

    /// Aborts with `EFieldDoesNotExist` if the object does not have a field with that name.
    /// Aborts with `EFieldTypeMismatch` if the field exists, but the value does not have
    /// the specified type.
    public fun remove_dynamic_field<Name: copy + drop + store, Value: store>(
        profile: &mut TardinatorProfile,
        name: Name,
    ): Value {
        return dynamic_field::remove(&mut profile.id, name)
    }

    /// Aborts with `EFieldAlreadyExists` if the object already has that field with that name.
    public fun add_dynamic_object_field<Name: copy + drop + store, Value: key + store>(
        profile: &mut TardinatorProfile,
        name: Name,
        value: Value,
    ) {
        dynamic_object_field::add(&mut profile.id, name, value);
    }

    /// Aborts with `EFieldDoesNotExist` if the object does not have a field with that name.
    /// Aborts with `EFieldTypeMismatch` if the field exists, but the value object does not have
    /// the specified type.
    public fun remove_dynamic_object_field<Name: copy + drop + store, Value: key + store>(
        profile: &mut TardinatorProfile,
        name: Name,
    ): Value {
        return dynamic_object_field::remove(&mut profile.id, name)
    }

    // One-Time-Witness
    struct PROFILE has drop {}
}