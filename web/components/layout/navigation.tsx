'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { WalletButton } from '@/components/wallet/wallet-button';
import { usePlatform } from '@/lib/solana/hooks';

export default function Navigation() {
  const pathname = usePathname();
  const { publicKey, connected } = useWallet();
  const { platform } = usePlatform();
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');
  
  const isAuthority = connected && publicKey && platform && 
    publicKey.toString() === platform.authority.toString();

  // Use resolvedTheme to get the actual theme (handles 'system' preference)
  const currentTheme = mounted ? (resolvedTheme || theme) : 'dark';
  const logoSrc = currentTheme === 'dark' ? '/selix-logo-dark.png' : '/selix-logo-light.png';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-6 py-5 bg-background/90 backdrop-blur-md border-b border-border">
      <Link href="/" className="flex items-center gap-3">
        <div className="relative h-8 w-[120px]">
          <Image 
            src={logoSrc} 
            alt="Selix Protocol" 
            fill
            className="object-contain object-left"
            priority
            sizes="120px"
          />
        </div>
      </Link>
      <div className="flex items-center gap-4 md:gap-6">
        <div className="hidden md:flex items-center gap-6 lg:gap-10">
          <Link 
            href="/listings" 
            className={`text-[11px] font-mono font-medium transition-colors tracking-widest uppercase ${
              isActive('/listings') ? 'text-foreground border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Market
          </Link>
          <Link 
            href="/faucet" 
            className={`text-[11px] font-mono font-medium transition-colors tracking-widest uppercase ${
              isActive('/faucet') ? 'text-foreground border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Faucet
          </Link>
          <Link 
            href="/user/my-listings" 
            className={`text-[11px] font-mono font-medium transition-colors tracking-widest uppercase ${
              isActive('/user/my-listings') ? 'text-foreground border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            My Listings
          </Link>
          <Link 
            href="/user/my-swaps" 
            className={`text-[11px] font-mono font-medium transition-colors tracking-widest uppercase ${
              isActive('/user/my-swaps') ? 'text-foreground border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            My Swaps
          </Link>
          {connected && publicKey && (
            <Link 
              href={`/user/profile/${publicKey.toString()}`}
              className={`text-[11px] font-mono font-medium transition-colors tracking-widest uppercase ${
                isActive('/user/profile') ? 'text-foreground border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Profile
            </Link>
          )}
          {isAuthority && (
            <Link 
              href="/admin" 
              className={`text-[11px] font-mono font-medium transition-colors tracking-widest uppercase ${
                isActive('/admin') ? 'text-foreground border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Admin
            </Link>
          )}
        </div>
        <WalletButton />
        <ThemeToggle />
      </div>
    </nav>
  );
}
