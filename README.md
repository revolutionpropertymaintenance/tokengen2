# TokenForge - Create and Deploy ERC-20 Tokens

TokenForge is a comprehensive platform for creating and deploying professional-grade ERC-20/BEP-20 tokens across multiple blockchains. With an intuitive interface and advanced features, TokenForge makes token creation accessible to everyone, regardless of technical expertise.

## Theme Colors and CSS

### Global Theme Colors
```css
/* Primary Gradients */
.primary-gradient {
  background-image: linear-gradient(to right, from-blue-500 to-purple-600);
}

.secondary-gradient {
  background-image: linear-gradient(to right, from-green-500 to-blue-600);
}

/* Background Colors */
.page-background {
  background-image: linear-gradient(to bottom right, from-slate-900 via-purple-900 to-slate-900);
}

.card-background {
  background-color: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Status Colors */
.status-live {
  color: #4ade80; /* text-green-400 */
  background-color: rgba(74, 222, 128, 0.2); /* bg-green-500/20 */
}

.status-upcoming {
  color: #60a5fa; /* text-blue-400 */
  background-color: rgba(96, 165, 250, 0.2); /* bg-blue-500/20 */
}

.status-ended {
  color: #9ca3af; /* text-gray-400 */
  background-color: rgba(156, 163, 175, 0.2); /* bg-gray-500/20 */
}

.status-cancelled {
  color: #f87171; /* text-red-400 */
  background-color: rgba(248, 113, 113, 0.2); /* bg-red-500/20 */
}
```

### Page-Specific Themes

#### Landing Page
```css
.landing-page {
  background-image: linear-gradient(to bottom right, from-slate-900 via-purple-900 to-slate-900);
}

.hero-heading {
  font-size: 5rem;
  font-weight: 700;
  color: white;
}

.hero-gradient-text {
  background-image: linear-gradient(to right, from-blue-400 to-purple-400);
  background-clip: text;
  color: transparent;
}

.feature-card {
  background-color: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  padding: 2rem;
}

.feature-icon {
  width: 3rem;
  height: 3rem;
  background-image: linear-gradient(to right, from-blue-500 to-purple-600);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}
```

#### Token Builder
```css
.token-builder {
  background-image: linear-gradient(to bottom right, from-slate-900 via-purple-900 to-slate-900);
}

.form-section {
  background-color: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  padding: 2rem;
  margin-bottom: 2rem;
}

.form-input {
  width: 100%;
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  color: white;
}

.network-card {
  padding: 1rem;
  border-radius: 0.5rem;
  border: 2px solid rgba(255, 255, 255, 0.2);
  background-color: rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: all 0.2s;
}

.network-card.selected {
  border-color: #3b82f6; /* border-blue-500 */
  background-color: rgba(59, 130, 246, 0.2); /* bg-blue-500/20 */
  box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.25); /* shadow-lg shadow-blue-500/25 */
}

.warning-banner {
  background-color: rgba(245, 158, 11, 0.2); /* bg-amber-500/20 */
  border: 1px solid rgba(245, 158, 11, 0.5); /* border-amber-500/50 */
  border-radius: 0.75rem;
  padding: 1.5rem;
}
```

#### Vesting Configuration
```css
.vesting-page {
  background-image: linear-gradient(to bottom right, from-slate-900 via-purple-900 to-slate-900);
}

.vesting-card {
  background-color: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  overflow: hidden;
}

.vesting-card-header {
  padding: 1.5rem;
}

.vesting-icon {
  width: 2.5rem;
  height: 2.5rem;
  background-image: linear-gradient(to right, from-blue-500 to-purple-600);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.vesting-timeline {
  position: relative;
}

.timeline-dot {
  width: 1rem;
  height: 1rem;
  border-radius: 9999px;
}

.timeline-line {
  flex: 1;
  height: 0.125rem;
  background-image: linear-gradient(to right, from-green-500 to-blue-500);
}
```

