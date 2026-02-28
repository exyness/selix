'use client';

import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { useQuery } from '@tanstack/react-query';
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
  status: { active?: {} } | { partiallyFilled?: {} } | { completed?: {} } | { cancelled?: {} } | { expired?: {} };
  fillCount: number;
  bump: number;
}

export function useFetchListings() {
  const { program } = useProgram();

  const { data: listings, isLoading: loading, refetch } = useQuery({
    queryKey: ['listings', program?.programId.toString()],
    queryFn: async () => {
      if (!program) return [];
      
      const accounts = await program.account.listing.all();
      const listingsData = accounts.map((account) => ({
        publicKey: account.publicKey,
        ...account.account,
      })) as Listing[];
      
      // Show active and partially filled listings
      const activeListings = listingsData.filter(
        (listing) => listing.status.active !== undefined || listing.status.partiallyFilled !== undefined
      );
      
      return activeListings;
    },
    enabled: !!program,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
  });

  return { listings: listings ?? [], loading, refetch };
}
