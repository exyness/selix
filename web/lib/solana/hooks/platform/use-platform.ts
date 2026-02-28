'use client';

import { useState, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { useProgram } from '../../use-program';
import { getPlatformPDA, getWhitelistPDA } from '@/lib/anchor/setup';

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
  tokenMint: PublicKey;
  isWhitelisted: boolean;
  addedAt: BN;
  bump: number;
}

export function usePlatform() {
  const { program } = useProgram();
  const [platform, setPlatform] = useState<PlatformConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!program) {
      setLoading(false);
      return;
    }

    const fetchPlatform = async () => {
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

    fetchPlatform();
    
    // Poll every 30 seconds
    const interval = setInterval(fetchPlatform, 30000);
    return () => clearInterval(interval);
  }, [program]);

  return { platform, loading };
}

export function useWhitelist(tokenMint?: PublicKey) {
  const { program } = useProgram();
  const [whitelist, setWhitelist] = useState<WhitelistEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!program || !tokenMint) {
      setLoading(false);
      return;
    }

    const fetchWhitelist = async () => {
      try {
        const [whitelistPda] = getWhitelistPDA(tokenMint);
        const whitelistAccount = await program.account.tokenWhitelist.fetch(whitelistPda);
        setWhitelist(whitelistAccount as WhitelistEntry);
      } catch (error) {
        // Entry doesn't exist
        setWhitelist(null);
      } finally {
        setLoading(false);
      }
    };

    fetchWhitelist();
  }, [program, tokenMint]);

  return { whitelist, loading };
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
        .filter((entry: any) => entry.isWhitelisted) as WhitelistEntry[];
      
      setWhitelisted(entries);
    } catch (error) {
      console.error('Error fetching whitelisted tokens:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllWhitelisted();
    
    // Poll every 30 seconds
    const interval = setInterval(fetchAllWhitelisted, 30000);
    return () => clearInterval(interval);
  }, [program]);

  return { whitelisted, loading, refetch: fetchAllWhitelisted };
}
