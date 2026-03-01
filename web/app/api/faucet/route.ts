import { NextRequest, NextResponse } from 'next/server';
import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { createTransferInstruction, createAssociatedTokenAccountInstruction, getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import bs58 from 'bs58';

// Simple in-memory rate limiting (resets on server restart)
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds
const AIRDROP_AMOUNT = 100; // 100 tokens

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, tokenMint } = await request.json();

    // Validate inputs
    if (!walletAddress || !tokenMint) {
      return NextResponse.json(
        { error: 'Wallet address and token mint are required' },
        { status: 400 }
      );
    }

    // Validate wallet address
    let userPublicKey: PublicKey;
    try {
      userPublicKey = new PublicKey(walletAddress);
    } catch {
      return NextResponse.json(
        { error: 'Invalid wallet address' },
        { status: 400 }
      );
    }

    // Validate token mint
    let tokenMintPublicKey: PublicKey;
    try {
      tokenMintPublicKey = new PublicKey(tokenMint);
    } catch {
      return NextResponse.json(
        { error: 'Invalid token mint address' },
        { status: 400 }
      );
    }

    // Check rate limit
    const now = Date.now();
    const rateLimitKey = `${walletAddress}-${tokenMint}`;
    const lastRequest = rateLimitMap.get(rateLimitKey);

    if (lastRequest && now - lastRequest < RATE_LIMIT_WINDOW) {
      const timeLeft = Math.ceil((RATE_LIMIT_WINDOW - (now - lastRequest)) / 1000 / 60);
      return NextResponse.json(
        { error: `Please wait ${timeLeft} minutes before requesting again` },
        { status: 429 }
      );
    }

    // Get faucet private key from environment
    const faucetPrivateKey = process.env.FAUCET_PRIVATE_KEY;
    if (!faucetPrivateKey) {
      console.error('FAUCET_PRIVATE_KEY not configured');
      return NextResponse.json(
        { error: 'Faucet not configured' },
        { status: 500 }
      );
    }

    // Create faucet keypair
    const faucetKeypair = Keypair.fromSecretKey(bs58.decode(faucetPrivateKey));

    // Connect to Solana
    const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com';
    const connection = new Connection(rpcUrl, 'confirmed');

    // Get token decimals
    const mintInfo = await connection.getParsedAccountInfo(tokenMintPublicKey);
    const parsedData = mintInfo.value?.data as { parsed?: { info?: { decimals?: number } } } | null;
    const decimals = parsedData?.parsed?.info?.decimals || 9;
    const amount = AIRDROP_AMOUNT * Math.pow(10, decimals);

    // Get token accounts
    const faucetTokenAccount = await getAssociatedTokenAddress(
      tokenMintPublicKey,
      faucetKeypair.publicKey,
      false,
      TOKEN_PROGRAM_ID
    );

    const userTokenAccount = await getAssociatedTokenAddress(
      tokenMintPublicKey,
      userPublicKey,
      false,
      TOKEN_PROGRAM_ID
    );

    // Check if user token account exists
    const userAccountInfo = await connection.getAccountInfo(userTokenAccount);
    
    // Create transaction
    const transaction = new Transaction();
    
    // If user token account doesn't exist, create it
    if (!userAccountInfo) {
      transaction.add(
        createAssociatedTokenAccountInstruction(
          faucetKeypair.publicKey, // payer
          userTokenAccount,
          userPublicKey,
          tokenMintPublicKey,
          TOKEN_PROGRAM_ID
        )
      );
    }

    // Add transfer instruction
    transaction.add(
      createTransferInstruction(
        faucetTokenAccount,
        userTokenAccount,
        faucetKeypair.publicKey,
        amount,
        [],
        TOKEN_PROGRAM_ID
      )
    );

    // Send transaction
    const signature = await connection.sendTransaction(transaction, [faucetKeypair], {
      skipPreflight: false,
      preflightCommitment: 'confirmed',
    });

    // Wait for confirmation
    await connection.confirmTransaction(signature, 'confirmed');

    // Update rate limit
    rateLimitMap.set(rateLimitKey, now);

    return NextResponse.json({
      success: true,
      signature,
      amount: AIRDROP_AMOUNT,
      message: `Successfully sent ${AIRDROP_AMOUNT} tokens!`,
    });

  } catch (error) {
    console.error('Faucet error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send tokens' },
      { status: 500 }
    );
  }
}
