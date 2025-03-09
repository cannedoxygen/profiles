import { makePolymediaUrl } from "@polymedia/suitcase-core";
import { useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { AppContext } from "./App";

export const PageDocs: React.FC = () =>
{
    useEffect(() => {
        document.title = "Tardinator Profile - Docs";
    }, []);

    const { network, profileClient } = useOutletContext<AppContext>();

    return <div id="page" className="page-about">
        <h1>
            DOCS
        </h1>

        <p>
            The code and technical docs can be found on the <a href="https://github.com/cannedoxygen/profiles" target="_blank" rel="noopener noreferrer">GitHub repo</a>:
        </p>
        <ul>
            <li><a href="https://github.com/cannedoxygen/profilestree/main/sui" target="_blank" rel="noopener noreferrer">Sui Move package</a>: the on-chain profile system.</li>

            <li><a href="https://github.com/cannedoxygen/profilestree/main/sdk" target="_blank" rel="noopener noreferrer">TypeScript SDK</a>: a library to integrate with the profile system.</li>

            <li><a href="https://github.com/cannedoxygen/profilestree/main/web" target="_blank" rel="noopener noreferrer">Web interface</a>: the website you're on right now.</li>
        </ul>

        <p>
            Key features of the Tardinator Profile system:
        </p>
        <ol>
            <li>Unique usernames ensure your Tardinator alias is <b>exclusively yours</b>.</li>

            <li>Profiles are permanently attached to the Sui wallet address that created them and are <b>not transferable</b>.</li>

            <li>Integration with social platforms like X (Twitter) and Telegram to establish your online presence.</li>

            <li>Display your on-chain assets and NFT collections directly on your profile.</li>

            <li>Profiles can be used <b>anywhere</b> on Sui. There is a TypeScript SDK to facilitate third-party integrations.</li>

            <li>Profiles are <b>free</b> to use with no cost associated with registering one (aside from network fees).</li>
        </ol>

    </div>;
};