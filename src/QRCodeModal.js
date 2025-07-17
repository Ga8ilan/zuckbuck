import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import './QRCodeModal.css';

const QRCodeModal = ({ isOpen, onClose, onWalletSelect, qrType = 'walletconnect', onConnectionSuccess }) => {
  const [qrCodeData, setQrCodeData] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('waiting'); // waiting, connecting, connected, failed
  const [pollingInterval, setPollingInterval] = useState(null);

  useEffect(() => {
    if (isOpen) {
      // Generate a unique session ID for this connection
      const sessionId = Math.random().toString(36).substring(2, 15);
      
      let walletConnectUrl;
      if (qrType === 'coinbase') {
        // Coinbase mobile app QR code data
        // This would typically use Coinbase's official connection URL
        const origin = encodeURIComponent(window.location.origin);
        const redirectUrl = encodeURIComponent(`${window.location.origin}/wallet-callback`);
        walletConnectUrl = `https://www.coinbase.com/connect?client_id=YOUR_CLIENT_ID&redirect_uri=${redirectUrl}&response_type=code&scope=wallet:accounts:read&state=${sessionId}`;
        
        // For demo purposes, we'll use a simplified URL
        // In production, you'd register your app with Coinbase and get a real client_id
        walletConnectUrl = `https://www.coinbase.com/connect?app=zuckbuck&session=${sessionId}&redirect=${encodeURIComponent(window.location.origin)}`;
      } else {
        // WalletConnect QR code data
        walletConnectUrl = `wc:${sessionId}@1?bridge=https%3A%2F%2Fbridge.walletconnect.org&key=YOUR_PROJECT_ID`;
      }
      
      setQrCodeData(walletConnectUrl);
      setIsLoading(false);
      setConnectionStatus('waiting');
      
      // Start polling for connection status
      startConnectionPolling();
    } else {
      // Clean up polling when modal closes
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }
    }
  }, [isOpen, qrType]);

  // Poll for wallet connection status
  const startConnectionPolling = () => {
    const interval = setInterval(async () => {
      try {
        if (qrType === 'coinbase') {
          // For Coinbase mobile app, we need to check if the user has completed
          // the connection through the mobile app. Since this is a mobile app,
          // we'll simulate the connection process and provide instructions
          // In a real implementation, you'd integrate with Coinbase's SDK
          
          // For demo purposes, we'll simulate a successful connection after a delay
          // In production, you'd use Coinbase's actual connection flow
          setTimeout(() => {
            setConnectionStatus('connected');
            clearInterval(interval);
            setPollingInterval(null);
            if (onConnectionSuccess) {
              // Generate a mock Ethereum address for demo
              const mockAddress = '0x' + Math.random().toString(16).substr(2, 40);
              onConnectionSuccess('coinbase', mockAddress);
            }
          }, 8000); // Simulate 8 second connection time
        } else {
          // For WalletConnect, we'd need a proper implementation
          // For now, we'll simulate connection after a delay
          // In a real implementation, you'd check the WalletConnect session
          setTimeout(() => {
            // Simulate successful connection for demo purposes
            setConnectionStatus('connected');
            clearInterval(interval);
            setPollingInterval(null);
            if (onConnectionSuccess) {
              onConnectionSuccess('walletconnect', '0x' + Math.random().toString(16).substr(2, 40));
            }
          }, 10000); // Simulate 10 second connection
        }
      } catch (error) {
        console.error('Error checking connection status:', error);
      }
    }, 2000); // Check every 2 seconds
    
    setPollingInterval(interval);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(qrCodeData);
    alert('Wallet link copied to clipboard!');
  };

  const getModalContent = () => {
    if (qrType === 'coinbase') {
      return {
        title: 'Connect with Coinbase',
        instructions: 'Scan this QR code with your Coinbase app',
        subtitle: 'Open your Coinbase app and scan the code below to connect your wallet',
        supportedWallets: ['📱 Coinbase'],
        logo: <img src="https://static-assets.coinbase.com/coinbase-app-icon.png" alt="Coinbase Logo" style={{width:'32px',height:'32px',verticalAlign:'middle'}} />
      };
    } else {
      return {
        title: 'Connect with WalletConnect',
        instructions: 'Scan this QR code with your mobile wallet',
        subtitle: 'Open your wallet app and scan the code below',
        supportedWallets: ['📱 MetaMask', '📱 Trust Wallet', '📱 Rainbow', '📱 Argent'],
        logo: '🔗'
      };
    }
  };

  const getStatusMessage = () => {
    switch (connectionStatus) {
      case 'waiting':
        return 'Waiting for connection...';
      case 'connecting':
        return 'Connecting...';
      case 'connected':
        return '✅ Connected successfully!';
      case 'failed':
        return '❌ Connection failed. Please try again.';
      default:
        return 'Waiting for connection...';
    }
  };

  const content = getModalContent();

  if (!isOpen) return null;

  return (
    <div className="qr-modal-overlay" onClick={onClose}>
      <div className="qr-modal" onClick={(e) => e.stopPropagation()}>
        <div className="qr-modal-header">
          <h3>{content.logo} {content.title}</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="qr-modal-content">
          {isLoading ? (
            <div className="loading">Loading QR Code...</div>
          ) : (
            <>
              <div className="qr-instructions">
                <p>{content.instructions}</p>
                <p className="qr-subtitle">{content.subtitle}</p>
              </div>
              
              <div className="qr-code-container">
                <QRCodeSVG 
                  value={qrCodeData} 
                  size={200}
                  level="H"
                  includeMargin={true}
                  bgColor="#ffffff"
                  fgColor="#000000"
                />
              </div>
              {qrType === 'coinbase' && (
                <div style={{marginTop: '1rem'}}>
                  <a
                    href="https://www.coinbase.com/mobile"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="get-app-link"
                    style={{
                      display: 'inline-block',
                      background: '#0052ff',
                      color: '#fff',
                      padding: '0.5rem 1.5rem',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      textDecoration: 'none',
                      marginTop: '0.5rem',
                    }}
                  >
                    Don't have the Coinbase app? Get it here
                  </a>
                </div>
              )}
              
              <div className="connection-status">
                <p className={`status-message ${connectionStatus}`}>
                  {getStatusMessage()}
                </p>
              </div>
              
              <div className="qr-actions">
                <button className="copy-link-btn" onClick={handleCopyLink}>
                  Copy Link
                </button>
                <button className="manual-connect-btn" onClick={() => onWalletSelect('manual')}>
                  Manual Connect
                </button>
              </div>
              
              <div className="supported-wallets">
                <p>Supported Wallets:</p>
                <div className="wallet-icons">
                  {content.supportedWallets.map((wallet, index) => (
                    <span key={index}>{wallet}</span>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal; 