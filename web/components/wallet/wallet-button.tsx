'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useState } from 'react';
import { WalletModal } from './wallet-modal';
import { Button } from '@/components/ui/button';

export function WalletButton() {
  const { publicKey, disconnect, connected } = useWallet();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = () => {
    if (connected) {
      disconnect();
    } else {
      setIsModalOpen(true);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <>
      <Button
        onClick={handleClick}
        className="bg-primary text-primary-foreground hover:bg-primary/90 font-mono text-xs font-bold uppercase tracking-widest px-5 py-2.5 transition-all rounded-sm border-0"
      >
        {connected && publicKey ? (
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            {formatAddress(publicKey.toString())}
          </span>
        ) : (
          'Connect Wallet'
        )}
      </Button>

      <WalletModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}
