// Wallet connection service
class WalletService {
  constructor() {
    this.connection = null;
    this.wallet = null;
    this.walletType = null;
    this.address = null;
    this.isConnected = false;
    
    // Load persistent state
    this.loadPersistentState();
    
    // Set up periodic state checking
    this.startStateChecking();
  }

  // Load persistent state from localStorage
  loadPersistentState() {
    try {
      const savedState = localStorage.getItem('zuckbuck_wallet_state');
      if (savedState) {
        const state = JSON.parse(savedState);
        this.walletType = state.walletType;
        this.address = state.address;
        this.isConnected = state.isConnected;
        
        // If we have a saved connection, try to verify it's still valid
        if (this.isConnected && this.walletType) {
          this.verifyConnection();
        }
      }
    } catch (error) {
      console.error('Error loading wallet state:', error);
    }
  }

  // Save current state to localStorage
  savePersistentState() {
    try {
      const state = {
        walletType: this.walletType,
        address: this.address,
        isConnected: this.isConnected,
        timestamp: Date.now()
      };
      localStorage.setItem('zuckbuck_wallet_state', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving wallet state:', error);
    }
  }

  // Verify if the saved connection is still valid
  async verifyConnection() {
    try {
      if (this.walletType === 'phantom') {
        if (this.isPhantomInstalled()) {
          const response = await window.solana.connect();
          this.wallet = response;
          this.address = response.publicKey.toString();
          this.isConnected = true;
          this.savePersistentState();
          return true;
        }
      } else if (this.walletType === 'coinbase') {
        if (this.isCoinbaseInstalled()) {
          const accounts = await window.ethereum.request({
            method: 'eth_accounts'
          });
          if (accounts.length > 0) {
            this.address = accounts[0];
            this.isConnected = true;
            this.savePersistentState();
            return true;
          }
        }
      }
      
      // If verification fails, clear the state
      this.clearState();
      return false;
    } catch (error) {
      console.error('Connection verification failed:', error);
      this.clearState();
      return false;
    }
  }

  // Clear all wallet state
  clearState() {
    this.wallet = null;
    this.connection = null;
    this.walletType = null;
    this.address = null;
    this.isConnected = false;
    localStorage.removeItem('zuckbuck_wallet_state');
  }

  // Start periodic state checking for cross-device sync
  startStateChecking() {
    // Check wallet state every 5 seconds
    setInterval(() => {
      this.checkWalletState();
    }, 5000);
  }

  // Check current wallet state
  async checkWalletState() {
    try {
      if (this.walletType === 'phantom' && this.isPhantomInstalled()) {
        const isConnected = window.solana.isConnected;
        if (isConnected !== this.isConnected) {
          this.isConnected = isConnected;
          if (isConnected) {
            this.address = window.solana.publicKey.toString();
          } else {
            this.clearState();
          }
          this.savePersistentState();
          this.notifyStateChange();
        }
      } else if (this.walletType === 'coinbase') {
        // For Coinbase mobile app, we can't directly check connection status
        // from the browser since it's a mobile app. The connection status
        // would be managed through the QR code modal and callback handling.
        // For now, we'll keep the existing state as is.
        // In a real implementation, you'd integrate with Coinbase's SDK
        // to verify the connection status.
      }
    } catch (error) {
      console.error('Error checking wallet state:', error);
    }
  }

  // Notify components of state changes
  notifyStateChange() {
    // Dispatch custom event for components to listen to
    window.dispatchEvent(new CustomEvent('walletStateChanged', {
      detail: {
        walletType: this.walletType,
        address: this.address,
        isConnected: this.isConnected
      }
    }));
  }

  // Get current wallet state
  getWalletState() {
    return {
      walletType: this.walletType,
      address: this.address,
      isConnected: this.isConnected
    };
  }

  // Check if Phantom wallet is installed
  isPhantomInstalled() {
    return window.solana && window.solana.isPhantom;
  }

  // Connect to Phantom wallet
  async connectPhantom() {
    try {
      if (!this.isPhantomInstalled()) {
        window.open('https://phantom.app/', '_blank');
        throw new Error('Phantom wallet not installed. Please install it first.');
      }

      const response = await window.solana.connect();
      this.wallet = response;
      this.walletType = 'phantom';
      this.address = response.publicKey.toString();
      this.isConnected = true;
      this.savePersistentState();
      this.notifyStateChange();
      
      return {
        success: true,
        wallet: 'Phantom',
        address: this.address,
        publicKey: response.publicKey
      };
    } catch (error) {
      console.error('Phantom connection error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Check if Coinbase Wallet is installed
  isCoinbaseInstalled() {
    // For the main Coinbase mobile app, we don't check browser extensions
    // since it's a mobile app that users scan QR codes with
    return false;
  }

  // Connect to Coinbase Wallet with QR code option
  async connectCoinbase() {
    try {
      // For the main Coinbase mobile app, we always show QR code
      // since it's a mobile app, not a browser extension
      return {
        success: true,
        wallet: 'Coinbase',
        showQRModal: true,
        qrType: 'coinbase',
        message: 'Please scan the QR code with your Coinbase mobile app'
      };
    } catch (error) {
      console.error('Coinbase connection error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Connect via WalletConnect - returns signal to show QR modal
  async connectWalletConnect() {
    try {
      // Return signal to show QR code modal instead of redirecting
      return {
        success: true,
        wallet: 'WalletConnect',
        showQRModal: true,
        qrType: 'walletconnect',
        message: 'Please scan the QR code with your mobile wallet'
      };
    } catch (error) {
      console.error('WalletConnect error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Handle successful QR code connection
  handleQRConnection(walletType, address) {
    this.walletType = walletType;
    this.address = address;
    this.isConnected = true;
    this.savePersistentState();
    this.notifyStateChange();
  }

  // Disconnect wallet
  disconnect() {
    this.clearState();
    this.notifyStateChange();
    return {
      success: true,
      message: 'Wallet disconnected'
    };
  }

  // Get current wallet info
  getWalletInfo() {
    if (!this.isConnected) {
      return null;
    }
    return {
      connected: true,
      wallet: this.walletType,
      address: this.address
    };
  }
}

export default new WalletService(); 