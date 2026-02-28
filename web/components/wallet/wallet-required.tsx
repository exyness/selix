'use client';

import Link from 'next/link';

interface WalletRequiredProps {
  title?: string;
  description?: string;
  backLink?: string;
  backLinkText?: string;
  showInfoCard?: boolean;
  infoTitle?: string;
  infoDescription?: string;
}

export default function WalletRequired({
  title = 'Wallet Required',
  description = 'Please connect your Solana wallet to access the admin dashboard.',
  backLink = '/',
  backLinkText = '← Back to Home',
  showInfoCard = true,
  infoTitle = 'Connect Your Wallet',
  infoDescription = 'Click the wallet button in the navigation bar to connect your Solana wallet. Make sure you have a compatible wallet extension installed (Phantom, Solflare, etc.).'
}: WalletRequiredProps) {
  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/20 mb-6">
          <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 className="text-3xl font-mono font-bold text-foreground uppercase mb-4">{title}</h1>
        <p className="text-muted-foreground text-base mb-8">
          {description}
        </p>
      </div>

      {showInfoCard && (
        <div className="bg-card border border-border p-8 rounded-lg">
          <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-6">
            {infoTitle}
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            {infoDescription}
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="font-mono">Secure Connection</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="font-mono">Solana Network</span>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 text-center">
        <Link href={backLink} className="text-sm text-primary hover:underline font-mono">
          {backLinkText}
        </Link>
      </div>
    </div>
  );
}
