'use client';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useEffect, useState } from 'react';

export default function StatusBar() {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const [network, setNetwork] = useState<string>('Unknown');

  useEffect(() => {
    // Detect network from RPC endpoint
    const endpoint = connection.rpcEndpoint;
    if (endpoint.includes('localhost') || endpoint.includes('127.0.0.1')) {
      setNetwork('Localnet');
    } else if (endpoint.includes('devnet')) {
      setNetwork('Devnet');
    } else if (endpoint.includes('testnet')) {
      setNetwork('Testnet');
    } else {
      setNetwork('Mainnet');
    }
  }, [connection]);

  useEffect(() => {
    if (!connected || !publicKey) {
      setBalance(null);
      return;
    }

    // Fetch balance
    const fetchBalance = async () => {
      try {
        const bal = await connection.getBalance(publicKey);
        setBalance(bal / LAMPORTS_PER_SOL);
      } catch (error) {
        console.error('Error fetching balance:', error);
        setBalance(null);
      }
    };

    fetchBalance();
    
    // Refresh balance every 10 seconds
    const interval = setInterval(fetchBalance, 10000);
    return () => clearInterval(interval);
  }, [connection, publicKey, connected]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border px-4 md:px-6 py-2 flex items-center justify-between text-[9px] font-mono uppercase tracking-widest">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${network === 'Localnet' ? 'bg-blue-500' : network === 'Devnet' ? 'bg-yellow-500' : 'bg-green-500'} animate-pulse`} />
          <span className="text-muted-foreground">{network}</span>
        </div>
        {connected && balance !== null && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Balance:</span>
            <span className="text-foreground">{balance.toFixed(4)} SOL</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-6">
        {connected && publicKey && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Wallet:</span>
            <span className="text-foreground">{publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
