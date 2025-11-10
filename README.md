# PropChain

Property management platform with React frontend and Node.js backend.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

This installs both frontend and backend dependencies.

### 2. Configure Backend (Optional)

Create `server/.env` file:

```env
MYSQL_HOST=localhost
MYSQL_USERNAME=your_username
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=insurance
PORT=8000
```

**Note:** Server will start without database connection.

### 3. Run Project

```bash
npm start
```

This starts both:
- **Frontend** at `http://localhost:5173`
- **Backend API** at `http://localhost:8000`

## Available Scripts

- `npm run install:all` - Install all dependencies
- `npm start` - Run both frontend and backend

## Project Structure

```
propchain/
├── src/          # React frontend
├── server/       # Express backend
└── package.json  # Root package.json
```

## Wallet Connection (MetaMask) - What Was Implemented

### Overview
We added real MetaMask connection using `window.ethereum`, a wallet modal, global wallet state via React Context, and UI updates across the app. No heavy Web3 libraries were used.

### User Flow
- Click "Connect Wallet" in the navbar → opens a modal.
- Select "MetaMask" → prompts MetaMask connection via `eth_requestAccounts`.
- On success:
  - The modal shows the connected address.
  - Navbar button changes to the truncated address.
  - Dashboard shows wallet status, address, and a Disconnect action.
- If MetaMask is not installed → shows an install message with a link.
- Session is restored on refresh if the account is still authorized.

### Key Files and Responsibilities
- `src/contexts/WalletContext.tsx`
  - Centralized wallet state and actions:
    - `account`, `chainId`, `isConnecting`, `error`
    - `connect()`, `disconnect()`, `switchNetwork()`
  - Uses `window.ethereum.request` for:
    - `eth_requestAccounts`, `eth_accounts`, `eth_chainId`
  - Listens to:
    - `accountsChanged` to keep account in sync
    - `chainChanged` to keep chainId in sync
  - Persists account to `localStorage` and restores on load.
  - Exposes `targetChainId` and `isOnTargetNetwork` (Sepolia).

- `src/components/Wallet/WalletModal.tsx`
  - Modal UI listing MetaMask (only) with:
    - Install prompt when MetaMask not detected
    - Loading state while connecting
    - Success state showing connected address and truncated display
    - Inline error messages for rejections and failures
  - Ownership verification (see “Extra things we did”).

- `src/components/Layout/Navbar.tsx`
  - Uses wallet context to show:
    - "Connect Wallet" when disconnected
    - Truncated address when connected
  - Opens the wallet modal on click.

- `src/pages/DashboardPage.tsx`
  - Shows wallet status (Connected/Disconnected).
  - Displays the connected address when available.
  - Provides a "Disconnect Wallet" action.

- `src/components/Wallet/NetworkNotice.tsx`
  - Displays a subtle banner when connected to a non-target network.
  - Offers one-click network switching (see “Extra things we did”).

- `src/types/ethereum.d.ts`
  - Minimal EIP-1193 typings for `window.ethereum`.

- `src/utils/format.ts`
  - `truncateAddress(address)` helper for UI display.

### Error Handling
- User rejects connection (`code: 4001`) → `Connection request rejected`.
- No MetaMask / provider not found → `MetaMask not detected`.
- No accounts returned → explicit error.
- Network switch rejected or missing network add → user-friendly messages.

### UI/UX Details
- Wallet modal covers: install prompt, connecting, success, error states.
- Navbar button reflects connection state and shows the truncated address.
- Dashboard shows status, address, and allows disconnect.
- Network notice shows only when connected and on the wrong network.

## Extra things we did

1) Network detection and one-click network switching (Sepolia)
- Tracks `chainId` in context and computes `isOnTargetNetwork`.
- Shows a banner (`NetworkNotice`) if connected to the wrong network.
- One-click `wallet_switchEthereumChain` to switch to Sepolia.
- If the chain is missing (`4902`), we call `wallet_addEthereumChain` and switch.
- Why this is valuable: real-world dApp readiness, smooth UX, and a strong signal of provider mastery.

2) Ownership verification via message signing
- In the modal’s connected state, users can “Verify Ownership”.
- Generates a random nonce, requests `personal_sign`, then verifies with `personal_ecRecover`.
- Confirms the recovered address matches the connected account.
- Why this is valuable: demonstrates fundamental Web3 auth flow (without servers/contracts) and robust async/error handling.

## Notes
- Target network is configured to Sepolia (`0xaa36a7`). You can adjust it in `WalletContext.tsx` if needed.
- We intentionally avoided ethers/web3 to align with the assignment requirement and keep the footprint minimal.

---

**That's it! Happy coding! 🚀**
