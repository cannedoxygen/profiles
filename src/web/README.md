# Tardinator Profile Hub

![Tardinator Profile Hub](./src/web/public/img/open-graph.webp)

Tardinator Profile Hub is a fully on-chain identity system built on Sui. It lets Tardinator enthusiasts create and manage their unique on-chain profiles tied to their Sui wallet address, showcasing their alias, profile image, social media handles, and on-chain assets.

- Sui Move package: [./src/sui/](./src/sui/)
- TypeScript SDK: [./src/sdk/](./src/sdk/)
- Web interface: [./src/web/](./src/web/)

## Key Features

1. **Unique Identity**: Create your unique Tardinator alias permanently linked to your Sui wallet.

2. **Profile Customization**: Upload your profile picture and share your social media handles.

3. **Asset Visibility**: Display your SUI token balance and NFT collections directly on your profile.

4. **Community Exploration**: Search and discover other Tardinators in the community.

5. **On-Chain Security**: All profile data is stored securely on the Sui blockchain.

## Technical Details

### On-Chain Smart Contract Architecture

The Tardinator Profile Hub uses the following key data structures:

```move
struct TardinatorProfile has key {
    owner: address,             // Sui wallet address of the user
    name: vector<u8>,           // Tardinator alias
    image_url: vector<u8>,      // URL to profile image on IPFS/Arweave
    description: vector<u8>,    // Profile description
    data: vector<u8>,           // JSON string for additional profile data
}
```

Every profile is permanently attached to the Sui address that created it. Profiles cannot be transferred.

### TypeScript SDK

The TypeScript SDK facilitates third-party integrations with Tardinator Profile Hub:

```typescript
// Initialize the client
const profileClient = new ProfileClient(
    "mainnet",
    new SuiClient({url: 'https://your_rpc_endpoint'})
);

// Get a profile by owner address
const profile = await profileClient.getProfileByOwner('0x_USER_ADDRESS');
```

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm 9.x
- A Sui wallet 

### Local Development

```bash
# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

### Building for Production

```bash
# Build all packages
pnpm build

# Deploy to production
pnpm deploy-prod
```

## Community

Join the Tardinator community:

- Twitter: [@Tardionmoon](https://twitter.com/Tardionmoon)
- Telegram: [TardinatorPortal](https://t.me/Tardionmoon)

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](./LICENSE) file for details.