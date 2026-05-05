const { Connection, PublicKey, Keypair, LAMPORTS_PER_SOL, SystemProgram, Transaction } = require('@solana/web3.js');
const Balance = require('../models/Balance');
const TransactionModel = require('../models/Transaction');
const DepositAddress = require('../models/depositAddress');

// In-memory lock to prevent duplicate processing
const processingSigs = new Set();

const getConnection = () => {
  const apiKey = process.env.HELIUS_API_KEY;
  console.log('Helius API Key loaded:', apiKey ? `${apiKey.slice(0, 8)}...` : 'MISSING');
  const rpc = `https://devnet.helius-rpc.com/?api-key=${apiKey}`;
  return new Connection(rpc, 'confirmed');
};

// Generate unique SOL deposit address for user
const generateSolanaDepositAddress = async (userId) => {
  try {
    let depositAddr = await DepositAddress.findOne({ userId, coin: 'SOL', network: 'devnet' });
    if (depositAddr) return depositAddr.address;

    const keypair = Keypair.generate();
    const address = keypair.publicKey.toString();
    const privateKey = Buffer.from(keypair.secretKey).toString('hex');

    await DepositAddress.create({
      userId,
      coin: 'SOL',
      address,
      privateKey,
      network: 'devnet',
    });

    console.log(`Generated SOL deposit address for user ${userId}: ${address}`);
    return address;

  } catch (err) {
    console.log('Generate SOL deposit address error:', err.message);
    throw err;
  }
};

// Check past SOL transactions
const checkPastSolanaTransactions = async (address, userId) => {
  try {
    console.log(`Checking past SOL transactions for ${address}`);
    const connection = getConnection();
    const pubkey = new PublicKey(address);

    const signatures = await connection.getSignaturesForAddress(pubkey, { limit: 20 });
    console.log(`Found ${signatures.length} past SOL transactions`);

    for (const sig of signatures) {

      // Skip if already being processed in memory
      if (processingSigs.has(sig.signature)) {
        console.log('SOL transaction already in-flight:', sig.signature);
        continue;
      }

      const existing = await TransactionModel.findOne({ txHash: sig.signature });
      if (existing) {
        console.log('SOL transaction already processed:', sig.signature);
        continue;
      }

      // Lock it immediately before any await
      processingSigs.add(sig.signature);

      try {
        const tx = await connection.getTransaction(sig.signature, {
          maxSupportedTransactionVersion: 0
        });

        if (!tx || !tx.meta) { processingSigs.delete(sig.signature); continue; }

        const accountIndex = tx.transaction.message.staticAccountKeys
          ? tx.transaction.message.staticAccountKeys.findIndex(k => k.toString() === address)
          : tx.transaction.message.accountKeys.findIndex(k => k.toString() === address);

        if (accountIndex === -1) { processingSigs.delete(sig.signature); continue; }

        const preBalance = tx.meta.preBalances[accountIndex];
        const postBalance = tx.meta.postBalances[accountIndex];
        const diff = postBalance - preBalance;

        if (diff <= 0) { processingSigs.delete(sig.signature); continue; }

        const solAmount = diff / LAMPORTS_PER_SOL;

        await Balance.updateOne(
          { userId, coin: 'SOL' },
          { $inc: { amount: solAmount }, $set: { updatedAt: new Date() } },
          { upsert: true }
        );

        await TransactionModel.create({
          userId,
          type: 'deposit',
          coin: 'SOL',
          amount: solAmount,
          txHash: sig.signature,
          status: 'confirmed',
          note: 'Solana devnet deposit',
        });

        console.log(`✓ Credited ${solAmount} SOL to user ${userId} - TxHash: ${sig.signature}`);

      } catch (err) {
        console.log('Error processing SOL tx:', err.message);
        // Don't delete from processingSigs — prevents retry of bad tx
      }
    }

  } catch (err) {
    console.log('Check past SOL transactions error:', err.message);
  }
};

// Monitor SOL address for new transactions
const monitorSolanaAddress = async (address, userId) => {
  console.log(`Monitoring SOL address: ${address} for user: ${userId}`);
  await checkPastSolanaTransactions(address, userId);

  const connection = getConnection();
  const pubkey = new PublicKey(address);

  connection.onAccountChange(pubkey, async (accountInfo, context) => {
    console.log(`SOL account change detected for ${address}`);
    await checkPastSolanaTransactions(address, userId);
  }, 'confirmed');
};

// Withdraw SOL
const withdrawSOL = async (userId, toAddress, amount) => {
  try {
    console.log(`Starting SOL withdrawal: ${amount} SOL to ${toAddress}`);

    const depositAddr = await DepositAddress.findOne({ userId, coin: 'SOL', network: 'devnet' });
    if (!depositAddr) throw new Error('No SOL deposit address found for user');

    const connection = getConnection();
    const secretKey = Buffer.from(depositAddr.privateKey, 'hex');
    const keypair = Keypair.fromSecretKey(secretKey);

    const balance = await connection.getBalance(keypair.publicKey);
    const balanceSOL = balance / LAMPORTS_PER_SOL;
    console.log(`SOL wallet balance on chain: ${balanceSOL} SOL`);

    const lamports = Math.floor(amount * LAMPORTS_PER_SOL);
    const feeEstimate = 5000;

    if (balance < lamports + feeEstimate) {
      throw new Error(`Insufficient SOL balance. Available: ${balanceSOL} SOL`);
    }

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: keypair.publicKey,
        toPubkey: new PublicKey(toAddress),
        lamports: lamports - feeEstimate,
      })
    );

    const signature = await connection.sendTransaction(transaction, [keypair]);
    await connection.confirmTransaction(signature, 'confirmed');

    console.log(`SOL withdrawal confirmed: ${signature}`);
    return { txHash: signature, amount: (lamports - feeEstimate) / LAMPORTS_PER_SOL };

  } catch (err) {
    console.log('Withdraw SOL error:', err.message);
    throw err;
  }
};

// Start monitoring all existing SOL deposit addresses
const startSolanaMonitoring = async () => {
  try {
    const depositAddresses = await DepositAddress.find({ coin: 'SOL', network: 'devnet' });
    console.log(`Starting SOL monitoring for ${depositAddresses.length} addresses`);
    for (const da of depositAddresses) {
      await monitorSolanaAddress(da.address, da.userId.toString());
    }
    console.log('Solana monitoring service started');
  } catch (err) {
    console.log('Start SOL monitoring error:', err.message);
  }
};

module.exports = { generateSolanaDepositAddress, monitorSolanaAddress, startSolanaMonitoring, withdrawSOL };