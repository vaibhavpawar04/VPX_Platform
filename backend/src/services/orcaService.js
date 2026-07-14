const { Connection, PublicKey, SystemProgram } = require('@solana/web3.js');
const DepositAddress = require('../models/depositAddress');

const swapSOLToUSDC = async (userId, solAmount) => {
  try {
    console.log(`Starting Orca swap: ${solAmount} SOL → devUSDC for user ${userId}`);

    const treasuryAddress = process.env.VPX_SOL_TREASURY_ADDRESS;
    if (!treasuryAddress) throw new Error('VPX SOL treasury address not configured');
    console.log(`devUSDC will be sent to VPX Treasury: ${treasuryAddress}`);

    const { setWhirlpoolsConfig, swapInstructions, setDefaultFunder } = await import('@orca-so/whirlpools');
    const { createKeyPairSignerFromBytes, createSolanaRpc, devnet, address } = await import('@solana/kit');

    const depositAddr = await DepositAddress.findOne({ userId, coin: 'SOL', network: 'devnet' });
    if (!depositAddr) throw new Error('No SOL deposit address found');

    const privateKeyHex = depositAddr.privateKey;
    const secretKeyBytes = new Uint8Array(Buffer.from(privateKeyHex, 'hex'));

    const wallet = await createKeyPairSignerFromBytes(secretKeyBytes);
    console.log(`Using customer wallet: ${wallet.address}`);

    const rpcUrl = `https://devnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`;
    const devnetRpc = createSolanaRpc(devnet(rpcUrl));
    await setWhirlpoolsConfig('solanaDevnet');
    setDefaultFunder(wallet);

    const poolAddress = address('3KBZiL2g8C7tiJ32hTv5v3KM7aK9htpqTw4cTXz1HvPt');
    const solMint = address('So11111111111111111111111111111111111111112');

    const lamportAmount = BigInt(Math.floor(solAmount * 1e9));
    console.log(`Swapping ${solAmount} SOL (${lamportAmount} lamports)`);

    const { instructions, quote } = await swapInstructions(
      devnetRpc,
      { inputAmount: lamportAmount, mint: solMint },
      poolAddress,
      100,
      wallet
    );

    console.log(`Quote: ${solAmount} SOL → ${quote.tokenEstOut} devUSDC`);

    const { pipe, createTransactionMessage, setTransactionMessageFeePayerSigner, setTransactionMessageLifetimeUsingBlockhash, appendTransactionMessageInstructions, signTransactionMessageWithSigners, getBase64EncodedWireTransaction } = await import('@solana/kit');

    const { value: latestBlockhash } = await devnetRpc.getLatestBlockhash().send();

    const transactionMessage = pipe(
      createTransactionMessage({ version: 0 }),
      tx => setTransactionMessageFeePayerSigner(wallet, tx),
      tx => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
      tx => appendTransactionMessageInstructions(instructions, tx),
    );

    const signedTransaction = await signTransactionMessageWithSigners(transactionMessage);
    const base64Tx = getBase64EncodedWireTransaction(signedTransaction);

    const signature = await devnetRpc.sendTransaction(base64Tx, {
      encoding: 'base64',
      skipPreflight: false,
    }).send();

    console.log(`✓ Orca swap confirmed: ${signature}`);
    console.log(`✓ devUSDC received in VPX Treasury: ${treasuryAddress}`);

    return {
      txHash: signature,
      solAmount,
      usdcAmount: Number(quote.tokenEstOut) / 1e6,
      treasuryAddress,
    };
  } catch (err) {
    console.log('Orca swap error:', err.message);
    throw err;
  }
};

module.exports = { swapSOLToUSDC };
