'use client';

import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { useQuery } from '@tanstack/react-query';
import { useProgram } from '../../use-program';
import { getWhitelistPDA } from '@/lib/anchor/setup';

export interface PlatformConfig {
  authority: PublicKey;
  feeCollector: PublicKey;
  feeBasisPoints: number;
  minListingDuration: BN;
  maxListingDuration: BN;
  minTradeAmount: BN;
  maxListingsPerUser: number;
  isPaused: boolean;
  whitelistEnabled: boolean;
  totalListingsCreated: BN;
  totalSwapsExecuted: BN;
  totalVolumeTraded: BN;
  totalFeesCollected: BN;
  createdAt: BN;
  updatedAt: BN;
  bump: number;
}

export interface WhitelistEntry {
  publicKey?: PublicKey;
  mint: PublicKey;
  isWhitelisted: boolean;
  updatedAt: BN;
  bump: number;
}

export function usePlatform() {
  const { program } = useProgram();

  const { data: platform, isLoading: loading, refetch } = useQuery({
    queryKey: ['platform', program?.programId.toString()],
    queryFn: async () => {
      if (!program) return null;
      
      const accounts = await program.account.platform.all();
      if (accounts.length > 0) {
        return accounts[0].account as PlatformConfig;
      }
      return null;
    },
    enabled: !!program,
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  return { platform: platform ?? null, loading, refetch };
}

export function useWhitelist(tokenMint?: PublicKey) {
  const { program } = useProgram();

  const { data: whitelist, isLoading: loading, refetch } = useQuery({
    queryKey: ['whitelist', tokenMint?.toString()],
    queryFn: async () => {
      if (!program || !tokenMint) return null;
      
      try {
        const [whitelistPda] = getWhitelistPDA(tokenMint);
        const whitelistAccount = await program.account.tokenWhitelist.fetch(whitelistPda);
        return whitelistAccount as WhitelistEntry;
      } catch {
        return null;
      }
    },
    enabled: !!program && !!tokenMint,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
  });

  return { whitelist: whitelist ?? null, loading, refetch };
}

export function useAllWhitelisted() {
  const { program } = useProgram();

  const { data: whitelisted, isLoading: loading, refetch } = useQuery({
    queryKey: ['whitelisted', program?.programId.toString()],
    queryFn: async () => {
      if (!program) return [];
      
      const accounts = await program.account.tokenWhitelist.all();
      const entries = accounts
        .map((account) => ({
          publicKey: account.publicKey,
          ...account.account,
        }))
        .filter((entry) => entry.isWhitelisted) as WhitelistEntry[];
      
      return entries;
    },
    enabled: !!program,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
  });

  return { whitelisted: whitelisted ?? [], loading, refetch };
}
