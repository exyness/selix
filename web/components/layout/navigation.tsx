'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { usePlatform } from '@/lib/solana/hooks';
import { useEffect } from 'react';

export default function Navigation() {
  const pathname = usePathname();
  const { publicKey, connected } = useWallet();
  const { platform, loading } = usePlatform();

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');
  
  const isAuthority = connected && publicKey && platform && 
    publicKey.toString() === platform.authority.toString();

  // Debug logging
  useEffect(() => {
    if (connected && publicKey) {
      console.log('🔑 Connected Wallet:', publicKey.toString());
      console.log('📊 Platform Loading:', loading);
      console.log('🏛️ Platform Data:', platform);
      if (platform) {
        console.log('👑 Platform Authority:', platform.authority.toString());
        console.log('✅ Is Authority:', isAuthority);
      } else {
        console.log('⚠️ Platform not initialized yet');
      }
    }
  }, [connected, publicKey, platform, loading, isAuthority]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-6 py-5 bg-background/90 backdrop-blur-md border-b border-border">
      <Link href="/" className="flex items-center gap-2.5">
        <div className="w-1.5 h-1.5 rounded-full bg-foreground" />
        <span className="font-mono text-xs md:text-sm tracking-widest font-bold uppercase">SELIX_PROTOCOL</span>
      </Link>
      <div className="flex items-center gap-4 md:gap-6">
        <div className="hidden md:flex items-center gap-6 lg:gap-10">
          <Link 
            href="/listings" 
            className={`text-[11px] font-mono font-medium transition-colors tracking-widest uppercase ${
              isActive('/listings') ? 'text-foreground border-b border-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Market
          </Link>
          <Link 
            href="/my-listings" 
            className={`text-[11px] font-mono font-medium transition-colors tracking-widest uppercase ${
              isActive('/my-listings') ? 'text-foreground border-b border-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            My Listings
          </Link>
          {isAuthority && (
            <Link 
              href="/admin" 
              className={`text-[11px] font-mono font-medium transition-colors tracking-widest uppercase ${
                isActive('/admin') ? 'text-foreground border-b border-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Admin
            </Link>
          )}
          <Link 
            href="/docs" 
            className={`text-[11px] font-mono font-medium transition-colors tracking-widest uppercase ${
              isActive('/docs') ? 'text-foreground border-b border-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Docs
          </Link>
        </div>
        <WalletMultiButton className="!bg-primary !text-primary-foreground !font-mono !text-xs !font-bold !uppercase !tracking-widest !px-5 !py-2.5 hover:!opacity-90 !transition-all !rounded-none" />
        <ThemeToggle />
      </div>
    </nav>
  );
}
