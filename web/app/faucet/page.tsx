'use client';

import { useState, useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import Navigation from '@/components/layout/navigation';
import StatusBar from '@/components/layout/status-bar';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Coins, ChevronDown, Check } from 'lucide-react';
import { useProgram } from '@/lib/solana/use-program';
import WalletRequired from '@/components/wallet/wallet-required';
import { useQuery } from '@tanstack/react-query';
import { useTokensMetadata, type TokensMetadata } from '@/lib/solana/hooks';

function TokenDisplay({ metadata, size = 'md' }: { metadata?: TokensMetadata; size?: 'sm' | 'md' }) {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8'
  };
  
  return (
    <div className={`${sizeClasses[size]} rounded-full bg-muted border border-border flex items-center justify-center overflow-hidden shrink-0`}>
      {metadata?.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img 
          src={metadata.image} 
          alt={metadata.symbol || 'Token'} 
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
            if (fallback) fallback.style.display = 'flex';
          }}
        />
      ) : null}
      <Coins className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-4 h-4'} style={{ display: metadata?.image ? 'none' : 'block' }} />
    </div>
  );
}

export default function FaucetPage() {
  const { publicKey, connected } = useWallet();
  const { program } = useProgram();
  const [selectedToken, setSelectedToken] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recentAirdrops, setRecentAirdrops] = useState<Array<{ signature: string; amount: number; time: Date; tokenSymbol?: string; tokenImage?: string }>>([]);

  // Fetch whitelisted tokens
  const { data: whitelistedTokens, isLoading: tokensLoading } = useQuery({
    queryKey: ['whitelistedTokens', program?.programId.toString()],
    queryFn: async () => {
      if (!program) return [];
      
      try {
        const accounts = await program.account.tokenWhitelist.all();
        const tokens = accounts
          .filter(account => account.account.isWhitelisted)
          .map(account => ({
            publicKey: account.publicKey,
            tokenMint: account.account.mint,
            isWhitelisted: account.account.isWhitelisted,
          }));
        
        return tokens;
      } catch (error) {
        console.error('Error fetching whitelisted tokens:', error);
        return [];
      }
    },
    enabled: !!program,
    staleTime: 60000,
  });

  // Get token mints for metadata
  const tokenMints = useMemo(() => {
    if (!whitelistedTokens) return [];
    return whitelistedTokens.map(token => token.tokenMint);
  }, [whitelistedTokens]);

  const { tokensMetadata } = useTokensMetadata(tokenMints);

  // Get selected token metadata
  const selectedTokenMetadata = tokensMetadata.find(t => t.mint === selectedToken);

  const handleRequestTokens = async () => {
    if (!connected || !publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!selectedToken) {
      toast.error('Please select a token');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/faucet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: publicKey.toString(),
          tokenMint: selectedToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Failed to request tokens');
        return;
      }

      toast.success(data.message || 'Tokens sent successfully!');
      
      // Get token metadata for display
      const tokenMetadata = tokensMetadata.find(t => t.mint === selectedToken);
      
      // Add to recent airdrops
      setRecentAirdrops(prev => [
        { 
          signature: data.signature, 
          amount: data.amount, 
          time: new Date(),
          tokenSymbol: tokenMetadata?.symbol,
          tokenImage: tokenMetadata?.image
        },
        ...prev.slice(0, 4) // Keep only last 5
      ]);

    } catch (error) {
      console.error('Faucet error:', error);
      toast.error('Failed to request tokens');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-background text-foreground">
      <Navigation />

      <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-[800px] mx-auto">
        {/* Wallet Connection Required */}
        {!connected ? (
          <>
            <WalletRequired
              title="Wallet Required"
              description="Connect your Solana wallet to request test tokens from the faucet."
              backLink="/listings"
              backLinkText="← Browse Listings"
              infoTitle="Get Started"
              infoDescription="Click the wallet button in the navigation bar to connect your Solana wallet. Once connected, you can request 100 test tokens per hour for any whitelisted token."
            />
            
            {/* Info Box */}
            <div className="mt-8 bg-primary/5 border border-primary/20 p-4 rounded-lg">
              <p className="text-xs text-muted-foreground">
                <span className="text-primary font-mono">Note:</span> This faucet is for testing purposes only on Solana devnet. 
                Tokens have no real value and are only used for testing the Selix platform features.
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="text-center mb-12">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Coins className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-mono font-bold mb-4">Test Token Faucet</h1>
              <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
                Request test tokens for free to try out Selix on devnet. Each wallet can request 100 tokens per hour.
              </p>
            </div>
          </>
        )}

        {/* Faucet Form */}
        {connected && (
          <>
            <div className="bg-card border border-border p-6 sm:p-8 mb-8">
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">
                Select Token
              </label>
              {tokensLoading ? (
                <div className="bg-muted border border-border p-4 rounded text-center">
                  <div className="inline-block w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                  <span className="text-xs text-muted-foreground">Loading tokens...</span>
                </div>
              ) : whitelistedTokens && whitelistedTokens.length > 0 ? (
                <div className="relative">
                  {/* Custom Dropdown Button */}
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    disabled={!connected}
                    className="w-full bg-background border border-border p-3 rounded font-mono text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed hover:border-primary/50 transition-colors"
                  >
                    {selectedToken ? (
                      <div className="flex items-center gap-3">
                        <TokenDisplay metadata={selectedTokenMetadata} size="sm" />
                        <div className="text-left">
                          <div className="font-medium">{selectedTokenMetadata?.symbol || 'Unknown'}</div>
                          {selectedTokenMetadata?.name && (
                            <div className="text-[10px] text-muted-foreground">{selectedTokenMetadata.name}</div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Select a token...</span>
                    )}
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <>
                      {/* Backdrop */}
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setDropdownOpen(false)}
                      />
                      
                      {/* Dropdown Content */}
                      <div className="absolute z-20 w-full mt-2 bg-card border border-border rounded-lg shadow-lg max-h-[300px] overflow-y-auto">
                        {whitelistedTokens.map((token) => {
                          const metadata = tokensMetadata.find(t => t.mint === token.tokenMint.toString());
                          const isSelected = selectedToken === token.tokenMint.toString();
                          
                          return (
                            <button
                              key={token.tokenMint.toString()}
                              onClick={() => {
                                setSelectedToken(token.tokenMint.toString());
                                setDropdownOpen(false);
                              }}
                              className={`w-full p-3 flex items-center gap-3 hover:bg-muted transition-colors text-left ${
                                isSelected ? 'bg-primary/10' : ''
                              }`}
                            >
                              <TokenDisplay metadata={metadata} size="sm" />
                              <div className="flex-1 min-w-0">
                                <div className="font-mono text-xs font-medium text-foreground">
                                  {metadata?.symbol || token.tokenMint.toString().slice(0, 8) + '...'}
                                </div>
                                {metadata?.name && (
                                  <div className="text-[10px] text-muted-foreground truncate">
                                    {metadata.name}
                                  </div>
                                )}
                              </div>
                              {isSelected && (
                                <Check className="w-4 h-4 text-primary shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="bg-muted border border-border p-4 rounded text-center">
                  <p className="text-xs text-muted-foreground">No whitelisted tokens available</p>
                </div>
              )}
              <p className="text-[10px] text-muted-foreground mt-2">
                Only whitelisted tokens are available for testing
              </p>
            </div>

            <Button
              onClick={handleRequestTokens}
              disabled={!connected || loading || !selectedToken || tokensLoading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-mono text-sm uppercase tracking-wider h-12"
            >
              {loading ? 'Sending...' : 'Request 100 Tokens'}
            </Button>
          </div>
            </div>

            {/* Instructions */}
            <div className="bg-card border border-border p-6 sm:p-8 mb-8">
          <h2 className="text-sm font-mono font-bold uppercase tracking-wider mb-4">How to Use</h2>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <span className="text-primary font-mono">1.</span>
              <span>Connect your Solana wallet using the button in the navigation bar</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-mono">2.</span>
              <span>Select a token from the dropdown (only whitelisted tokens are available)</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-mono">3.</span>
              <span>Click "Request 100 Tokens" and wait for the transaction to complete</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-mono">4.</span>
              <span>You can request tokens once per hour per token</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-mono">5.</span>
              <span>If you don't have a token account, one will be created automatically</span>
            </li>
          </ol>
            </div>

            {/* Recent Airdrops */}
            {recentAirdrops.length > 0 && (
              <div className="bg-card border border-border p-6 sm:p-8">
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider mb-4">Recent Airdrops</h2>
            <div className="space-y-3">
              {recentAirdrops.map((airdrop, i) => (
                <div key={i} className="flex items-center justify-between text-xs border-b border-border pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {airdrop.tokenImage && (
                      <div className="w-6 h-6 rounded-full overflow-hidden shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={airdrop.tokenImage} alt={airdrop.tokenSymbol || 'Token'} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-foreground mb-1">
                        {airdrop.amount} {airdrop.tokenSymbol || 'tokens'}
                      </div>
                      <a
                        href={`https://explorer.solana.com/tx/${airdrop.signature}?cluster=devnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 font-mono truncate block"
                      >
                        {airdrop.signature.slice(0, 8)}...{airdrop.signature.slice(-8)}
                      </a>
                    </div>
                  </div>
                  <div className="text-muted-foreground text-[10px] ml-4 shrink-0">
                    {airdrop.time.toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
              </div>
            )}

            {/* Info Box */}
            <div className="mt-8 bg-primary/5 border border-primary/20 p-4 rounded-lg">
              <p className="text-xs text-muted-foreground">
                <span className="text-primary font-mono">Note:</span> This faucet is for testing purposes only on Solana devnet. 
                Tokens have no real value and are only used for testing the Selix platform features.
              </p>
            </div>
          </>
        )}
      </main>

      <StatusBar />
    </div>
  );
}
