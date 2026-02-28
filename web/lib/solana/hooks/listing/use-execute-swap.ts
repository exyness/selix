'use client';

import { useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useProgram } from '../../use-program';
import { getUserProfilePDA, getPlatformPDA } from '@/lib/anchor/setup';
import { toast } from 'sonner';

export interface ExecuteSwapParams {
  listing: PublicKey;
  maker: PublicKey;
  offeredMint: PublicKey;
  requestedMint: PublicKey;
  fillAmount: number;
}

export function useExecuteSwap() {
  const { program, wallet } = useProgram();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (params: ExecuteSwapParams) => {
      if (!program || !wallet.publicKey) {
        throw new Error('Wallet not connected');
      }

      // Fetch platform - need to get it from all accounts since we don't know the authority
      const platformAccounts = await program.account.platform.all();
      if (platformAccounts.length === 0) {
        throw new Error('Platform not initialized. Please contact the administrator.');
      }
      
      const platform = platformAccounts[0].publicKey;
      const platformData = platformAccounts[0].account;
      const feeCollector = platformData.feeCollector;
      
      const [takerProfile] = getUserProfilePDA(wallet.publicKey);
      const [makerProfile] = getUserProfilePDA(params.maker);
      
      // Check if profiles exist using fetchNullable
      const takerProfileData = await program.account.userProfile.fetchNullable(takerProfile);
      const makerProfileData = await program.account.userProfile.fetchNullable(makerProfile);
      
      // Fetch listing to calculate proper destination amount
      const listingData = await program.account.listing.fetch(params.listing);
      
      // Calculate proportional destination amount based on listing's rate
      const sourceAmount = BigInt(params.fillAmount);
      const totalSource = BigInt(listingData.amountSourceTotal.toString());
      const totalDestination = BigInt(listingData.amountDestinationTotal.toString());
      
      // Calculate: (fillAmount * totalDestination) / totalSource
      const expectedDestination = (sourceAmount * totalDestination) / totalSource;
      
      // Add 1% slippage tolerance
      const maxDestination = (expectedDestination * BigInt(101)) / BigInt(100);
      
      // Determine token program
      let tokenProgram = TOKEN_PROGRAM_ID;
      const testAta = getAssociatedTokenAddressSync(
        params.offeredMint,
        wallet.publicKey,
        false,
        TOKEN_PROGRAM_ID
      );
      const accountInfo = await program.provider.connection.getAccountInfo(testAta);
      if (!accountInfo) {
        tokenProgram = TOKEN_2022_PROGRAM_ID;
      }
      
      const vault = getAssociatedTokenAddressSync(
        params.offeredMint,
        params.listing,
        true, // allowOwnerOffCurve for PDA
        tokenProgram
      );
      
      const takerOfferedAta = getAssociatedTokenAddressSync(
        params.requestedMint,
        wallet.publicKey,
        false,
        tokenProgram
      );

      const takerRequestedAta = getAssociatedTokenAddressSync(
        params.offeredMint,
        wallet.publicKey,
        false,
        tokenProgram
      );

      const makerRequestedAta = getAssociatedTokenAddressSync(
        params.requestedMint,
        params.maker,
        false,
        tokenProgram
      );

      const feeCollectorTokenAccount = getAssociatedTokenAddressSync(
        params.requestedMint,
        feeCollector,
        false,
        tokenProgram
      );

      // For optional accounts, pass program ID if they don't exist
      const accounts: any = {
        taker: wallet.publicKey,
        takerProfile: takerProfileData ? takerProfile : program.programId,
        maker: params.maker,
        makerProfile: makerProfileData ? makerProfile : program.programId,
        platform,
        feeCollector,
        listing: params.listing,
        vault,
        takerTokenAccountSource: takerRequestedAta,
        takerTokenAccountDestination: takerOfferedAta,
        makerTokenAccountDestination: makerRequestedAta,
        feeCollectorTokenAccount,
        tokenMintSource: params.offeredMint,
        tokenMintDestination: params.requestedMint,
        tokenProgram,
      };

      const tx = await program.methods
        .executeSwap({
          amountSource: new BN(params.fillAmount),
          maxAmountDestination: new BN(maxDestination.toString()),
        })
        .accounts(accounts)
        .rpc();

      return { signature: tx };
    },
    onSuccess: () => {
      // Invalidate and refetch listings
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      toast.success('Swap executed successfully!');
    },
    onError: (error: unknown) => {
      console.error('Error executing swap:', error);
      const message = error instanceof Error ? error.message : 'Failed to execute swap';
      toast.error(message);
    },
  });

  return {
    executeSwap: mutation.mutateAsync,
    loading: mutation.isPending,
  };
}
