import { NetworkName } from "./types";

export type NetworkConfig = {
    packageId: string;
    registryId: string;
};

// These are placeholder IDs - you'll need to replace these with your own
// package and registry IDs after deploying your Tardinator contracts
export const PROFILE_IDS: Record<NetworkName, NetworkConfig> = {
    mainnet: {
        packageId: "0xeb3c317d64d128c6a34135a4811853fb14c523ddda5cea85f7b9ee1953d87cd7", // Will be populated after deployment
        registryId: "0x74113cbbd196a30cbb1fd3df26ab435677166db6b2bd96cd19f58ff6eca5d07d", // Will be populated after deployment
    },
    testnet: {
        packageId: "", // Will be populated after deployment
        registryId: "", // Will be populated after deployment
    },
    devnet: {
        packageId: "", // Will be populated after deployment
        registryId: "", // Will be populated after deployment
    },
    localnet: {
        packageId: "", // Will be populated after deployment
        registryId: "", // Will be populated after deployment
    },
};