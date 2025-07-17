import React from 'react';
import './WalletModal.css';
import phantomLogo from './assets/logos/phantom-logo.svg';
import coinbaseLogo from './assets/logos/coinbase-logo.svg';
import walletConnectLogo from './assets/logos/walletconnect-logo.svg';

const WalletModal = ({ isOpen, onClose, onWalletSelect }) => {
  if (!isOpen) return null;

  const handleWalletSelect = (walletType) => {
    onWalletSelect(walletType);
    onClose();
  };

  return (
    <div className="wallet-modal-overlay" onClick={onClose}>
      <div className="wallet-modal" onClick={(e) => e.stopPropagation()}>
        <div className="wallet-modal-header">
          <h3>Connect Wallet</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="wallet-options">
          <button 
            className="wallet-option"
            onClick={() => handleWalletSelect('phantom')}
          >
            <div className="wallet-icon">
              <img src={phantomLogo} alt="Phantom" />
            </div>
            <div className="wallet-info">
              <h4>Phantom Wallet</h4>
              <p>Solana's most popular wallet</p>
            </div>
          </button>
          
          <button 
            className="wallet-option"
            onClick={() => handleWalletSelect('coinbase')}
          >
            <div className="wallet-icon">
              <img src={coinbaseLogo} alt="Coinbase" />
            </div>
            <div className="wallet-info">
              <h4>Coinbase</h4>
              <p>Connect with Coinbase</p>
            </div>
          </button>
          
          <button 
            className="wallet-option"
            onClick={() => handleWalletSelect('walletconnect')}
          >
            <div className="wallet-icon">
              <img src={walletConnectLogo} alt="WalletConnect" />
            </div>
            <div className="wallet-info">
              <h4>WalletConnect</h4>
              <p>Connect any wallet</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WalletModal; 