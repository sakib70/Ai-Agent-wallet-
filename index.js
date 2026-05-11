import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import {
  ARC_TESTNET,
  AGENT_BEHAVIORS,
  generateSimTx,
  shortAddr,
  formatTime,
} from '../lib/arc'

// ── tiny components ────────────────────────────────────────────────────────

function StatusDot({ active }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 8, height: 8,
        borderRadius: '50%',
        background: active ? 'var(--arc-green)' : '#ff4466',
        boxShadow: active ? '0 0 8px var(--arc-green)' : '0 0 8px #ff4466',
        marginRight: 6,
      }}
    />
  )
}

function TxRow({ tx }) {
  const isPos = tx.sign === '+'
  return (
    <div className="tx-row mono" style={{
      display: 'grid',
      gridTemplateColumns: '1fr auto auto',
      gap: 12,
      alignItems: 'center',
      padding: '10px 14px',
      borderBottom: '1px solid var(--arc-border)',
      fontSize: 12,
    }}>
      <div>
        <div style={{ color: 'var(--arc-text)', marginBottom: 2 }}>{tx.label}</div>
        <div style={{ color: 'rgba(0,255,136,0.35)', fontSize: 10 }}>
          {formatTime(tx.timestamp)} · #{tx.id}
        </div>
      </div>
      <div style={{
        color: isPos ? 'var(--arc-green)' : '#ff8866',
        fontWeight: 700, fontSize: 13,
        textShadow: isPos ? '0 0 8px var(--arc-green)' : 'none',
      }}>
        {tx.amount} USDC
      </div>
      <div style={{
        fontSize: 9,
        padding: '3px 7px',
        border: '1px solid var(--arc-border)',
        color: 'var(--arc-green)',
        letterSpacing: '0.05em',
      }}>
        DONE
      </div>
    </div>
  )
}

function AgentCard({ behavior, active, onToggle }) {
  return (
    <button
      className="btn-arc"
      onClick={onToggle}
      style={{
        width: '100%',
        textAlign: 'left',
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        background: active ? 'rgba(0,255,136,0.06)' : 'transparent',
        boxShadow: active ? '0 0 16px var(--arc-dim), inset 0 0 10px rgba(0,255,136,0.04)' : 'none',
        marginBottom: 6,
      }}
    >
      <span style={{ fontSize: 20 }}>{behavior.icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontFamily: 'Syne, sans-serif', fontWeight: 700, marginBottom: 2 }}>
          {behavior.label}
        </div>
        <div style={{ fontSize: 10, color: 'rgba(0,255,136,0.5)', fontFamily: 'Share Tech Mono, monospace' }}>
          {behavior.description}
        </div>
      </div>
      <StatusDot active={active} />
    </button>
  )
}

// ── main component ─────────────────────────────────────────────────────────

