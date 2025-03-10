import { bcs } from "@mysten/sui.js/bcs";

export type NetworkName =  "mainnet" | "testnet" | "devnet" | "localnet";

/**
 * Represents a `tardinator_profile::profile::Profile` Sui object
 */
export type TardinatorProfile = {
    id: string;
    name: string;
    imageUrl: string;
    description: string;
    xAccount: string;
    telegram: string;
    data: unknown;
    owner: string;
};

const BcsAddressType = bcs.bytes(32).transform({
    input: (val: string) => fromHEX(val),
    output: (val) => toHEX(val),
});

export type LookupResults = typeof BcsLookupResults.$inferType;

export const BcsLookupResults = bcs.vector(
    bcs.struct("LookupResult", {
        lookup_addr: BcsAddressType,
        profile_addr: BcsAddressType,
    })
);

// Helper functions for BCS serialization
function fromHEX(hexStr: string): Uint8Array {
    hexStr = hexStr.startsWith('0x') ? hexStr.substring(2) : hexStr;
    if (hexStr.length % 2 !== 0) {
        hexStr = '0' + hexStr;
    }
    
    const buffer = new Uint8Array(hexStr.length / 2);
    for (let i = 0; i < buffer.length; i++) {
        const byteValue = parseInt(hexStr.substring(i * 2, i * 2 + 2), 16);
        buffer[i] = byteValue;
    }
    
    return buffer;
}

function toHEX(bytes: Uint8Array): string {
    return Array.from(bytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}