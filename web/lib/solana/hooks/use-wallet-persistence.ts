'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useRef } from 'react';

export function useWalletPersistence() {
  const { wallet, connect, connected, connecting } = useWallet();
  const hasAttemptedReconnect = useRef(false);

  useEffect(() => {
    // Only attempt reconnection once on mount
    if (hasAttemptedReconnect.current || connecting || connected) {
      return;
    }

    const reconnectWallet = async () => {
      try {
        const savedWalletName = localStorage.getItem('selix-wallet');
        
        if (savedWalletName && wallet?.adapter.name === savedWalletName) {
          hasAttemptedReconnect.current = true;
          await connect();
        }
      } catch (error) {
        console.error('Failed to reconnect wallet:', error);
        // Clear saved wallet if reconnection fails
        localStorage.removeItem('selix-wallet');
      }
    };

    // Small delay to ensure wallet adapter is ready
    const timer = setTimeout(reconnectWallet, 500);
    
    return () => clearTimeout(timer);
  }, [wallet, connect, connecting, connected]);

  // Save wallet name when connected
  useEffect(() => {
    if (connected && wallet) {
      localStorage.setItem('selix-wallet', wallet.adapter.name);
    }
  }, [connected, wallet]);
}
