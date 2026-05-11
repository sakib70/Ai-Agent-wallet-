# 🤖 Arc Agent Wallet

An AI Agent Wallet built on [Arc Network](https://arc.network) — the stablecoin-native L1 blockchain by Circle.

This dapp simulates an autonomous AI agent that can:
- 💰 Hold and display USDC balance on Arc Testnet
- ⚡ Auto-execute micro-payments for APIs
- 📈 Optimize yield autonomously
- 🔄 Monitor FX arbitrage opportunities
- 🏦 Guard treasury balance thresholds
- 📤 Send USDC manually to any address

---

## 🚀 Deploy in 5 Minutes (No coding needed)

### Step 1 — Get the code on GitHub

1. Go to [github.com](https://github.com) and sign in (or create a free account)
2. Click the **+** icon → **New repository**
3. Name it `arc-agent-wallet`
4. Leave it **Public**
5. Click **Create repository**
6. Upload all these files by dragging them into the GitHub interface, or use the steps below

### Step 2 — Upload files to GitHub

You can upload the files directly in the browser:
1. Open your new repository
2. Click **Add file** → **Upload files**
3. Drag and drop all the project files/folders
4. Click **Commit changes**

Or if you have Git installed on your computer:
```bash
git clone https://github.com/YOUR_USERNAME/arc-agent-wallet
cd arc-agent-wallet
# copy all project files here
git add .
git commit -m "Initial Arc Agent Wallet"
git push
```

### Step 3 — Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with your GitHub account
2. Click **Add New Project**
3. Find and select your `arc-agent-wallet` repository
4. Vercel will auto-detect it as a Next.js project
5. Click **Deploy** — that's it! 🎉

Your live URL will be something like: `https://arc-agent-wallet.vercel.app`

---

## 🦊 Using the Wallet

### Connect MetaMask
1. Install [MetaMask](https://metamask.io) browser extension
2. Click **CONNECT WALLET** in the top right
3. The app will automatically add **Arc Testnet** to your MetaMask

### Get free testnet USDC
- Click **+ GET 100 USDC** in the left panel (simulated for demo)
- For real testnet USDC, visit the [Arc faucet](https://faucet.arc-testnet.circle.com)

### Start the AI Agent
1. Enable one or more **behaviors** in the left panel:
   - 📈 **Yield Optimizer** — moves funds to highest yield
   - ⚡ **Auto Payments** — pays API fees automatically
   - 🔄 **FX Arbitrage** — trades stablecoin pairs
   - 🏦 **Treasury Guard** — maintains balance levels
2. Click **▶ START AGENT**
3. Watch the agent execute transactions in real time in the log

### Send USDC manually
1. Enter recipient address and amount in the **MANUAL SEND** section
2. Click **SEND USDC**

---

## 🛠 Project Structure

```
arc-agent-wallet/
├── pages/
│   ├── _app.js          # App wrapper
│   └── index.js         # Main dashboard UI
├── lib/
│   └── arc.js           # Arc network config & agent logic
├── styles/
│   └── globals.css      # Global styles
├── package.json
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

---

## 🔧 Run Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

---

## 🌐 Arc Network Info

| Property | Value |
|---|---|
| Chain Name | Arc Testnet |
| Native Gas Token | USDC |
| Finality | < 1 second |
| Explorer | https://explorer.arc-testnet.circle.com |
| Docs | https://docs.arc.network |
| Faucet | https://faucet.arc-testnet.circle.com |

---

## 📝 Notes

- This is a **demo/simulation** — transactions in the UI are simulated for display purposes
- The wallet connection uses real MetaMask and real Arc Testnet configuration
- For production: integrate with real Arc smart contracts via `ethers.js` (already installed)
- Testnet assets have no real monetary value

---

## 🔗 Resources

- [Arc Network](https://arc.network)
- [Arc Docs](https://docs.arc.network)
- [Circle USDC](https://www.circle.com/usdc)
- [MetaMask](https://metamask.io)
- [Vercel](https://vercel.com)
