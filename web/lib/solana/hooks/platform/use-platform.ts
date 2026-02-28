'use client';

import { useState, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
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
  const [platform, setPlatform] = useState<PlatformConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPlatform = async () => {
    if (!program) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // We need to get all platform accounts since we don't know the authority
      const accounts = await program.account.platform.all();
      if (accounts.length > 0) {
        setPlatform(accounts[0].account as PlatformConfig);
      } else {
        setPlatform(null);
      }
    } catch (error) {
      console.error('Error fetching platform:', error);
      setPlatform(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlatform();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [program]);

  return { platform, loading, refetch: fetchPlatform };
}

export function useWhitelist(tokenMint?: PublicKey) {
  const { program } = useProgram();
  const [whitelist, setWhitelist] = useState<WhitelistEntry | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWhitelist = async () => {
    if (!program || !tokenMint) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [whitelistPda] = getWhitelistPDA(tokenMint);
      const whitelistAccount = await program.account.tokenWhitelist.fetch(whitelistPda);
      setWhitelist(whitelistAccount as WhitelistEntry);
    } catch {
      // Entry doesn't exist
      setWhitelist(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWhitelist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [program, tokenMint]);

  return { whitelist, loading, refetch: fetchWhitelist };
}

export function useAllWhitelisted() {
  const { program } = useProgram();
  const [whitelisted, setWhitelisted] = useState<WhitelistEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllWhitelisted = async () => {
    if (!program) return;
    
    try {
      const accounts = await program.account.tokenWhitelist.all();
      const entries = accounts
        .map((account) => ({
          publicKey: account.publicKey,
          ...account.account,
        }))
        .filter((entry) => entry.isWhitelisted) as WhitelistEntry[];
      
      setWhitelisted(entries);
    } catch (error) {
      console.error('Error fetching whitelisted tokens:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllWhitelisted();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [program]);

  return { whitelisted, loading, refetch: fetchAllWhitelisted };
}
