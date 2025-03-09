import { NetworkName } from "./types";

export type NetworkConfig = {
    packageId: string;
    registryId: string;
};

// These are placeholder IDs - you'll need to replace these with your own
// package and registry IDs after deploying your Tardinator contracts
export const PROFILE_IDS: Record<NetworkName, NetworkConfig> = {
    mainnet: {
        packageId: "", // Will be populated after deployment
        registryId: "", // Will be populated after deployment
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