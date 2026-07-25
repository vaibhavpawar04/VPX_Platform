const { ethers } = require('ethers');
const DepositAddress = require('../models/depositAddress');

const SWAP_ROUTER = '0x101F443B4d1b059569D643917553c771E1b9663E';
const WETH_ADDRESS = '0x980B62Da83eFf3D4576C647993b0c1D7faf17c73';
const USDC_ADDRESS = '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d';
const POOL_FEE = 3000;

const SWAP_ROUTER_ABI = [
  'function exactInputSingle((address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96) params) external payable returns (uint256 amountOut)',
];

const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
];

const generateArbitrumDepositAddress = async (userId) => {
  try {
    let depositAddr = await DepositAddress.findOne({ userId, coin: 'ARB', network: 'arbitrum-sepolia' });
    if (depositAddr) return depositAddr.address;

    const wallet = ethers.Wallet.createRandom();
    await DepositAddress.create({
      userId,
      coin: 'ARB',
      address: wallet.address.toLowerCase(),
      privateKey: wallet.privateKey,
      network: 'arbitrum-sepolia',
    });

    console.log(`Generated ARB deposit address for user ${userId}: ${wallet.address}`);
    return wallet.address;
  } catch (err) {
    console.log('Generate ARB deposit address error:', err.message);
    throw err;
  }
};

const swapArbitrumETHToUSDC = async (userId, ethAmount) => {
  try {
    console.log(`Starting Arbitrum swap: ${ethAmount} ETH → USDC for user ${userId}`);

    const treasuryAddress = process.env.VPX_ETH_TREASURY_ADDRESS;
    if (!treasuryAddress) throw new Error('VPX ETH treasury address not configured');
    console.log(`USDC will be sent to VPX Treasury: ${treasuryAddress}`);

    const depositAddr = await DepositAddress.findOne({ userId, coin: 'ARB', network: 'arbitrum-sepolia' });
    if (!depositAddr) throw new Error('No ARB deposit address found');

    const provider = new ethers.JsonRpcProvider(
      process.env.ARBITRUM_SEPOLIA_RPC || 'https://sepolia-rollup.arbitrum.io/rpc'
    );

    const wallet = new ethers.Wallet(depositAddr.privateKey, provider);
    console.log(`Using ARB wallet: ${wallet.address}`);

    const amountInWei = ethers.parseEther(ethAmount.toString());
    const swapRouter = new ethers.Contract(SWAP_ROUTER, SWAP_ROUTER_ABI, wallet);

    const params = {
      tokenIn: WETH_ADDRESS,
      tokenOut: USDC_ADDRESS,
      fee: POOL_FEE,
      recipient: treasuryAddress,
      amountIn: amountInWei,
      amountOutMinimum: 0,
      sqrtPriceLimitX96: 0,
    };

    console.log('Sending swap to Uniswap V3 on Arbitrum Sepolia...');
    const tx = await swapRouter.exactInputSingle(params, {
      value: amountInWei,
      gasLimit: 300000,
    });

    console.log(`Transaction sent: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`✓ Arbitrum swap confirmed: ${receipt.hash}`);

    const usdcContract = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, provider);
    const usdcBalance = await usdcContract.balanceOf(treasuryAddress);
    const usdcDecimals = await usdcContract.decimals();
    const usdcAmount = Number(usdcBalance) / Math.pow(10, Number(usdcDecimals));
    console.log(`VPX Treasury USDC balance on Arbitrum: ${usdcAmount}`);

    return {
      txHash: receipt.hash,
      ethAmount,
      usdcAmount,
      treasuryAddress,
      network: 'arbitrum-sepolia',
    };
  } catch (err) {
    console.log('Arbitrum swap error:', err.message);
    throw err;
  }
};

const monitorArbitrumAddress = async (address, userId) => {
  console.log(`Monitoring ARB address: ${address} for user: ${userId}`);
};

const startArbitrumMonitoring = async () => {
  try {
    const depositAddresses = await DepositAddress.find({ coin: 'ARB', network: 'arbitrum-sepolia' });
    console.log(`Starting ARB monitoring for ${depositAddresses.length} deposit addresses`);
    for (const da of depositAddresses) {
      await monitorArbitrumAddress(da.address, da.userId.toString());
    }
    console.log('Arbitrum monitoring service started');
  } catch (err) {
    console.log('Start ARB monitoring error:', err.message);
  }
};

module.exports = { generateArbitrumDepositAddress, swapArbitrumETHToUSDC, monitorArbitrumAddress, startArbitrumMonitoring };
