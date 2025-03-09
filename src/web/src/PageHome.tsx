import { useEffect } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { AppContext } from "./App";

export const PageHome: React.FC = () => {
    useEffect(() => {
        document.title = "Tardinator Profile - Home";
    }, []);

    const { network, profileClient } = useOutletContext<AppContext>();

    return (
        <div id="page" className="page-home">
            <h1>WELCOME TO TARDINATORS PROFILE HUB</h1>
            
            <div className="hero-section">
                <p className="tagline">
                    Your unique on-chain identity in the Tardinator ecosystem
                </p>

                <div className="feature-grid">
                    <div className="feature-card">
                        <h2>UNIQUE IDENTITY</h2>
                        <p>Create your exclusive Tardinator alias that no one else can claim</p>
                    </div>
                    
                    <div className="feature-card">
                        <h2>SOCIAL PRESENCE</h2>
                        <p>Link your X (Twitter) and Telegram accounts to your on-chain profile</p>
                    </div>
                    
                    <div className="feature-card">
                        <h2>ASSET SHOWCASE</h2>
                        <p>Display your SUI balance and NFT collection to the community</p>
                    </div>
                    
                    <div className="feature-card">
                        <h2>COMMUNITY</h2>
                        <p>Discover and connect with other Tardinators in the ecosystem</p>
                    </div>
                </div>
            </div>

            <p className="description">
                Tardinator Profile is a fully on-chain identity system on <a href="https://sui.io" target="_blank" rel="noopener noreferrer">Sui</a>. 
                Once created, your profile is permanently tied to your wallet address, giving you a 
                verifiable presence in the Tardinator community and beyond.
            </p>

            <div className="cta-buttons">
                <Link to="/manage" className="btn primary-btn">CREATE PROFILE</Link>
                <Link to="/search" className="btn secondary-btn">DISCOVER TARDINATORS</Link>
                <Link to="/docs" className="btn secondary-btn">READ DOCS</Link>
            </div>
            
            <div className="stats-banner">
                <div className="stat-item">
                    <span className="stat-number">137K+</span>
                    <span className="stat-label">Profiles Created</span>
                </div>
                <div className="stat-item">
                    <span className="stat-number">1</span>
                    <span className="stat-label">Profile Per Wallet</span>
                </div>
                <div className="stat-item">
                    <span className="stat-number">100%</span>
                    <span className="stat-label">On-Chain Data</span>
                </div>
            </div>
        </div>
    );
};