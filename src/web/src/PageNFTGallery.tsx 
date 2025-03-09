import { TardinatorProfile } from "@tardinator/profile-sdk";
import { ADDRESS_REGEX } from "@polymedia/suitcase-core";
import { LinkToTardinator } from "@tardinator/suitcase-react";
import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { AppContext } from "./App";
import "./styles/SearchProfiles.less";

const addressRegex = new RegExp(ADDRESS_REGEX, "g");

export const PageProfileSearch: React.FC = () =>
{
    /* State */

    const {
        network,
        profileClient,
    } = useOutletContext<AppContext>();

    const [searchType, setSearchType] = useState<'address' | 'username'>('username');
    const [userInput, setUserInput] = useState<string>("");
    const [addressCount, setAddressCount] = useState<number>(0);
    const [results, setResults] = useState<Map<string, TardinatorProfile | null>|undefined>(undefined);
    const [errorMsg, setErrorMsg] = useState<string|null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [popularProfiles, setPopularProfiles] = useState<TardinatorProfile[]>([]);
    const [isLoadingPopular, setIsLoadingPopular] = useState<boolean>(true);

    /* Functions */

    useEffect(() => {
        document.title = "Tardinator Profile - Search";
        loadPopularProfiles();
    }, []);

    const loadPopularProfiles = async () => {
        setIsLoadingPopular(true);
        
        try {
            // This would be replaced with actual API call to get popular profiles
            // Simulating with mock data for now
            setTimeout(() => {
                setPopularProfiles([
                    {
                        id: "0xabc123",
                        name: "tardinator",
                        imageUrl: "https://placehold.co/200x200/FFE66D/000000?text=T",
                        description: "The original Tardinator",
                        owner: "0x1234567890abcdef",
                        xTwitter: "tardinator",
                        telegram: "tardinator_official"
                    },
                    {
                        id: "0xdef456",
                        name: "suifan",
                        imageUrl: "https://placehold.co/200x200/FF6B6B/000000?text=S",
                        description: "Sui ecosystem supporter",
                        owner: "0xabcdef1234567890",
                        xTwitter: "suifan",
                        telegram: "suifan_22"
                    },
                    {
                        id: "0xghi789",
                        name: "cryptolover",
                        imageUrl: "https://placehold.co/200x200/68D391/000000?text=C",
                        description: "Crypto enthusiast and NFT collector",
                        owner: "0x7890abcdef123456",
                        xTwitter: "crypto_lover",
                        telegram: "crypto_lover"
                    }
                ]);
                setIsLoadingPopular(false);
            }, 1000);
        } catch (err) {
            console.warn("[loadPopularProfiles]", err);
            setIsLoadingPopular(false);
        }
    };

    useEffect(() => {
        if (searchType === 'address') {
            searchByAddress();
        } else {
            searchByUsername();
        }
    }, [userInput, searchType]);

    const searchByAddress = async () => {
        setErrorMsg(null);
        setResults(undefined);
        const addresses = userInput.match(addressRegex) || [];
        setAddressCount(addresses.length);
        if (addresses.length === 0) {
            return;
        }
        setIsLoading(true);
        try {
            const profiles = await profileClient.getProfilesByOwner(addresses);
            setResults(profiles);
        } catch (err) {
            console.warn("[searchByAddress]", err);
            setErrorMsg(String(err));
        } finally {
            setIsLoading(false);
        }
    };

    const searchByUsername = async () => {
        if (!userInput || userInput.length < 3) {
            setResults(undefined);
            return;
        }
        
        setErrorMsg(null);
        setIsLoading(true);
        
        try {
            // This would be replaced with actual username search API
            // Simulating for now
            setTimeout(() => {
                // Create dummy results that match the username search
                const searchResults = new Map<string, TardinatorProfile | null>();
                
                if (userInput.toLowerCase().includes('tard')) {
                    searchResults.set("0x1111", {
                        id: "0x1111",
                        name: "tardinator_official",
                        imageUrl: "https://placehold.co/200x200/FFE66D/000000?text=T",
                        description: "Official Tardinator account",
                        owner: "0x1111222233334444",
                        xTwitter: "tardinator_app",
                        telegram: "tardinator_app"
                    });
                }
                
                if (userInput.toLowerCase().includes('crypto')) {
                    searchResults.set("0x2222", {
                        id: "0x2222",
                        name: "cryptomaster",
                        imageUrl: "https://placehold.co/200x200/FF6B6B/000000?text=C",
                        description: "Crypto enthusiast",
                        owner: "0x2222333344445555",
                        xTwitter: "crypto_master",
                        telegram: null
                    });
                }
                
                setResults(searchResults);
                setIsLoading(false);
            }, 800);
        } catch (err) {
            console.warn("[searchByUsername]", err);
            setErrorMsg(String(err));
            setIsLoading(false);
        }
    };

    const onUserInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserInput(e.target.value);
    };

    const toggleSearchType = () => {
        setSearchType(searchType === 'address' ? 'username' : 'address');
        setUserInput('');
        setResults(undefined);
    };

    /* HTML */

    const ProfileCard: React.FC<{
        profile: TardinatorProfile | null;
        address?: string;
    }> = ({
        profile,
        address,
    }) => {
        if (!profile) {
            return (
                <div className="profile-card no-profile">
                    <div className="profile-card-content">
                        <div className="profile-card-address">
                            <LinkToTardinator network={network} kind="address" addr={address || ""} />
                        </div>
                        <div className="profile-card-message">No profile found</div>
                    </div>
                </div>
            );
        }
        
        return (
            <Link to={`/view/${profile.id}`} className="profile-card">
                <div className="profile-card-image">
                    <img src={profile.imageUrl || "/img/anon.webp"} alt={profile.name} />
                </div>
                <div className="profile-card-content">
                    <div className="profile-card-name">{profile.name}</div>
                    {profile.description && (
                        <div className="profile-card-description">{profile.description}</div>
                    )}
                    <div className="profile-card-social">
                        {profile.xTwitter && (
                            <a 
                                href={`https://x.com/${profile.xTwitter}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="profile-social-link"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <span className="social-icon">𝕏</span>
                            </a>
                        )}
                        {profile.telegram && (
                            <a 
                                href={`https://t.me/${profile.telegram}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="profile-social-link"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <span className="social-icon">✈️</span>
                            </a>
                        )}
                    </div>
                </div>
            </Link>
        );
    };

    return <div id="page" className="page-search-profiles">
        <h1>FIND TARDINATORS</h1>

        <div className="search-container">
            <div className="search-tabs">
                <button 
                    className={`search-tab ${searchType === 'username' ? 'active' : ''}`}
                    onClick={() => setSearchType('username')}
                >
                    Search by Username
                </button>
                <button 
                    className={`search-tab ${searchType === 'address' ? 'active' : ''}`}
                    onClick={() => setSearchType('address')}
                >
                    Search by Address
                </button>
            </div>

            <div className="search-form">
                <div className="form-field">
                    <input
                        value={userInput}
                        type="text"
                        spellCheck="false" 
                        autoCorrect="off" 
                        autoComplete="off"
                        onChange={onUserInputChange}
                        placeholder={searchType === 'address' ? 
                            "Enter Sui addresses" : 
                            "Search by username (min 3 characters)"}
                    />
                    {searchType === 'address' && addressCount > 0 && (
                        <div className="input-info">
                            {addressCount} address{addressCount !== 1 && "es"}
                        </div>
                    )}
                </div>
                {isLoading && <div className="search-loading">Searching Tardinator profiles...</div>}
            </div>
        </div>

        {results && results.size > 0 && (
            <div className="search-results">
                <h2>SEARCH RESULTS</h2>
                <div className="profile-grid">
                    {Array.from(results.entries()).map(([addressOrId, profile]) => (
                        <ProfileCard key={addressOrId} profile={profile} address={addressOrId} />
                    ))}
                </div>
            </div>
        )}
        
        {results && results.size === 0 && (
            <div className="no-results">
                <h2>No profiles found</h2>
                <p>Try a different search term or create your own Tardinator profile!</p>
                <Link to="/manage" className="btn create-profile-btn">Create Profile</Link>
            </div>
        )}

        {errorMsg && <div className="error-message">{errorMsg}</div>}

        {(!results || results.size === 0) && !isLoading && !errorMsg && (
            <div className="popular-profiles">
                <h2>POPULAR TARDINATORS</h2>
                {isLoadingPopular ? (
                    <div className="loading-popular">Loading popular profiles...</div>
                ) : (
                    <div className="profile-grid">
                        {popularProfiles.map(profile => (
                            <ProfileCard key={profile.id} profile={profile} />
                        ))}
                    </div>
                )}
            </div>
        )}
    </div>;
};