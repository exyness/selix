import { Program, AnchorProvider } from '@coral-xyz/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import { Selix } from './types/selix';
import IDL from './idl/selix.json';

export const PROGRAM_ID = new PublicKey(IDL.address);

export const SELIX_PROGRAM_ID = PROGRAM_ID;

// RPC endpoints
export const RPC_ENDPOINTS = {
  mainnet: 'https://api.mainnet-beta.solana.com',
  devnet: 'https://api.devnet.solana.com',
  localnet: 'http://localhost:8899',
};

// Get program instance
export function getProgram(provider: AnchorProvider): Program<Selix> {
  return new Program(IDL as Selix, provider);
}

// PDA seeds
export const SEEDS = {
  PLATFORM: Buffer.from('platform'),
  USER_PROFILE: Buffer.from('user_profile'),
  LISTING: Buffer.from('listing'),
  WHITELIST: Buffer.from('whitelist'),
};

// Derive PDAs
export function getPlatformPDA(authority?: PublicKey): [PublicKey, number] {
  // If no authority provided, we can't derive the PDA
  // This should be called with the authority wallet
  if (!authority) {
    throw new Error('Authority public key required to derive platform PDA');
  }
  
  return PublicKey.findProgramAddressSync(
    [SEEDS.PLATFORM, authority.toBuffer()],
    PROGRAM_ID
  );
}

export function getUserProfilePDA(user: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [SEEDS.USER_PROFILE, user.toBuffer()],
    PROGRAM_ID
  );
}

export function getListingPDA(maker: PublicKey, listingId: number): [PublicKey, number] {
  const idBuffer = Buffer.alloc(8);
  idBuffer.writeBigUInt64LE(BigInt(listingId));
  
  return PublicKey.findProgramAddressSync(
    [SEEDS.LISTING, maker.toBuffer(), idBuffer],
    PROGRAM_ID
  );
}

export function getVaultPDA(listing: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [listing.toBuffer()],
    PROGRAM_ID
  );
}

export function getWhitelistPDA(mint: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [SEEDS.WHITELIST, mint.toBuffer()],
    PROGRAM_ID
  );
}
