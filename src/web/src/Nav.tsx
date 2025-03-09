import { useCurrentAccount, useDisconnectWallet } from "@mysten/dapp-kit";
import { TardinatorProfile } from "@tardinator/profile-sdk";
import { NetworkName, shortenSuiAddress } from "@polymedia/suitcase-core";
import { NetworkSelector, isLocalhost } from "@polymedia/suitcase-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { supportedNetworks } from "./App";
import "./styles/Nav.less";

export const Nav: React.FC<{
    network: NetworkName;
    openConnectModal: () => void;
    profile: TardinatorProfile|null|undefined;
}> = ({
    network,
    openConnectModal,
    profile,
}) =>
{
    const currentAccount = useCurrentAccount();

    const [showMobileNav, setShowMobileNav] = useState(false);
    const toggleMobileNav = () => { setShowMobileNav(!showMobileNav); };
    const closeMobileNav  = () => { setShowMobileNav(false); };
    const showNetworkSelector = isLocalhost();

    return <header id="nav">
        <div id="mobile-menu-btn-wrap" onClick={toggleMobileNav}>
            <span id="mobile-menu-btn">☰</span>
        </div>

        <div id="nav-logo" className="nav-section">
            <Link to="/" id="nav-logo-link" onClick={closeMobileNav}>
                <img id="nav-logo-img" src="/img/tardinator-logo.webp" alt="Tardinator logo" />
                <span id="nav-logo-txt">
                    <span id="nav-title-tardinator">TARDINATOR</span>
                    <span id="nav-title-profile">PROFILE</span>
                </span>
            </Link>
        </div>

        <div id="nav-sections-wrap" className={showMobileNav ? "open" : ""}>
            <div id="nav-user" className="nav-section">
            {
                !currentAccount
                ?
                <span id="nav-btn-connect" onClick={openConnectModal}>
                    LOG IN
                </span>
                :
                <NavProfile profile={profile} />
            }
            {showNetworkSelector && <NetworkSelector currentNetwork={network} supportedNetworks={supportedNetworks} />}
            </div>

            <div id="nav-pages" className="nav-section">
                <div className="nav-page-link">
                    <Link to="/" onClick={closeMobileNav}>HOME</Link>
                </div>
                <div className="nav-page-link">
                    <Link to="/manage" onClick={closeMobileNav}>PROFILE</Link>
                </div>
                <div className="nav-page-link">
                    <Link to="/search" onClick={closeMobileNav}>SEARCH</Link>
                </div>
                <div className="nav-page-link">
                    <Link to="/docs" onClick={closeMobileNav}>DOCS</Link>
                </div>
                <div className="nav-page-link">
                    <Link to="/nfts" onClick={closeMobileNav}>MY NFTS</Link>
                </div>
            </div>

            <div id="nav-socials" className="nav-section">
                <div className="nav-social-link">
                    <a href="https://github.com/tardinator/tardinator-profile" target="_blank" rel="noopener noreferrer">Github</a>
                </div>
                <div className="nav-social-link">
                    <a href="https://twitter.com/tardinator_app" target="_blank" rel="noopener noreferrer">Twitter</a>
                </div>
                <div className="nav-social-link">
                    <a href="https://t.me/tardinator" target="_blank" rel="noopener noreferrer">Telegram</a>
                </div>
            </div>

            <div id="nav-watermark" className="nav-section">
                <div className="nav-social-link">
                    <a href="https://tardinator.app" target="_blank" rel="noopener noreferrer">Tardinator {new Date().getFullYear()}</a>
                </div>
            </div>
        </div>

    </header>;
};

const NavProfile: React.FC<{
    profile: TardinatorProfile|null|undefined;
}> = ({profile}) =>
{
    const currentAccount = useCurrentAccount();
    const { mutate: disconnect } = useDisconnectWallet();

    if (!currentAccount) {
        return <></>;
    }

    if (profile === undefined) {
        return <>Loading...</>;
    }

    // Calculate SUI balance for display (in the real implementation this would come from props)
    const suiBalance = "10.52";

    return <div id="nav-profile" onClick={() => { disconnect(); }}>
        <div id="nav-profile-image-wrap">
            <img src={(profile?.imageUrl) || "/img/anon.webp"} />
        </div>
        <div id="nav-profile-info-wrap">
            <div id="nav-profile-name">{ profile ? profile.name : "Unnamed Tardinator" }</div>
            <div id="nav-profile-address">{shortenSuiAddress(currentAccount.address)}</div>
            {profile && <div id="nav-profile-balance">{suiBalance} SUI</div>}
        </div>
    </div>;
};