/*
 _____  _    ____  ____ ___ _   _    _  _____  ___  ____  
|_   _|/ \  |  _ \|  _ \_ _| \ | |  / \|_   _|/ _ \|  _ \ 
  | | / _ \ | |_) | | | | ||  \| | / _ \ | | | | | | |_) |
  | |/ ___ \|  _ <| |_| | || |\  |/ ___ \| | | |_| |  _ < 
  |_/_/   \_\_| \_\____/___|_| \_/_/   \_\_|  \___/|_| \_\

  PROFILE HUB
*/

module tardinator_profile::profile
{
    use std::string::{Self, String, utf8};
    use std::vector;
    use sui::display::{Self};
    use sui::dynamic_field;
    use sui::dynamic_object_field;
    use sui::event;
    use sui::object::{Self, ID, UID};
    use sui::package::{Self};
    use sui::table::{Self, Table};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};

    /* Structs */

    struct Registry has key {
        id: UID,
        name: String,
        profiles: Table<address, address>,
        names: Table<String, address>, // For enforcing unique usernames
    }

    struct Profile has key {
        id: UID,
        name: String,             // Unique username
        image_url: String,
        description: String,
        x_account: String,        // X/Twitter handle
        telegram: String,         // Telegram username
        data: String,             // Additional profile data in JSON
    }

    /* Error constants */

    const ENameTaken: u64 = 100;
    const ECantRemoveLastRegistry: u64 = 102;  // You can remove this if not used

    /* Events */

    struct EventCreateRegistry has copy, drop {
        registry_id: ID,
    }

    struct EventCreateProfile has copy, drop {
        profile_id: ID,
        registry_id: ID,
    }

    /* Functions */

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
            names: table::new(ctx), // Initialize the name registry
        };
        transfer::share_object(registry);

        event::emit(EventCreateRegistry { registry_id });
    }

    /// Create a new Profile for the sender, and add it to a Registry.
    /// Aborts if the sender already has a Profile inside the Registry or the name is taken.
    public entry fun create_profile(
        registry: &mut Registry,
        name: vector<u8>,
        image_url: vector<u8>,
        description: vector<u8>,
        x_account: vector<u8>,
        telegram: vector<u8>,
        data: vector<u8>,
        ctx: &mut TxContext,
    ) {
        let username = utf8(name);
        
        // Check if username is taken
        assert!(!table::contains(&registry.names, username), ENameTaken);
        
        let profile_uid = object::new(ctx);
        let profile_id = object::uid_to_inner(&profile_uid);
        let profile_addr = object::uid_to_address(&profile_uid);
        let sender_addr = tx_context::sender(ctx);

        let profile = Profile {
            id: profile_uid,
            name: username,
            image_url: utf8(image_url),
            description: utf8(description),
            x_account: utf8(x_account),
            telegram: utf8(telegram),
            data: utf8(data),
        };
        
        // Register the profile in the registry
        table::add(&mut registry.profiles, sender_addr, profile_addr);
        
        // Register the username in the registry
        table::add(&mut registry.names, username, sender_addr);
        
        transfer::transfer(profile, sender_addr);

        event::emit(EventCreateProfile {
            profile_id,
            registry_id: object::id(registry),
        });
    }

    /// Add a Profile (and the sender) to a Registry.
    /// Aborts if the sender already has a Profile inside the Registry,
    /// or if the username is taken in the registry.
    public entry fun add_to_registry(
        registry: &mut Registry,
        profile: &mut Profile,
        ctx: &mut TxContext,
    ) {
        let sender_addr = tx_context::sender(ctx);
        let profile_addr = object::id_address(profile);
        
        // Check if username is taken
        assert!(!table::contains(&registry.names, profile.name), ENameTaken);
        
        table::add(&mut registry.profiles, sender_addr, profile_addr);
        table::add(&mut registry.names, profile.name, sender_addr);
    }

    public entry fun edit_profile(
        profile: &mut Profile,
        image_url: vector<u8>,
        description: vector<u8>,
        x_account: vector<u8>,
        telegram: vector<u8>,
        data: vector<u8>,
        _ctx: &mut TxContext,
    ) {
        // Note: We don't allow changing the name as it must remain unique
        profile.image_url = utf8(image_url);
        profile.description = utf8(description);
        profile.x_account = utf8(x_account);
        profile.telegram = utf8(telegram);
        profile.data = utf8(data);
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

    /// Check if a username is available (not taken) in the registry
    public fun is_username_available(
        registry: &Registry,
        name: vector<u8>,
    ): bool {
        let username = utf8(name);
        !table::contains(&registry.names, username)
    }

    /// Helper function for username validation
    fun validate_username(name: &String): bool {
        let bytes = *string::bytes(name);
        // Add your validation logic here
        // e.g., check length, allowed characters, etc.
        !vector::is_empty(&bytes) // Simple check that username is not empty
    }

    /// Aborts with `EFieldAlreadyExists` if the object already has that field with that name.
    public fun add_dynamic_field<Name: copy + drop + store, Value: store>(
        profile: &mut Profile,
        name: Name,
        value: Value,
    ) {
        dynamic_field::add(&mut profile.id, name, value);
    }

    /// Aborts with `EFieldDoesNotExist` if the object does not have a field with that name.
    /// Aborts with `EFieldTypeMismatch` if the field exists, but the value does not have
    /// the specified type.
    public fun remove_dynamic_field<Name: copy + drop + store, Value: store>(
        profile: &mut Profile,
        name: Name,
    ): Value {
        return dynamic_field::remove(&mut profile.id, name)
    }

    /// Aborts with `EFieldAlreadyExists` if the object already has that field with that name.
    public fun add_dynamic_object_field<Name: copy + drop + store, Value: key + store>(
        profile: &mut Profile,
        name: Name,
        value: Value,
    ) {
        dynamic_object_field::add(&mut profile.id, name, value);
    }

    /// Aborts with `EFieldDoesNotExist` if the object does not have a field with that name.
    /// Aborts with `EFieldTypeMismatch` if the field exists, but the value object does not have
    /// the specified type.
    public fun remove_dynamic_object_field<Name: copy + drop + store, Value: key + store>(
        profile: &mut Profile,
        name: Name,
    ): Value {
        return dynamic_object_field::remove(&mut profile.id, name)
    }

    // One-Time-Witness
    struct PROFILE has drop {}

    fun init(otw: PROFILE, ctx: &mut TxContext)
    {
        let publisher = package::claim(otw, ctx);

        let profile_display = display::new_with_fields<Profile>(
            &publisher,
            vector[
                utf8(b"name"),
                utf8(b"image_url"),
                utf8(b"description"),
                utf8(b"x_account"),
                utf8(b"telegram"),
                utf8(b"link"),
                utf8(b"creator"),
                utf8(b"project_name"),
                utf8(b"project_url"),
                utf8(b"project_image_url"),
            ], vector[
                utf8(b"{name}"), // name
                utf8(b"{image_url}"), // image_url
                utf8(b"{description}"), // description
                utf8(b"{x_account}"), // x_account
                utf8(b"{telegram}"), // telegram
                utf8(b"https://profile.tardinator.com/view/{id}"), // link
                utf8(b"https://tardinator.com"), // creator
                utf8(b"Tardinator Profile Hub"), // project_name
                utf8(b"https://profile.tardinator.com"), // project_url
                utf8(b"https://profile.tardinator.com/img/project_image.png"), // project_image_url
            ], ctx
        );

        display::update_version(&mut profile_display);

        transfer::public_transfer(publisher, tx_context::sender(ctx));
        transfer::public_transfer(profile_display, tx_context::sender(ctx));
    }
}