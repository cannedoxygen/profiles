/// Utility functions for Tardinator Profile SDK

import { SuiClient, SuiExecutionResult } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";

/**
 * Split an array into multiple chunks of a certain size.
 */
export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        const chunk = array.slice(i, i + chunkSize);
        chunks.push(chunk);
    }
    return chunks;
}

/**
 * Call `SuiClient.devInspectTransactionBlock()` and return the results.
 */
export async function devInspectAndGetResults(
    suiClient: SuiClient,
    tx: Transaction,
    sender = "0x7777777777777777777777777777777777777777777777777777777777777777",
): Promise<SuiExecutionResult[]> {
    const resp = await suiClient.devInspectTransactionBlock({
        sender: sender,
        transactionBlock: tx,
    });
    if (resp.error) {
        throw Error(`response error: ${JSON.stringify(resp, null, 2)}`);
    }
    if (!resp.results?.length) {
        throw Error(`response has no results: ${JSON.stringify(resp, null, 2)}`);
    }
    return resp.results;
}

/**
 * Check if a string is a valid Sui address.
 */
export function isValidSuiAddress(address: string): boolean {
    // Sui addresses start with 0x and are followed by 64 hex characters
    return /^0x[a-fA-F0-9]{64}$/.test(address);
}

/**
 * Utility function to validate name for Tardinator profiles
 */
export function isValidTardinatorName(name: string): boolean {
    // Enforce username requirements:
    // 1. Between 3-20 characters
    // 2. Only alphanumeric characters and underscores
    // 3. Cannot start with a number
    if (!name || name.length < 3 || name.length > 20) {
        return false;
    }
    
    // Cannot start with a number
    if (/^[0-9]/.test(name)) {
        return false;
    }
    
    // Only alphanumeric and underscores
    return /^[a-zA-Z0-9_]+$/.test(name);
}

/**
 * Utility function to format social media handles
 */
export function formatXHandle(handle: string): string {
    // Remove @ if present
    return handle.startsWith('@') ? handle.substring(1) : handle;
}

/**
 * Utility function to get full URL for X/Twitter profile
 */
export function getXProfileUrl(handle: string): string {
    const formattedHandle = formatXHandle(handle);
    return `https://x.com/${formattedHandle}`;
}

/**
 * Utility function to get full URL for Telegram profile
 */
export function getTelegramProfileUrl(handle: string): string {
    // Remove @ if present
    const formattedHandle = handle.startsWith('@') ? handle.substring(1) : handle;
    return `https://t.me/${formattedHandle}`;
}