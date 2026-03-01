'use client';

import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { useQuery } from '@tanstack/react-query';
import { useProgram } from '../../use-program';
import { useFetchListings } from './use-fetch-listings';

export interface SwapEvent {
  listing: PublicKey;
  taker: PublicKey;
  maker: PublicKey;
  tokenMintSource: PublicKey;
  tokenMintDestination: PublicKey;
  amountSource: BN;
  amountDestination: BN;
  fee: BN;
  timestamp: BN;
  signature: string;
  blockTime: number;
  fillCount: number;
}

export function useFetchSwaps(userPublicKey?: PublicKey | null) {
  const { program } = useProgram();
  const { listings } = useFetchListings();

  const { data: swaps, isLoading: loading, refetch } = useQuery({
    queryKey: ['swaps', userPublicKey?.toString(), program?.programId.toString()],
    queryFn: async () => {
      if (!program || !userPublicKey) return [];
      
      try {
        // Fetch platform to get fee basis points
        const platformAccounts = await program.account.platform.all();
        if (platformAccounts.length === 0) {
          console.warn('Platform not initialized');
          return [];
        }
        
        const platformData = platformAccounts[0].account;
        const feeBps = platformData.feeBasisPoints;
        
        const swapEvents: SwapEvent[] = [];
        
        // Fetch transaction signatures for the user
        const signatures = await program.provider.connection.getSignaturesForAddress(
          userPublicKey,
          { limit: 100 }
        );
        
        // Filter listings where user is either maker or taker
        for (const listing of listings) {
          if (listing.fillCount === 0) continue;
          
          const amountFilled = listing.amountSourceTotal.sub(listing.amountSourceRemaining);
          if (!amountFilled.gt(new BN(0))) continue;
          
          // Check if user is the maker
          const isMaker = listing.maker.equals(userPublicKey);
          
          // For now, include all filled listings where user is maker
          // For takers, we'll need to check transaction history more thoroughly
          // This is a simplified version - ideally we'd parse transaction logs
          if (!isMaker) {
            // Check if user has any transactions in the relevant timeframe
            const hasPotentialTakerTx = signatures.some(sig => 
              sig.blockTime && 
              sig.blockTime >= listing.createdAt.toNumber() &&
              sig.blockTime <= (listing.updatedAt.toNumber() + 3600) // Add 1 hour buffer
            );
            
            if (!hasPotentialTakerTx) continue;
          }
          
          // Calculate approximate amounts per fill
          const avgAmountPerFill = amountFilled.div(new BN(listing.fillCount));
          const rate = listing.amountDestinationTotal.toNumber() / listing.amountSourceTotal.toNumber();
          const avgDestPerFill = new BN(Math.floor(avgAmountPerFill.toNumber() * rate));
          
          // Calculate fee: (avgDestPerFill * feeBps) / 10000
          // Fee is taken from destination token amount
          const feeAmount = avgDestPerFill.mul(new BN(feeBps)).div(new BN(10000));
          
          // Debug logging
          console.log('Swap calculation:', {
            listingId: listing.publicKey.toString().slice(0, 8),
            feeBps,
            avgDestPerFill: avgDestPerFill.toString(),
            feeAmount: feeAmount.toString(),
            feePercentage: (feeBps / 100).toFixed(2) + '%'
          });
          
          // Try to find transaction signatures related to this listing
          const listingSignatures = signatures.filter(sig => 
            sig.blockTime && 
            sig.blockTime >= listing.createdAt.toNumber() &&
            sig.blockTime <= listing.updatedAt.toNumber()
          ).slice(0, listing.fillCount);
          
          // Create a swap event for each fill
          for (let i = 0; i < listing.fillCount; i++) {
            swapEvents.push({
              listing: listing.publicKey,
              taker: isMaker ? userPublicKey : userPublicKey, // This is approximate
              maker: listing.maker,
              tokenMintSource: listing.tokenMintSource,
              tokenMintDestination: listing.tokenMintDestination,
              amountSource: avgAmountPerFill,
              amountDestination: avgDestPerFill,
              fee: feeAmount,
              timestamp: listing.updatedAt,
              signature: listingSignatures[i]?.signature || '',
              blockTime: listingSignatures[i]?.blockTime || listing.updatedAt.toNumber(),
              fillCount: i + 1,
            });
          }
        }
        
        // Sort by timestamp descending (most recent first)
        swapEvents.sort((a, b) => b.blockTime - a.blockTime);
        
        return swapEvents;
      } catch (error) {
        console.error('Error fetching swaps:', error);
        return [];
      }
    },
    enabled: !!program && !!userPublicKey && listings.length > 0,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return { swaps: swaps ?? [], loading, refetch };
}
