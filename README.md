# TokenForge - Create and Deploy ERC-20 Tokens

TokenForge is a comprehensive platform for creating and deploying professional-grade ERC-20/BEP-20 tokens across multiple blockchains. With an intuitive interface and advanced features, TokenForge makes token creation accessible to everyone, regardless of technical expertise.

## Features

- **No-Code Token Creation**: Create tokens with advanced features without writing a single line of code
- **Multi-Chain Support**: Deploy on Ethereum, BSC, Polygon, Arbitrum, Fantom, Avalanche, and more
- **Advanced Token Features**:
  - Burnable tokens
  - Mintable supply
  - Transfer fees & taxes
  - Holder redistribution
  - Token vesting & locking
- **Presale & Private Sale**: Launch token sales with customizable parameters
- **Mobile Responsive**: Fully responsive design works on all devices
- **Self-Hosted**: No external APIs, fully client-side deployment

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/tokenforge.git
cd tokenforge

# Install dependencies
npm install

# Start the development server
npm run dev
```

## Usage

### 1. Connect Your Wallet

- Click the "Connect Wallet" button in the top right corner
- Select your wallet provider (MetaMask, WalletConnect, etc.)
- Approve the connection request

### 2. Create a Token

1. Click "Start Building" on the home page
2. Configure your token parameters:
   - Token name and symbol
   - Initial and max supply
   - Decimals
   - Select network
3. Choose token features:
   - Burnable
   - Mintable
   - Transfer fees
   - Holder redistribution
4. Configure vesting schedules (optional)
5. Review and deploy

### 3. Launch a Sale

1. Click "Launch Sale" on the home page
2. Select sale type (Presale or Private Sale)
3. Select your token
4. Configure sale parameters:
   - Soft cap and hard cap
   - Token price
   - Min/max purchase
   - Start and end dates
5. Set up vesting (optional)
6. Configure wallet addresses
7. Review and deploy

## Deployment Methods

### Method 1: Direct Deployment (Default)

The platform uses Web3 to deploy contracts directly from your browser:

1. Connect your wallet
2. Configure token parameters
3. Click "Deploy Token"
4. Confirm the transaction in your wallet
5. Wait for deployment and verification

### Method 2: Remix IDE (Fallback)

If direct deployment fails, you can use Remix IDE:

1. Click "Deploy with Remix" on the error screen
2. Open [Remix IDE](https://remix.ethereum.org)
3. Create a new file with the contract code provided
4. Compile the contract (Solidity 0.8.19+)
5. Deploy with the constructor parameters shown
6. Verify the contract on the blockchain explorer

#### Remix Deployment Steps

1. **Open Remix IDE**: Go to [remix.ethereum.org](https://remix.ethereum.org)
2. **Create Contract File**: Create a new file (e.g., `MyToken.sol`)
3. **Copy Contract Code**: Copy the contract code from the TokenForge interface
4. **Compile Contract**: Select Solidity compiler 0.8.19+ and compile
5. **Deploy Contract**: 
   - Select "Injected Web3" environment
   - Enter constructor parameters in the correct order
   - Click "Deploy" and confirm in your wallet
6. **Verify Contract**: Use the blockchain explorer's verification tool

## ESR Token Requirements

- Mainnet deployments require 100 ESR tokens
- Testnet deployments are free
- ESR tokens are used for platform fees and are burned during deployment

## Supported Networks

### Mainnets
- Ethereum (ETH)
- Binance Smart Chain (BNB)
- Polygon (MATIC)
- Arbitrum (ETH)
- Fantom (FTM)
- Avalanche (AVAX)

### Testnets
- Estar Testnet (ESR)
- Ethereum Goerli (ETH)
- BSC Testnet (tBNB)
- Polygon Mumbai (MATIC)
- Arbitrum Sepolia (ETH)

## Troubleshooting

### Common Issues

1. **Transaction Failing**: 
   - Ensure you have enough native tokens for gas
   - Check that you have approved ESR token spending
   - Try increasing gas limit

2. **Contract Verification Failed**:
   - Use the manual verification option
   - Ensure compiler version matches (0.8.19+)
   - Check that constructor arguments are correct

3. **Wallet Connection Issues**:
   - Refresh the page
   - Clear browser cache
   - Try a different browser

### Using Remix IDE

If automatic deployment fails:

1. Copy the contract code provided
2. Follow the Remix deployment steps above
3. Use the exact constructor parameters shown
4. Deploy with the same wallet address

## License

MIT License