#### Review & Deploy
```css
.review-page {
  background-image: linear-gradient(to bottom right, from-slate-900 via-purple-900 to-slate-900);
}

.summary-card {
  background-color: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.deploy-button {
  background-image: linear-gradient(to right, from-green-500 to-blue-600);
  color: white;
  padding: 0.75rem 2rem;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.deploy-button:hover {
  background-image: linear-gradient(to right, from-green-600 to-blue-700);
}

.cost-summary {
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 0.75rem;
  padding: 1.5rem;
}
```

#### Deployment Success
```css
.success-page {
  background-image: linear-gradient(to bottom right, from-slate-900 via-purple-900 to-slate-900);
}

.success-icon {
  width: 5rem;
  height: 5rem;
  background-image: linear-gradient(to right, from-green-500 to-blue-600);
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem auto;
}

.contract-details {
  background-color: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  padding: 2rem;
  margin-bottom: 2rem;
}

.code-display {
  display: flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  padding: 0.75rem;
}

.action-card {
  background-color: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  padding: 1.5rem;
}
```

#### My Tokens Dashboard
```css
.tokens-dashboard {
  background-image: linear-gradient(to bottom right, from-slate-900 via-purple-900 to-slate-900);
}

.stats-card {
  background-color: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  padding: 1.5rem;
}

.network-filter {
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: 2px solid rgba(255, 255, 255, 0.2);
  background-color: rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: all 0.2s;
}

.network-filter.active {
  border-color: #3b82f6; /* border-blue-500 */
  background-color: rgba(59, 130, 246, 0.2); /* bg-blue-500/20 */
}

.token-card {
  background-color: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 1rem;
}
```

#### My Sales Dashboard
```css
.sales-dashboard {
  background-image: linear-gradient(to bottom right, from-slate-900 via-purple-900 to-slate-900);
}

.sale-card {
  background-color: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.progress-bar-bg {
  width: 100%;
  background-color: #374151; /* bg-gray-700 */
  border-radius: 9999px;
  height: 0.5rem;
}

.progress-bar {
  background-image: linear-gradient(to right, from-blue-500 to-purple-600);
  height: 0.5rem;
  border-radius: 9999px;
  transition: width 0.3s;
}

.sale-icon {
  width: 3rem;
  height: 3rem;
  background-image: linear-gradient(to right, from-blue-500 to-purple-600);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

#### Presale Wizard
```css
.presale-wizard {
  background-image: linear-gradient(to bottom right, from-slate-900 via-purple-900 to-slate-900);
}

