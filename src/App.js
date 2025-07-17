import React, { useState, useEffect } from 'react';
import './App.css';

const WALLET_ADDRESS = "AQaoHT1ZrQiYFncbUbSYbdecq8XR6c3QsK2DZNVLrUty";
const PRESALE_END = new Date('2025-08-01T00:00:00Z').getTime();

function App() {
  const [countdown, setCountdown] = useState("Loading...");
  const [email, setEmail] = useState("");
  const [emailMsg, setEmailMsg] = useState("");
  const [emailColor, setEmailColor] = useState("black");
  const [submitting, setSubmitting] = useState(false);

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

  // Copy address to clipboard
  const copyAddress = () => {
    navigator.clipboard.writeText(WALLET_ADDRESS)
      .then(() => alert("Wallet address copied!"))
      .catch(() => alert("Copy failed."));
  };

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

  return (
    <div className="App">
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
            <button className="wallet-button">Connect Wallet</button>
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