export default function Home() {
  const [wallet, setWallet] = useState(null)         // connected address
  const [balance, setBalance] = useState('—')
  const [txList, setTxList] = useState([])
  const [agentActive, setAgentActive] = useState(false)
  const [behaviors, setBehaviors] = useState({})     // { id: bool }
  const [sendTo, setSendTo] = useState('')
  const [sendAmt, setSendAmt] = useState('')
  const [log, setLog] = useState(['SYSTEM BOOT...', 'Arc Agent Wallet v1.0 ready.'])
  const [simBalance, setSimBalance] = useState(1250.00)
  const [connecting, setConnecting] = useState(false)
  const [agentThinking, setAgentThinking] = useState('')
  const logRef = useRef(null)
  const intervalRef = useRef(null)

  // Auto-scroll log
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [log])

  function addLog(msg) {
    setLog(prev => [...prev.slice(-60), msg])
  }

  // Connect MetaMask / wallet
  async function connectWallet() {
    if (!window.ethereum) {
      addLog('ERROR: No wallet detected. Install MetaMask.')
      return
    }
    setConnecting(true)
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      setWallet(accounts[0])
      addLog(`WALLET CONNECTED: ${accounts[0]}`)

      // Add Arc testnet
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [ARC_TESTNET],
        })
        addLog('Arc Testnet added to wallet.')
      } catch {
        addLog('Note: Arc Testnet already configured or could not be added.')
      }

      // Simulate USDC balance fetch
      addLog('Fetching USDC balance...')
      setTimeout(() => {
        setBalance(simBalance.toFixed(2))
        addLog(`Balance: ${simBalance.toFixed(2)} USDC`)
      }, 800)
    } catch (e) {
      addLog('ERROR: ' + (e.message || 'Connection rejected'))
    }
    setConnecting(false)
  }

  // Toggle agent on/off
  function toggleAgent() {
    if (!agentActive) {
      setAgentActive(true)
      addLog('▶ AI Agent ACTIVATED')
      addLog('Agent scanning Arc network for opportunities...')
      startAgentLoop()
    } else {
      setAgentActive(false)
      addLog('■ AI Agent STOPPED')
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }

  // Simulated agent loop
  function startAgentLoop() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      const activeBehaviors = AGENT_BEHAVIORS.filter(b =>
        behaviors[b.id]
      )
      if (activeBehaviors.length === 0) {
        addLog('Agent idle: no behaviors enabled.')
        return
      }

      const b = activeBehaviors[Math.floor(Math.random() * activeBehaviors.length)]
      const amt = (Math.random() * 2 + 0.01).toFixed(4)
      const isEarn = b.id === 'fx'

      setAgentThinking(b.action)
      setTimeout(() => setAgentThinking(''), 1500)

      addLog(`[${b.icon} ${b.label}] ${b.action}`)

      setTimeout(() => {
        const tx = generateSimTx(b.id, amt)
        setTxList(prev => [tx, ...prev].slice(0, 30))

        if (isEarn) {
          setSimBalance(prev => {
            const n = prev + parseFloat(amt)
            setBalance(n.toFixed(2))
            return n
          })
          addLog(`✓ Earned +${amt} USDC from ${b.label}`)
        } else {
          setSimBalance(prev => {
            const n = Math.max(0, prev - parseFloat(amt))
            setBalance(n.toFixed(2))
            return n
          })
          addLog(`✓ Spent -${amt} USDC via ${b.label}`)
        }
      }, 1200)
    }, 4000)
  }

  // Re-start loop when behaviors change while agent is active
  useEffect(() => {
    if (agentActive) startAgentLoop()
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [behaviors, agentActive])

  function toggleBehavior(id) {
    setBehaviors(prev => {
      const next = { ...prev, [id]: !prev[id] }
      addLog(`${next[id] ? 'ENABLED' : 'DISABLED'} behavior: ${id}`)
      return next
    })
  }

  // Simulate send
  function handleSend() {
    if (!sendTo || !sendAmt || parseFloat(sendAmt) <= 0) {
      addLog('ERROR: Invalid send params.')
      return
    }
    const amt = parseFloat(sendAmt)
    if (amt > simBalance) {
      addLog('ERROR: Insufficient USDC balance.')
      return
    }
    addLog(`Sending ${amt} USDC to ${sendTo}...`)
    setTimeout(() => {
      const tx = generateSimTx('send', amt, sendTo)
      setTxList(prev => [tx, ...prev].slice(0, 30))
      setSimBalance(prev => {
        const n = Math.max(0, prev - amt)
        setBalance(n.toFixed(2))
        return n
      })
      addLog(`✓ Sent ${amt} USDC → ${sendTo.slice(0, 10)}...`)
      setSendTo('')
      setSendAmt('')
    }, 1000)
  }

  // Simulate faucet top-up
  function handleFaucet() {
    addLog('Requesting testnet USDC from faucet...')
    setTimeout(() => {
      const tx = generateSimTx('receive', 100)
      tx.label = 'Faucet top-up'
      tx.sign = '+'
      tx.amount = '+100.0000'
      setTxList(prev => [tx, ...prev].slice(0, 30))
      setSimBalance(prev => {
        const n = prev + 100
        setBalance(n.toFixed(2))
        return n
      })
      addLog('✓ Received 100 USDC from testnet faucet')
    }, 1500)
  }

  // ── render ───────────────────────────────────────────────────────────────

  return (
    <>
      <Head>
        <title>Arc Agent Wallet</title>
        <meta name="description" content="AI Agent Wallet on Arc Network" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Syne:wght@400;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      {/* Top bar */}
      <div style={{
        borderBottom: '1px solid var(--arc-border)',
        padding: '10px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Arc logo mark */}
          <svg width="28" height="28" viewBox="0 0 28 28">
            <circle cx="14" cy="14" r="13" fill="none" stroke="var(--arc-green)" strokeWidth="1.5" />
            <path d="M8 20 L14 8 L20 20" fill="none" stroke="var(--arc-green)" strokeWidth="2" strokeLinejoin="round" />
            <line x1="10" y1="16" x2="18" y2="16" stroke="var(--arc-green)" strokeWidth="1.5" />
          </svg>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16, letterSpacing: '0.05em' }}>
            ARC <span className="glow-text">AGENT</span> WALLET
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span className="mono" style={{ fontSize: 11, color: 'rgba(0,255,136,0.5)' }}>
            Arc Testnet
          </span>
          {wallet ? (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 14px',
              border: '1px solid var(--arc-border)',
              fontSize: 12,
            }} className="mono">
              <StatusDot active={true} />
              {shortAddr(wallet)}
            </div>
          ) : (
            <button className="btn-arc btn-arc-filled" onClick={connectWallet} disabled={connecting} style={{ padding: '7px 18px', fontSize: 12 }}>
              {connecting ? 'CONNECTING...' : 'CONNECT WALLET'}
            </button>
          )}
        </div>
      </div>

      {/* Main layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '280px 1fr 300px',
        gap: 0,
        height: 'calc(100vh - 53px)',
        overflow: 'hidden',
      }}>

        {/* LEFT: Agent controls */}
        <div style={{
          borderRight: '1px solid var(--arc-border)',
          padding: 20,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}>
          {/* Agent toggle */}
          <div>
            <div className="mono" style={{ fontSize: 10, color: 'rgba(0,255,136,0.4)', marginBottom: 10, letterSpacing: '0.15em' }}>
              AGENT STATUS
            </div>
            <button
              className={`btn-arc ${agentActive ? 'btn-arc-filled' : ''}`}
              onClick={toggleAgent}
              style={{ width: '100%', padding: '14px', fontSize: 13, position: 'relative' }}
            >
              {agentActive ? (
                <>■ STOP AGENT</>
              ) : (
                <>▶ START AGENT</>
              )}
            </button>
            {agentActive && agentThinking && (
              <div className="mono animate-slide-in" style={{
                marginTop: 8, fontSize: 10,
                color: 'var(--arc-green)',
                padding: '8px 10px',
                background: 'rgba(0,255,136,0.05)',
                border: '1px solid var(--arc-border)',
              }}>
                ⟳ {agentThinking}
              </div>
            )}
          </div>

          {/* Behaviors */}
          <div>
            <div className="mono" style={{ fontSize: 10, color: 'rgba(0,255,136,0.4)', marginBottom: 10, letterSpacing: '0.15em' }}>
              AGENT BEHAVIORS
            </div>
            {AGENT_BEHAVIORS.map(b => (
              <AgentCard
                key={b.id}
                behavior={b}
                active={!!behaviors[b.id]}
                onToggle={() => toggleBehavior(b.id)}
              />
            ))}
          </div>

          {/* Send */}
          <div>
            <div className="mono" style={{ fontSize: 10, color: 'rgba(0,255,136,0.4)', marginBottom: 10, letterSpacing: '0.15em' }}>
              MANUAL SEND
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input
                className="arc-input"
                placeholder="Recipient address (0x...)"
                value={sendTo}
                onChange={e => setSendTo(e.target.value)}
              />
              <input
                className="arc-input"
                placeholder="Amount (USDC)"
                type="number"
                value={sendAmt}
                onChange={e => setSendAmt(e.target.value)}
              />
              <button className="btn-arc" onClick={handleSend} style={{ width: '100%' }}>
                SEND USDC
              </button>
            </div>
          </div>

          {/* Faucet */}
          <div>
            <div className="mono" style={{ fontSize: 10, color: 'rgba(0,255,136,0.4)', marginBottom: 10, letterSpacing: '0.15em' }}>
              TESTNET FAUCET
            </div>
            <button className="btn-arc" onClick={handleFaucet} style={{ width: '100%' }}>
              + GET 100 USDC
            </button>
            <div className="mono" style={{ fontSize: 9, color: 'rgba(0,255,136,0.3)', marginTop: 6 }}>
              Free testnet USDC for development
            </div>
          </div>
        </div>

        {/* CENTER: Balance + Transactions */}
        <div style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          {/* Balance card */}
          <div style={{
            padding: '32px 36px',
            borderBottom: '1px solid var(--arc-border)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Background arc decoration */}
            <div style={{
              position: 'absolute', top: -60, right: -60,
              width: 220, height: 220,
              border: '1px solid var(--arc-border)',
              borderRadius: '50%',
              pointerEvents: 'none',
            }} />
            <div style={{
              position: 'absolute', top: -30, right: -30,
              width: 160, height: 160,
              border: '1px solid rgba(0,255,136,0.05)',
              borderRadius: '50%',
              pointerEvents: 'none',
            }} />

            <div className="mono" style={{ fontSize: 10, color: 'rgba(0,255,136,0.4)', letterSpacing: '0.15em', marginBottom: 8 }}>
              AGENT WALLET BALANCE
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <div className="glow-text" style={{ fontSize: 52, fontFamily: 'Syne, sans-serif', fontWeight: 800, lineHeight: 1 }}>
                {balance}
              </div>
              <div className="mono" style={{ fontSize: 18, color: 'rgba(0,255,136,0.6)' }}>USDC</div>
            </div>
            {wallet && (
              <div className="mono" style={{ fontSize: 11, color: 'rgba(0,255,136,0.35)', marginTop: 10 }}>
                {wallet}
              </div>
            )}

            {/* Stats row */}
            <div style={{ display: 'flex', gap: 32, marginTop: 24 }}>
              {[
                { label: 'TRANSACTIONS', value: txList.length },
                { label: 'AGENT STATUS', value: agentActive ? 'ACTIVE' : 'IDLE' },
                { label: 'BEHAVIORS ON', value: Object.values(behaviors).filter(Boolean).length },
                { label: 'NETWORK', value: 'Arc Testnet' },
              ].map(s => (
                <div key={s.label}>
                  <div className="mono" style={{ fontSize: 9, color: 'rgba(0,255,136,0.35)', letterSpacing: '0.1em', marginBottom: 4 }}>
                    {s.label}
                  </div>
                  <div className="mono" style={{
                    fontSize: 14,
                    color: s.label === 'AGENT STATUS' && agentActive ? 'var(--arc-green)' : 'var(--arc-text)',
                    textShadow: s.label === 'AGENT STATUS' && agentActive ? '0 0 8px var(--arc-green)' : 'none',
                  }}>
                    {s.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Transactions list */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <div className="mono" style={{
              fontSize: 10, color: 'rgba(0,255,136,0.4)',
              letterSpacing: '0.15em',
              padding: '14px 20px',
              borderBottom: '1px solid var(--arc-border)',
            }}>
              TRANSACTION HISTORY ({txList.length})
            </div>
            {txList.length === 0 ? (
              <div className="mono" style={{
                padding: 40, textAlign: 'center',
                color: 'rgba(0,255,136,0.25)', fontSize: 13,
              }}>
                No transactions yet.<br />
                <span style={{ fontSize: 11 }}>Start the agent or send USDC manually.</span>
              </div>
            ) : (
              txList.map(tx => <TxRow key={tx.id} tx={tx} />)
            )}
          </div>
        </div>

        {/* RIGHT: Terminal log */}
        <div style={{
          borderLeft: '1px solid var(--arc-border)',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div className="mono" style={{
            fontSize: 10, color: 'rgba(0,255,136,0.4)',
            letterSpacing: '0.15em',
            padding: '14px 16px',
            borderBottom: '1px solid var(--arc-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span>AGENT LOG</span>
            {agentActive && <span className="animate-glow" style={{ color: 'var(--arc-green)' }}>● LIVE</span>}
          </div>
          <div
            ref={logRef}
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            {log.map((line, i) => (
              <div key={i} className="mono" style={{
                fontSize: 11,
                color: line.startsWith('ERROR') ? '#ff6655'
                  : line.startsWith('✓') ? 'var(--arc-green)'
                  : line.startsWith('▶') || line.startsWith('■') ? '#88ffcc'
                  : 'rgba(0,255,136,0.55)',
                lineHeight: 1.6,
                wordBreak: 'break-all',
              }}>
                {i === log.length - 1 ? (
                  <>{line}<span className="animate-blink">_</span></>
                ) : line}
              </div>
            ))}
          </div>

          {/* Bottom info */}
          <div style={{
            borderTop: '1px solid var(--arc-border)',
            padding: '12px 14px',
          }}>
            <div className="mono" style={{ fontSize: 9, color: 'rgba(0,255,136,0.3)', lineHeight: 1.8 }}>
              <div>CHAIN: Arc Testnet</div>
              <div>TOKEN: USDC (native gas)</div>
              <div>FINALITY: &lt;1 second</div>
              <div>FEES: Denominated in USDC</div>
              <div style={{ marginTop: 4, color: 'rgba(0,255,136,0.2)' }}>
                Built on arc.network · Circle
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
