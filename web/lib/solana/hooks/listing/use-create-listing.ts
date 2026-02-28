'use client';

import { useState } from 'react';
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { useProgram } from '../../use-program';
import { getUserProfilePDA, getListingPDA, getPlatformPDA, getWhitelistPDA } from '@/lib/anchor/setup';
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
      
      // Fetch platform - need to get it from all accounts since we don't know the authority
      const platformAccounts = await program.account.platform.all();
      if (platformAccounts.length === 0) {
        toast.error('Platform not initialized. Please contact the administrator.');
        return null;
      }
      
      const platformAccount = platformAccounts[0];
      const platform = platformAccount.publicKey;
      const platformData = platformAccount.account;
      
      console.log('Platform data:', {
        whitelistEnabled: platformData.whitelistEnabled,
        isPaused: platformData.isPaused,
        authority: platformData.authority.toString(),
      });
      
      // Fetch user profile to get next listing ID
      const profileAccount = await program.account.userProfile.fetch(userProfile);
      const listingId = profileAccount.listingsCreated.toNumber();
      
      const [listing] = getListingPDA(wallet.publicKey, listingId);
      
      // Try to get ATA with standard token program first, then Token-2022
      let makerAta: PublicKey;
      let tokenProgram: PublicKey;
      try {
        makerAta = getAssociatedTokenAddressSync(
          params.offeredMint,
          wallet.publicKey,
          false,
          TOKEN_PROGRAM_ID
        );
        // Check if account exists with standard program
        const accountInfo = await program.provider.connection.getAccountInfo(makerAta);
        if (accountInfo) {
          tokenProgram = TOKEN_PROGRAM_ID;
          console.log('Using standard TOKEN_PROGRAM_ID');
        } else {
          throw new Error('Account not found with standard program');
        }
      } catch {
        makerAta = getAssociatedTokenAddressSync(
          params.offeredMint,
          wallet.publicKey,
          false,
          TOKEN_2022_PROGRAM_ID
        );
        tokenProgram = TOKEN_2022_PROGRAM_ID;
        console.log('Using TOKEN_2022_PROGRAM_ID');
      }

      // Vault is an ATA owned by the listing account
      const vault = getAssociatedTokenAddressSync(
        params.offeredMint,
        listing,
        true, // allowOwnerOffCurve = true for PDA ownership
        tokenProgram
      );

      // Calculate duration from expiresAt
      const now = Math.floor(Date.now() / 1000);
      const durationSeconds = params.expiresAt - now;

      console.log('Creating listing with params:', {
        listingId,
        maker: wallet.publicKey.toString(),
        platform: platform.toString(),
        listing: listing.toString(),
        vault: vault.toString(),
        makerAta: makerAta.toString(),
        tokenMintSource: params.offeredMint.toString(),
        tokenMintDestination: params.requestedMint.toString(),
        whitelistEnabled: platformData.whitelistEnabled,
      });

      console.log('All accounts being passed:', {
        maker: wallet.publicKey.toString(),
        makerProfile: userProfile.toString(),
        platform: platform.toString(),
        listing: listing.toString(),
        vault: vault.toString(),
        makerTokenAccountSource: makerAta.toString(),
        tokenMintSource: params.offeredMint.toString(),
        tokenMintDestination: params.requestedMint.toString(),
        tokenProgram: tokenProgram.toString(),
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID.toString(),
        systemProgram: SystemProgram.programId.toString(),
      });

      // Build accounts object
      const accounts: any = {
        maker: wallet.publicKey,
        makerProfile: userProfile,
        platform,
        listing,
        vault,
        makerTokenAccountSource: makerAta,
        tokenMintSource: params.offeredMint,
        tokenMintDestination: params.requestedMint,
        tokenProgram: tokenProgram,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      };

      // Add whitelist accounts (pass null if whitelist is disabled)
      if (platformData.whitelistEnabled) {
        const [sourceWhitelist] = getWhitelistPDA(params.offeredMint);
        const [destWhitelist] = getWhitelistPDA(params.requestedMint);
        accounts.sourceWhitelist = sourceWhitelist;
        accounts.destWhitelist = destWhitelist;
        console.log('Whitelist enabled, adding accounts:', {
          sourceWhitelist: sourceWhitelist.toString(),
          destWhitelist: destWhitelist.toString(),
        });
      } else {
        // Pass null for optional accounts when whitelist is disabled
        accounts.sourceWhitelist = null;
        accounts.destWhitelist = null;
        console.log('Whitelist disabled, passing null for whitelist accounts');
      }

      const tx = await program.methods
        .createListing({
          id: new BN(listingId),
          amountSource: new BN(params.offeredAmount),
          amountDestination: new BN(params.requestedAmount),
          minFillAmount: new BN(params.minFillAmount),
          maxSlippageBps: params.maxSlippageBps,
          durationSeconds: new BN(durationSeconds),
        })
        .accounts(accounts)
        .rpc();

      toast.success('Listing created successfully!');
      return { signature: tx, listing };
    } catch (error: unknown) {
      console.error('Error creating listing:', error);
      
      // Log transaction details if available
      if (error && typeof error === 'object' && 'logs' in error) {
        console.error('Transaction logs:', (error as any).logs);
      }
      if (error && typeof error === 'object' && 'transactionLogs' in error) {
        console.error('Transaction logs:', (error as any).transactionLogs);
      }
      
      const message = error instanceof Error ? error.message : 'Failed to create listing';
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createListing, loading };
}
