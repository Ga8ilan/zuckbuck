import React, { useState, useEffect } from 'react';
import './App.css';
import WalletModal from './WalletModal';
import QRCodeModal from './QRCodeModal';
import walletService from './walletService';

const PRESALE_END = new Date('2025-08-01T00:00:00Z').getTime();

function App() {
  const [countdown, setCountdown] = useState("Loading...");
  const [email, setEmail] = useState("");
  const [emailMsg, setEmailMsg] = useState("");
  const [emailColor, setEmailColor] = useState("black");
  const [submitting, setSubmitting] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrType, setQrType] = useState('walletconnect');
  const [connectedWallet, setConnectedWallet] = useState(null);
  const [walletAddress, setWalletAddress] = useState("");

  // Initialize wallet state from service
  useEffect(() => {
    const initializeWalletState = () => {
      const walletState = walletService.getWalletState();
      if (walletState.isConnected) {
        setConnectedWallet(walletState.walletType);
        setWalletAddress(walletState.address);
      }
    };

    // Initialize on component mount
    initializeWalletState();

    // Listen for wallet state changes
    const handleWalletStateChange = (event) => {
      const { walletType, address, isConnected } = event.detail;
      if (isConnected) {
        setConnectedWallet(walletType);
        setWalletAddress(address);
      } else {
        setConnectedWallet(null);
        setWalletAddress("");
      }
    };

    window.addEventListener('walletStateChanged', handleWalletStateChange);

    return () => {
      window.removeEventListener('walletStateChanged', handleWalletStateChange);
    };
  }, []);

  // Countdown timer logic
  useEffect(() => {
    function updateCountdown() {
      const now = new Date().getTime();
      const diff = PRESALE_END - now;
      if (diff <= 0) {
        setCountdown("Presale Ended!");
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setCountdown(`${days}d : ${hours}h : ${minutes}m : ${seconds}s`);
    }
    const interval = setInterval(updateCountdown, 1000);
    updateCountdown();
    return () => clearInterval(interval);
  }, []);

  // Email form submit
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setEmailMsg("");
    try {
      const res = await fetch("https://formspree.io/f/xdkdnjvo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      if (res.ok) {
        setEmailMsg("✅ Thanks! You'll be notified when we launch.");
        setEmailColor("green");
        setEmail("");
      } else {
        setEmailMsg("Something went wrong. Try again.");
        setEmailColor("red");
      }
    } catch (err) {
      setEmailMsg("Failed to send. Try again later.");
      setEmailColor("red");
    }
    setSubmitting(false);
  };

  // Handle wallet selection with real connections
  const handleWalletSelect = async (walletType) => {
    try {
      let result;
      
      switch (walletType) {
        case 'phantom':
          result = await walletService.connectPhantom();
          break;
        case 'coinbase':
          result = await walletService.connectCoinbase();
          break;
        case 'walletconnect':
          result = await walletService.connectWalletConnect();
          break;
        case 'manual':
          // Handle manual connection (could open a form or redirect)
          return;
        default:
          throw new Error('Unknown wallet type');
      }

      if (result.success) {
        if (result.showQRModal) {
          // Show QR code modal for WalletConnect or Coinbase
          setQrType(result.qrType || 'walletconnect');
          setQrModalOpen(true);
        } else if (result.address) {
          // Direct connection for other wallets
          setConnectedWallet(result.wallet);
          setWalletAddress(result.address);
        }
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
    }
  };

  // Handle successful QR code connection
  const handleQRConnection = (walletType, address) => {
    walletService.handleQRConnection(walletType, address);
    setConnectedWallet(walletType);
    setWalletAddress(address);
    setQrModalOpen(false);
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    walletService.disconnect();
    setConnectedWallet(null);
    setWalletAddress("");
    // No alert
  };

  return (
    <div className="App">
      <WalletModal isOpen={walletModalOpen} onClose={() => setWalletModalOpen(false)} onWalletSelect={handleWalletSelect} />
      <QRCodeModal 
        isOpen={qrModalOpen} 
        onClose={() => setQrModalOpen(false)} 
        onWalletSelect={handleWalletSelect} 
        qrType={qrType}
        onConnectionSuccess={handleQRConnection}
      />
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-links">
            <a href="#about">About</a>
            <a href="#wallet">Wallet</a>
            <a href="#tokenomics">Tokenomics</a>
            <a href="#roadmap">Roadmap</a>
            <a href="#community">Community</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>ZUCKBUCK ($ZUCK)</h1>
          <p className="hero-subtitle">
            The tongue‑in‑cheek meme coin riding Solana's lightning‑fast rails. No promises, just vibes.
          </p>
          <button className="cta-button">Get $ZUCK</button>
        </div>
      </section>

      {/* Presale Section */}
      <section className="presale-section">
        <div className="container">
          <h2>ZUCK Presale Countdown</h2>
          <div className="countdown-container">
            <p><strong>Presale ends in:</strong></p>
            <div className="countdown">{countdown}</div>
            {connectedWallet ? (
              <div className="wallet-connected">
                <p>Connected: {connectedWallet}</p>
                <p className="wallet-address">{walletAddress}</p>
                <button className="wallet-button" onClick={disconnectWallet}>Disconnect</button>
              </div>
            ) : (
              <button className="wallet-button" onClick={() => setWalletModalOpen(true)}>Connect Wallet</button>
            )}
          </div>
        </div>
      </section>

      {/* Email Notification */}
      <section className="email-section">
        <div className="container">
          <h2>Join the Early Access List</h2>
          <form onSubmit={handleEmailSubmit} className="email-form">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
            <button type="submit" disabled={submitting}>
              {submitting ? 'Sending...' : 'Notify Me'}
            </button>
          </form>
          <div className="email-msg" style={{ color: emailColor }}>{emailMsg}</div>
        </div>
      </section>

      {/* Funding Progress */}
      <section className="funding-section">
        <div className="container">
          <h2>Funding Progress</h2>
          <div className="progress-container">
            <p><strong>$2,000 / $100,000 raised</strong></p>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '2%' }}></div>
            </div>
            <p>2%</p>
          </div>
        </div>
      </section>

      {/* Tokenomics */}
      <section className="tokenomics-section">
        <div className="container">
          <h2>Simulated Tokenomics</h2>
          <ul className="tokenomics-list">
            <li>Supply: 1,000,000,000 $ZUCK</li>
            <li><strong>50%</strong> 🔥 Burned at "launch"</li>
            <li><strong>30%</strong> 🚀 Community Airdrop</li>
            <li><strong>20%</strong> 🧑‍💻 Development & giveaways</li>
          </ul>
        </div>
      </section>

      {/* Roadmap */}
      <section className="roadmap-section">
        <div className="container">
          <h2>Roadmap</h2>
          <ul className="roadmap-list">
            <li><strong>Q3 2025</strong> — Launch concept site & initial meme push</li>
            <li><strong>Q4 2025</strong> — Viral marketing blitz, influencer collabs</li>
            <li><strong>Q1 2026</strong> — Limited‑edition NFT drop (hat collection)</li>
            <li><strong>Q2 2026</strong> — Solana Pay store integration for merch</li>
            <li><strong>Q3 2026</strong> — Listing on top Solana DEXes (simulated)</li>
            <li><strong>Q4 2026</strong> — Community DAO for future meme lore</li>
          </ul>
        </div>
      </section>

      {/* Community */}
      <section className="community-section">
        <div className="container">
          <h2>Join the Community</h2>
          <p>
            Follow <strong>@ZUCKBUCKcoin</strong> on X and jump into our Telegram. 
            We're just here for good memes and possible moon missions.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>© 2025 ZUCKBUCK. Meme coin concept. No financial value.</p>
        </div>
      </footer>
    </div>
  );
}

export default App; 