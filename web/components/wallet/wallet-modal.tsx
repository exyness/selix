'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletName } from '@solana/wallet-adapter-base';
import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { wallets, select, connect, connecting, connected } = useWallet();
  const [selectedWallet, setSelectedWallet] = useState<WalletName | null>(null);

  useEffect(() => {
    if (connected) {
      onClose();
    }
  }, [connected, onClose]);

  const handleWalletSelect = async (walletName: WalletName) => {
    try {
      setSelectedWallet(walletName);
      select(walletName);
      
      // Wait for wallet to be selected before connecting
      setTimeout(async () => {
        try {
          await connect();
        } catch (error) {
          console.error('Error connecting wallet:', error);
          toast.error('Failed to connect wallet');
          setSelectedWallet(null);
        }
      }, 100);
    } catch (error) {
      console.error('Error selecting wallet:', error);
      toast.error('Failed to select wallet');
      setSelectedWallet(null);
    }
  };

  const getWalletIcon = (walletName: string) => {
    // You can add custom icons here or use wallet.adapter.icon
    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-mono font-bold uppercase tracking-wider text-foreground">
            Connect Wallet
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground font-mono">
            Select a wallet to connect to Selix Protocol
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {wallets.filter(wallet => wallet.readyState === 'Installed').length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-12 h-12 mx-auto mb-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <p className="text-sm font-mono text-muted-foreground mb-4">No wallet detected</p>
              <p className="text-xs text-muted-foreground mb-6">
                Install a Solana wallet extension to continue
              </p>
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  className="w-full font-mono text-xs"
                  onClick={() => window.open('https://phantom.app/', '_blank')}
                >
                  Install Phantom
                </Button>
                <Button
                  variant="outline"
                  className="w-full font-mono text-xs"
                  onClick={() => window.open('https://solflare.com/', '_blank')}
                >
                  Install Solflare
                </Button>
              </div>
            </div>
          ) : (
            <>
              {wallets
                .filter(wallet => wallet.readyState === 'Installed')
                .map((wallet) => (
                  <Button
                    key={wallet.adapter.name}
                    onClick={() => handleWalletSelect(wallet.adapter.name)}
                    disabled={connecting && selectedWallet === wallet.adapter.name}
                    variant="outline"
                    className="w-full justify-start gap-3 h-14 font-mono text-sm hover:bg-primary/5 hover:border-primary/50 transition-all"
                  >
                    {wallet.adapter.icon && (
                      <img 
                        src={wallet.adapter.icon} 
                        alt={wallet.adapter.name}
                        className="w-8 h-8"
                      />
                    )}
                    <span className="flex-1 text-left">{wallet.adapter.name}</span>
                    {connecting && selectedWallet === wallet.adapter.name && (
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    )}
                    {wallet.readyState === 'Installed' && (
                      <span className="text-[9px] text-primary uppercase tracking-wider">Detected</span>
                    )}
                  </Button>
                ))}

              <div className="pt-4 border-t border-border">
                <p className="text-[10px] text-muted-foreground font-mono text-center mb-3 uppercase tracking-wider">
                  More Wallets
                </p>
                {wallets
                  .filter(wallet => wallet.readyState !== 'Installed')
                  .slice(0, 3)
                  .map((wallet) => (
                    <Button
                      key={wallet.adapter.name}
                      onClick={() => window.open(wallet.adapter.url, '_blank')}
                      variant="ghost"
                      className="w-full justify-start gap-3 h-12 font-mono text-xs text-muted-foreground hover:text-foreground"
                    >
                      {wallet.adapter.icon && (
                        <img 
                          src={wallet.adapter.icon} 
                          alt={wallet.adapter.name}
                          className="w-6 h-6 opacity-50"
                        />
                      )}
                      <span className="flex-1 text-left">{wallet.adapter.name}</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </Button>
                  ))}
              </div>
            </>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-border">
          <p className="text-[9px] text-muted-foreground font-mono text-center">
            By connecting, you agree to Selix Protocol&apos;s Terms of Service
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