.wizard-progress {
  background-color: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.step-indicator {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-width: 2px;
}

.step-active {
  border-color: #60a5fa; /* border-blue-400 */
  background-color: rgba(96, 165, 250, 0.2); /* bg-blue-400/20 */
  color: #60a5fa; /* text-blue-400 */
}

.step-completed {
  border-color: #4ade80; /* border-green-400 */
  background-color: rgba(74, 222, 128, 0.2); /* bg-green-400/20 */
  color: #4ade80; /* text-green-400 */
}

.step-inactive {
  border-color: #9ca3af; /* border-gray-400 */
  background-color: rgba(156, 163, 175, 0.2); /* bg-gray-400/20 */
  color: #9ca3af; /* text-gray-400 */
}

.step-connector {
  width: 4rem;
  height: 0.125rem;
  flex-shrink: 0;
}

.connector-completed {
  background-color: #4ade80; /* bg-green-400 */
}

.connector-inactive {
  background-color: #4b5563; /* bg-gray-600 */
}
```

#### Sale Page
```css
.sale-page {
  background-image: linear-gradient(to bottom right, from-slate-900 via-purple-900 to-slate-900);
}

.sale-header {
  background-color: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sale-status-banner {
  border-radius: 0.75rem;
  padding: 1.5rem;
}

.sale-status-live {
  background-color: rgba(74, 222, 128, 0.2); /* bg-green-500/20 */
  border: 1px solid rgba(74, 222, 128, 0.5); /* border-green-500/50 */
}

.sale-status-upcoming {
  background-color: rgba(96, 165, 250, 0.2); /* bg-blue-500/20 */
  border: 1px solid rgba(96, 165, 250, 0.5); /* border-blue-500/50 */
}

.sale-status-ended {
  background-color: rgba(156, 163, 175, 0.2); /* bg-gray-500/20 */
  border: 1px solid rgba(156, 163, 175, 0.5); /* border-gray-500/50 */
}

.purchase-card {
  background-color: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  padding: 1.5rem;
  position: sticky;
  top: 1.5rem;
}

.buy-button {
  width: 100%;
  background-image: linear-gradient(to right, from-blue-500 to-purple-600);
  color: white;
  padding: 0.75rem;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.2s;
}
```

#### Sale Explorer
```css
.explorer-page {
  background-image: linear-gradient(to bottom right, from-slate-900 via-purple-900 to-slate-900);
}

.filter-bar {
  background-color: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.search-input {
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  padding-left: 2.5rem;
  padding-right: 1rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  color: white;
}

.sale-grid-card {
  background-color: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  padding: 1.5rem;
  transition: all 0.2s;
}

.sale-grid-card:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.view-sale-button {
  width: 100%;
  background-image: linear-gradient(to right, from-blue-500 to-purple-600);
  color: white;
  padding: 0.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

## Page Themes and Design

### Landing Page
The landing page features a dark gradient background (slate-900 to purple-900) with a modern, sleek design. It includes:
- Hero section with a large, bold headline and gradient text accents
- Feature cards with icon illustrations in a 3-column layout
- Network support section with blockchain logos
- Token features section with a two-column layout
- Call-to-action section with gradient buttons

### Token Builder
The token builder maintains the dark gradient theme with:
- Step-by-step form layout with clear section separation
- Input fields with dark backgrounds and light text
- Network selection grid with hover effects
- Feature toggles with expandable configuration options
- Warning notifications with amber/yellow accents

### Vesting Configuration
The vesting page features:
- Visual timeline representation of vesting schedules
- Category cards with gradient icons
- Percentage and date input fields
- Real-time calculation displays with colored accent cards
- Quick preset buttons for common vesting periods

### Review & Deploy
The review page includes:
- Two-column layout with main content and sidebar
- Summary cards for token details, features, and vesting
- Cost estimation panel with network details
- Final warning notification with amber/red accents
- Terms acceptance checkbox and deploy button with gradient

### Deployment Success
The success page features:
- Large success icon with green gradient
- Contract details in formatted panels
- Copy buttons for addresses and transaction hashes
- Quick action buttons for viewing on explorer and sharing
- Next steps cards with icon illustrations

### My Tokens
The tokens dashboard includes:
- Stats overview cards at the top
- Network filter buttons with token counts
- Search and filter controls
- Token cards with network icons and status indicators
- Progress indicators and token details

### My Sales
The sales dashboard features:
- Stats overview with raised amounts and participant counts
- Sale cards with progress bars and status indicators
- Detailed information panels for each sale
- Action buttons for management functions
- Filter and search controls with sorting options

### Presale Wizard
The presale creation wizard includes:
- Progress indicator at the top showing all steps
- Step-specific forms with validation
- Preview panels showing calculated values
- Network selection with the same design as token builder
- Review page with deployment confirmation

### Sale Page
The public sale page features:
- Sale status banner with countdown timer
- Progress bar showing raised amount vs cap
- Token purchase interface with real-time calculation
- Sale details and token information panels
- Vesting schedule visualization if enabled

### Sale Explorer
The sale explorer page includes:
- Grid layout of available sales
- Filter and search controls
- Sale cards with progress indicators
- Status badges with appropriate colors
- Network and token information displays

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