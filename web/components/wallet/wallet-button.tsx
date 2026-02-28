'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useState } from 'react';
import { WalletModal } from './wallet-modal';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Copy, LogOut, Check } from 'lucide-react';
import { toast } from 'sonner';

export function WalletButton() {
  const { publicKey, disconnect, connected } = useWallet();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDisconnect = () => {
    disconnect();
    toast.success('Wallet disconnected');
  };

  const handleCopyAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toString());
      setCopied(true);
      toast.success('Address copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  if (connected && publicKey) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-mono text-xs font-bold uppercase tracking-widest px-5 py-2.5 transition-all rounded-sm border-0">
            {formatAddress(publicKey.toString())}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-card border-border">
          <div className="px-3 py-2">
            <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest mb-1">
              Connected Wallet
            </p>
            <p className="text-xs font-mono text-foreground">
              {formatAddress(publicKey.toString())}
            </p>
          </div>
          <DropdownMenuSeparator className="bg-border" />
          <DropdownMenuItem 
            onClick={handleCopyAddress}
            className="font-mono text-xs cursor-pointer"
          >
            {copied ? (
              <Check className="w-4 h-4 mr-2" />
            ) : (
              <Copy className="w-4 h-4 mr-2" />
            )}
            {copied ? 'Copied!' : 'Copy Address'}
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-border" />
          <DropdownMenuItem 
            onClick={handleDisconnect}
            className="font-mono text-xs cursor-pointer text-destructive focus:text-destructive"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        className="bg-primary text-primary-foreground hover:bg-primary/90 font-mono text-xs font-bold uppercase tracking-widest px-5 py-2.5 transition-all rounded-sm border-0"
      >
        Connect Wallet
      </Button>

      <WalletModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}
