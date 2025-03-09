import { NetworkName } from "./types.js";

export type NetworkConfig = {
    packageId: string;
    registryId: string;
};

export const TARDINATOR_IDS: Record<NetworkName, NetworkConfig> = {
    mainnet: {
        // These would be the mainnet addresses after you deploy your contract
        packageId: "0x0000000000000000000000000000000000000000000000000000000000000000",
        registryId: "0x0000000000000000000000000000000000000000000000000000000000000000",
    },
    testnet: {
        // These would be the testnet addresses after you deploy your contract
        packageId: "0x0000000000000000000000000000000000000000000000000000000000000000",
        registryId: "0x0000000000000000000000000000000000000000000000000000000000000000",
    },
    devnet: {
        // These would be the devnet addresses after you deploy your contract
        packageId: "0x0000000000000000000000000000000000000000000000000000000000000000",
        registryId: "0x0000000000000000000000000000000000000000000000000000000000000000",
    },
    localnet: {
        packageId: "",
        registryId: "",
    },
};