// Arc Testnet Configuration
export const ARC_TESTNET = {
  chainId: '0x' + (1116160718).toString(16), // Arc testnet chain ID
  chainName: 'Arc Testnet',
  nativeCurrency: {
    name: 'USDC',
    symbol: 'USDC',
    decimals: 6,
  },
  rpcUrls: ['https://rpc.arc-testnet.circle.com'],
  blockExplorerUrls: ['https://explorer.arc-testnet.circle.com'],
}

// USDC contract on Arc testnet
export const USDC_ADDRESS = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'

// Minimal ERC-20 ABI for USDC balance + transfer
export const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
]

// AI Agent behaviors - what the agent can autonomously decide to do
export const AGENT_BEHAVIORS = [
  {
    id: 'yield',
    label: 'Yield Optimizer',
    icon: '📈',
    description: 'Automatically moves funds to highest-yield pools',
    action: 'Scanning yield protocols...',
  },
  {
    id: 'payments',
    label: 'Auto Payments',
    icon: '⚡',
    description: 'Pays for API calls and services autonomously',
    action: 'Processing micro-payments...',
  },
  {
    id: 'fx',
    label: 'FX Arbitrage',
    icon: '🔄',
    description: 'Monitors stablecoin pairs for arbitrage',
    action: 'Analyzing FX spreads...',
  },
  {
    id: 'treasury',
    label: 'Treasury Guard',
    icon: '🏦',
    description: 'Maintains balance thresholds and alerts',
    action: 'Monitoring treasury...',
  },
]

// Generate a simulated transaction for demo purposes
export function generateSimTx(type, amount, address) {
  const actions = {
    yield: { label: 'Yield deposit → AaveArc', sign: '-' },
    payments: { label: 'API fee → DataBroker.arc', sign: '-' },
    fx: { label: 'USDC/EURC swap → StableFX', sign: '+' },
    treasury: { label: 'Treasury rebalance', sign: '-' },
    send: { label: `Transfer → ${address?.slice(0, 8)}...`, sign: '-' },
    receive: { label: 'Incoming USDC', sign: '+' },
  }
  const act = actions[type] || actions.send
  return {
    id: Math.random().toString(36).slice(2, 10).toUpperCase(),
    type,
    label: act.label,
    amount: (act.sign === '+' ? '+' : '-') + parseFloat(amount).toFixed(4),
    sign: act.sign,
    timestamp: new Date().toISOString(),
    status: 'confirmed',
    hash: '0x' + Math.random().toString(16).slice(2, 18),
  }
}

// Format address for display
export function shortAddr(addr) {
  if (!addr) return '—'
  return addr.slice(0, 6) + '...' + addr.slice(-4)
}

// Format timestamp
export function formatTime(iso) {
  const d = new Date(iso)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}
