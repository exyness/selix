'use client';

import { useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { getAssociatedTokenAddressSync, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';
import { useProgram } from '../../use-program';
import { getUserProfilePDA, getListingPDA, getVaultPDA, getPlatformPDA } from '@/lib/anchor/setup';
import { toast } from 'sonner';

export interface CreateListingParams {
  offeredMint: PublicKey;
  offeredAmount: number;
  requestedMint: PublicKey;
  requestedAmount: number;
  minFillAmount: number;
  maxSlippageBps: number;
  expiresAt: number;
  referrer?: PublicKey;
}

export function useCreateListing() {
  const { program, wallet } = useProgram();
  const [loading, setLoading] = useState(false);

  const createListing = async (params: CreateListingParams) => {
    if (!program || !wallet.publicKey) {
      toast.error('Please connect your wallet');
      return null;
    }

    setLoading(true);
    try {
      const [userProfile] = getUserProfilePDA(wallet.publicKey);
      const [platform] = getPlatformPDA();
      
      // Get next listing ID from user profile (you'll need to fetch this)
      const listingId = 0; // TODO: Fetch from user profile
      
      const [listing] = getListingPDA(wallet.publicKey, listingId);
      const [vault] = getVaultPDA(listing);
      
      const makerAta = getAssociatedTokenAddressSync(
        params.offeredMint,
        wallet.publicKey,
        false,
        TOKEN_2022_PROGRAM_ID
      );

      const tx = await program.methods
        .createListing({
          offeredAmount: new BN(params.offeredAmount),
          requestedMint: params.requestedMint,
          requestedAmount: new BN(params.requestedAmount),
          minFillAmount: new BN(params.minFillAmount),
          maxSlippageBps: params.maxSlippageBps,
          expiresAt: new BN(params.expiresAt),
          referrer: params.referrer || null,
        })
        .accounts({
          maker: wallet.publicKey,
          makerProfile: userProfile,
          platform,
          listing,
          vault,
          tokenMintSource: params.offeredMint,
          makerTokenAccountSource: makerAta,
        })
        .rpc();

      toast.success('Listing created successfully!');
      return { signature: tx, listing };
    } catch (error: unknown) {
      console.error('Error creating listing:', error);
      const message = error instanceof Error ? error.message : 'Failed to create listing';
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createListing, loading };
}
