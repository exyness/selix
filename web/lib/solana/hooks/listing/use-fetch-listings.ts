'use client';

import { useState, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { useProgram } from '../../use-program';

export interface Listing {
  publicKey: PublicKey;
  id: BN;
  maker: PublicKey;
  tokenMintSource: PublicKey;
  tokenMintDestination: PublicKey;
  amountSourceTotal: BN;
  amountSourceRemaining: BN;
  amountDestinationTotal: BN;
  amountDestinationRemaining: BN;
  minFillAmount: BN;
  maxSlippageBps: number;
  expiresAt: BN;
  createdAt: BN;
  updatedAt: BN;
  status: { active?: {} } | { completed?: {} } | { cancelled?: {} } | { expired?: {} };
  fillCount: number;
  bump: number;
}

export function useFetchListings() {
  const { program } = useProgram();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!program) return;

    const fetchListings = async () => {
      try {
        const accounts = await program.account.listing.all();
        const listingsData = accounts.map((account) => ({
          publicKey: account.publicKey,
          ...account.account,
        })) as Listing[];
        
        // Filter only active listings
        const activeListings = listingsData.filter(
          (listing) => listing.status.active !== undefined
        );
        
        setListings(activeListings);
      } catch (error) {
        console.error('Error fetching listings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
    
    // Poll every 10 seconds
    const interval = setInterval(fetchListings, 10000);
    return () => clearInterval(interval);
  }, [program]);

  return { listings, loading };
}
