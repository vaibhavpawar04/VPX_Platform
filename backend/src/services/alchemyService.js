const { Alchemy, Network, AlchemySubscription } = require('alchemy-sdk');
const { ethers } = require('ethers');
const Balance        = require('../models/Balance');
const Transaction    = require('../models/Transaction');
const DepositAddress = require('../models/depositAddress');

let alchemy = null;

const getAlchemy = () => {
  if (!alchemy) {
    alchemy = new Alchemy({
      apiKey:  process.env.ALCHEMY_API_KEY,
      network: Network.ETH_SEPOLIA,
    });
  }
  return alchemy;
};

// Generate a unique deposit address for a user
const generateDepositAddress = async (userId) => {
  try {
    let depositAddr = await DepositAddress.findOne({ userId, coin: 'ETH' });
    if (depositAddr) return depositAddr.address;

    const wallet  = ethers.Wallet.createRandom();
    const address = wallet.address;

    await DepositAddress.create({
      userId,
      coin:       'ETH',
      address:    address.toLowerCase(),
      privateKey: wallet.privateKey,
      network:    'sepolia',
    });

    console.log(`Generated deposit address for user ${userId}: ${address}`);
    return address;

  } catch (err) {
    console.log('Generate deposit address error:', err.message);
    throw err;
  }
};

// Process a single transaction
const processTransaction = async (tx, userId) => {
  try {
    const valueInEth = parseFloat(ethers.formatEther(tx.value));
    if (valueInEth <= 0) return;

    // Check if already processed
    const existing = await Transaction.findOne({ txHash: tx.hash });
    if (existing) {
      console.log('Transaction already processed:', tx.hash);
      return;
    }

    // Credit user balance
    await Balance.updateOne(
      { userId, coin: 'ETH' },
      { $inc: { amount: valueInEth }, $set: { updatedAt: new Date() } },
      { upsert: true }
    );

    // Record transaction
    await Transaction.create({
      userId,
      type:    'deposit',
      coin:    'ETH',
      amount:  valueInEth,
      txHash:  tx.hash,
      status:  'confirmed',
      note:    'Sepolia testnet deposit',
    });

    console.log(`✓ Credited ${valueInEth} ETH to user ${userId} - TxHash: ${tx.hash}`);

  } catch (err) {
    console.log('Transaction processing error:', err.message);
  }
};

// Check past transactions for an address
const checkPastTransactions = async (address, userId) => {
  try {
    console.log(`Checking past transactions for ${address}`);

    const transfers = await getAlchemy().core.getAssetTransfers({
      toAddress:  address,
      category:   ['external'],
      withMetadata: true,
    });

    console.log(`Found ${transfers.transfers.length} past transactions`);

    for (const transfer of transfers.transfers) {
      const tx = {
        hash:  transfer.uniqueId.split(':')[0],
        value: ethers.parseEther(transfer.value.toString()),
      };
      await processTransaction(tx, userId);
    }

  } catch (err) {
    console.log('Check past transactions error:', err.message);
  }
};

// Monitor incoming transactions to a deposit address
const monitorAddress = async (address, userId) => {
  console.log(`Monitoring address: ${address} for user: ${userId}`);

  // First check past transactions
  await checkPastTransactions(address, userId);

  // Then subscribe to new transactions
  getAlchemy().ws.on(
    {
      method:         AlchemySubscription.MINED_TRANSACTIONS,
      addresses:      [{ to: address }],
      includeRemoved: false,
      hashesOnly:     false,
    },
    async (tx) => {
      console.log(`New transaction detected: ${tx.hash}`);
      await processTransaction(tx, userId);
    }
  );
};

// Start monitoring all existing deposit addresses
const startMonitoring = async () => {
  try {
    const depositAddresses = await DepositAddress.find({ coin: 'ETH', network: 'sepolia' });
    console.log(`Starting monitoring for ${depositAddresses.length} deposit addresses`);
    for (const da of depositAddresses) {
      await monitorAddress(da.address, da.userId.toString());
    }
    console.log('Alchemy monitoring service started');
  } catch (err) {
    console.log('Start monitoring error:', err.message);
  }
};

// Send real ETH withdrawal on Sepolia
const withdrawETH = async (userId, toAddress, amount) => {
  try {
    console.log(`Starting ETH withdrawal: ${amount} ETH to ${toAddress}`);
    
    const depositAddr = await DepositAddress.findOne({ userId, coin: 'ETH', network: 'sepolia' });
    if (!depositAddr) {
      throw new Error('No deposit address found for user');
    }
    console.log(`Using deposit address: ${depositAddr.address}`);

    const provider = new ethers.JsonRpcProvider(
      `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
    );
    const wallet = new ethers.Wallet(depositAddr.privateKey, provider);

    const balance = await provider.getBalance(wallet.address);
    const balanceInEth = parseFloat(ethers.formatEther(balance));
    console.log(`Wallet balance on chain: ${balanceInEth} ETH`);

    if (balanceInEth < amount) {
      throw new Error(`Insufficient blockchain balance. Available: ${balanceInEth} ETH`);
    }

    const gasPrice = await provider.getFeeData();
    const gasLimit = 21000n;
    const gasCost  = gasLimit * gasPrice.gasPrice;
    const gasCostInEth = parseFloat(ethers.formatEther(gasCost));
    console.log(`Gas cost: ${gasCostInEth} ETH`);

    const sendAmount = amount - gasCostInEth;
    if (sendAmount <= 0) {
      throw new Error('Amount too small to cover gas fees');
    }
    console.log(`Sending: ${sendAmount} ETH`);

    const tx = await wallet.sendTransaction({
      to:       toAddress,
      value:    ethers.parseEther(sendAmount.toFixed(8).toString()),
      gasLimit: gasLimit,
    });

    console.log(`Withdrawal transaction sent: ${tx.hash}`);

    const receipt = await tx.wait();
    console.log(`Withdrawal confirmed: ${tx.hash}`);

    return { txHash: tx.hash, amount: sendAmount };

  } catch (err) {
    console.log('Withdraw ETH error:', err.message);
    throw err;
  }
};

module.exports = { generateDepositAddress, monitorAddress, startMonitoring, withdrawETH };