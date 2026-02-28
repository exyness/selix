'use client';

import { createContext, useContext, useMemo, ReactNode, useCallback } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletError } from '@solana/wallet-adapter-base';
import { toast } from 'sonner';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

interface SolanaProviderProps {
  children: ReactNode;
}

export function SolanaProvider({ children }: SolanaProviderProps) {
  // Use localnet for local development
  // Change to clusterApiUrl('devnet') for devnet or clusterApiUrl('mainnet-beta') for production
  const endpoint = useMemo(() => 'http://localhost:8899', []);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  const onError = useCallback((error: WalletError) => {
    console.error('Wallet error:', error);
    toast.error(error.message || 'Wallet connection failed');
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider 
        wallets={wallets} 
        autoConnect={true}
        onError={onError}
        localStorageKey="selix-wallet"
      >
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
}
