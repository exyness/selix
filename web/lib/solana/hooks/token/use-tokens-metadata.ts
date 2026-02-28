'use client';

import { PublicKey } from '@solana/web3.js';
import { useConnection } from '@solana/wallet-adapter-react';
import { useQuery } from '@tanstack/react-query';
import { getMint } from '@solana/spl-token';

export interface TokenMetadata {
  mint: string;
  name: string;
  symbol: string;
  image?: string;
  decimals: number;
}

export function useTokensMetadata(mints: PublicKey[]) {
  const { connection } = useConnection();

  const { data: tokensMetadata, isLoading: loading, refetch } = useQuery({
    queryKey: ['tokensMetadata', mints.map(m => m.toString()).join(',')],
    queryFn: async () => {
      if (mints.length === 0) return [];

      const metadataPromises = mints.map(async (mint) => {
        try {
          // First, get the mint account to get decimals
          const mintInfo = await getMint(connection, mint);
          
          // Try to get Metaplex metadata
          const metadataPDA = await getMetadataPDA(mint);
          const accountInfo = await connection.getAccountInfo(metadataPDA);
          
          if (accountInfo) {
            const onChainMetadata = parseMetadata(accountInfo.data);
            
            // Try to fetch off-chain metadata if URI exists
            if (onChainMetadata.uri) {
              try {
                const response = await fetch(onChainMetadata.uri, { 
                  signal: AbortSignal.timeout(3000) // 3 second timeout
                });
                if (response.ok) {
                  const offChainData = await response.json();
                  return {
                    mint: mint.toString(),
                    name: offChainData.name || onChainMetadata.name,
                    symbol: offChainData.symbol || onChainMetadata.symbol,
                    image: offChainData.image || offChainData.logo,
                    decimals: mintInfo.decimals,
                  };
                }
              } catch {
                // Failed to fetch off-chain metadata, use on-chain data
              }
            }
            
            return {
              mint: mint.toString(),
              name: onChainMetadata.name,
              symbol: onChainMetadata.symbol,
              decimals: mintInfo.decimals,
            };
          }
          
          // Fallback: use mint address as identifier
          const mintStr = mint.toString();
          return {
            mint: mintStr,
            name: `${mintStr.slice(0, 4)}...${mintStr.slice(-4)}`,
            symbol: mintStr.slice(0, 4).toUpperCase(),
            decimals: mintInfo.decimals,
          };
        } catch (error) {
          console.error(`Failed to fetch metadata for ${mint.toString()}:`, error);
          const mintStr = mint.toString();
          return {
            mint: mintStr,
            name: `${mintStr.slice(0, 4)}...${mintStr.slice(-4)}`,
            symbol: mintStr.slice(0, 4).toUpperCase(),
            decimals: 9,
          };
        }
      });

      return await Promise.all(metadataPromises);
    },
    enabled: mints.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return { tokensMetadata: tokensMetadata ?? [], loading, refetch };
}

// Helper to get Metaplex metadata PDA
async function getMetadataPDA(mint: PublicKey): Promise<PublicKey> {
  const METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');
  const [pda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('metadata'),
      METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
    ],
    METADATA_PROGRAM_ID
  );
  return pda;
}

// Basic metadata parser
function parseMetadata(data: Buffer): { name: string; symbol: string; uri?: string } {
  try {
    // This is a simplified parser for Metaplex metadata
    const nameLength = data.readUInt32LE(65);
    const name = data.subarray(69, 69 + nameLength).toString('utf8').replace(/\0/g, '').trim();
    
    const symbolStart = 69 + nameLength + 4;
    const symbolLength = data.readUInt32LE(69 + nameLength);
    const symbol = data.subarray(symbolStart, symbolStart + symbolLength).toString('utf8').replace(/\0/g, '').trim();
    
    const uriStart = symbolStart + symbolLength + 4;
    const uriLength = data.readUInt32LE(symbolStart + symbolLength);
    const uri = data.subarray(uriStart, uriStart + uriLength).toString('utf8').replace(/\0/g, '').trim();

    return {
      name: name || 'Unknown Token',
      symbol: symbol || 'UNKNOWN',
      uri: uri || undefined,
    };
  } catch {
    return {
      name: 'Unknown Token',
      symbol: 'UNKNOWN',
    };
  }
}
