import { TardinatorProfile } from "@tardinator/profile-sdk";
import { LinkToTardinator } from "@tardinator/suitcase-react";
import { useEffect, useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import { AppContext } from "./App";
import { notifyError } from "./components/Notification";
import "./styles/ViewProfile.less";

export const PageProfileView: React.FC = () =>
{
    /* State */

    const profileId: string = useParams().profileId || "";

    const {
        network,
        profileClient,
    } = useOutletContext<AppContext>();

    const [profile, setProfile] = useState<TardinatorProfile|null|undefined>(undefined);
    const [nfts, setNfts] = useState<Array<{id: string, name: string, imageUrl: string}>>([]);
    const [balance, setBalance] = useState<string>("0.00");
    const [isLoadingAssets, setIsLoadingAssets] = useState<boolean>(false);

    /* Functions */

    useEffect(() => {
        document.title = "Tardinator Profile - View";
        loadProfile();
    }, []);

    const loadProfile = async (): Promise<void> => {
        return await profileClient.getProfileById(profileId)
        .then((profile: TardinatorProfile|null) => {
            setProfile(profile);
            if (!profile) {
                const errorString = "Profile does not exist with ID: " + profileId;
                console.warn("[loadProfile]", errorString);
                notifyError(errorString);
            } else {
                console.debug("[loadProfile] Viewing profile:", profile);
                // If profile exists, load assets
                loadAssets(profile.owner);
            }
        })
        .catch(err => {
            setProfile(null);
            console.warn("[loadProfile]", err);
            notifyError(String(err));
        });
    };
    
    const loadAssets = async (ownerAddress: string): Promise<void> => {
        setIsLoadingAssets(true);
        
        try {
            // This would be replaced with actual API calls to fetch balance and NFTs
            // Simulating for now
            setTimeout(() => {
                // Simulate balance (would be fetched from Sui RPC)
                setBalance((Math.random() * 100).toFixed(2));
                
                // Simulate NFT collection (would be fetched from Sui RPC)
                setNfts([
                    {
                        id: "0x123...abc",
                        name: "Tardinator #1234",
                        imageUrl: "https://placehold.co/400x400/FFE66D/000000?text=NFT+1"
                    },
                    {
                        id: "0x456...def",
                        name: "Sui Legends #567",
                        imageUrl: "https://placehold.co/400x400/FF6B6B/000000?text=NFT+2"
                    },
                    {
                        id: "0x789...ghi",
                        name: "CryptoArt #42",
                        imageUrl: "https://placehold.co/400x400/68D391/000000?text=NFT+3"
                    }
                ]);
                
                setIsLoadingAssets(false);
            }, 1000);
        } catch (err) {
            console.warn("[loadAssets]", err);
            setIsLoadingAssets(false);
        }
    };

    /* HTML */

    let view: React.ReactNode;

    if (profile === undefined) {
        view = (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <div>Loading profile data...</div>
            </div>
        );
    }
    else if (profile === null) {
        view = (
            <div className="profile-not-found">
                <h2>Profile Not Found</h2>
                <p>The Tardinator profile you're looking for doesn't exist or has been removed.</p>
            </div>
        );
    }
    else {
        view = (
            <div className="profile-container">
                <div className="profile-header">
                    <div className="profile-image-container">
                        <img 
                            src={profile.imageUrl || "/img/anon.webp"} 
                            alt={profile.name} 
                            className="profile-image"
                        />
                    </div>
                    
                    <div className="profile-info">
                        <h2 className="profile-name">{profile.name}</h2>
                        
                        {profile.description && (
                            <p className="profile-description">{profile.description}</p>
                        )}
                        
                        <div className="profile-social">
                            {profile.xTwitter && (
                                <a 
                                    href={`https://x.com/${profile.xTwitter}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="profile-social-link twitter"
                                >
                                    <span className="social-icon">𝕏</span>
                                    <span className="social-name">@{profile.xTwitter}</span>
                                </a>
                            )}
                            
                            {profile.telegram && (
                                <a 
                                    href={`https://t.me/${profile.telegram}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="profile-social-link telegram"
                                >
                                    <span className="social-icon">✈️</span>
                                    <span className="social-name">@{profile.telegram}</span>
                                </a>
                            )}
                        </div>
                    </div>
                </div>
                
                <div className="profile-details">
                    <div className="profile-section-wallet">
                        <h3 className="section-title">Wallet</h3>
                        <div className="wallet-address">
                            Owner: <LinkToTardinator network={network} kind="address" addr={profile.owner} />
                        </div>
                        <div className="wallet-balance">
                            <span className="balance-amount">{balance}</span>
                            <span className="balance-currency">SUI</span>
                        </div>
                    </div>
                    
                    <div className="profile-section-registry">
                        <h3 className="section-title">On-Chain Data</h3>
                        <div className="registry-details">
                            <div>
                                Profile ID: <LinkToTardinator network={network} kind="object" addr={profile.id} />
                            </div>
                            <div>
                                Registry: <LinkToTardinator network={network} kind="object" addr={profileClient.registryId} />
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="profile-section-nfts">
                    <h3 className="section-title">NFT Collection</h3>
                    
                    {isLoadingAssets ? (
                        <div className="loading-assets">
                            <div className="loading-spinner small"></div>
                            <div>Loading NFT collection...</div>
                        </div>
                    ) : nfts.length > 0 ? (
                        <div className="nft-grid">
                            {nfts.map(nft => (
                                <div className="nft-item" key={nft.id}>
                                    <div className="nft-image-container">
                                        <img src={nft.imageUrl} alt={nft.name} className="nft-image" />
                                    </div>
                                    <div className="nft-details">
                                        <div className="nft-name">{nft.name}</div>
                                        <div className="nft-id">{nft.id}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="no-nfts">
                            No NFTs found in this wallet
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div id="page" className="page-view-profile">
            {view}
        </div>
    );
};