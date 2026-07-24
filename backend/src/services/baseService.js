const { ethers } = require('ethers');
const DepositAddress = require('../models/depositAddress');

const SWAP_ROUTER = '0x2626664c2603336E57B271c5C0b26F421741e481';
const WETH_ADDRESS = '0x4200000000000000000000000000000000000006';
const USDC_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';
const POOL_FEE = 3000;

const SWAP_ROUTER_ABI = [
  'function exactInputSingle((address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96) params) external payable returns (uint256 amountOut)',
];

const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
];

const generateBaseDepositAddress = async (userId) => {
  try {
    let depositAddr = await DepositAddress.findOne({ userId, coin: 'BASE', network: 'base-sepolia' });
    if (depositAddr) return depositAddr.address;

    const wallet = ethers.Wallet.createRandom();
    await DepositAddress.create({
      userId,
      coin: 'BASE',
      address: wallet.address.toLowerCase(),
      privateKey: wallet.privateKey,
      network: 'base-sepolia',
    });

    console.log(`Generated BASE deposit address for user ${userId}: ${wallet.address}`);
    return wallet.address;
  } catch (err) {
    console.log('Generate BASE deposit address error:', err.message);
    throw err;
  }
};

const swapBaseETHToUSDC = async (userId, ethAmount) => {
  try {
    console.log(`Starting Base swap: ${ethAmount} ETH → USDC for user ${userId}`);

    const treasuryAddress = process.env.VPX_ETH_TREASURY_ADDRESS;
    if (!treasuryAddress) throw new Error('VPX ETH treasury address not configured');
    console.log(`USDC will be sent to VPX Treasury: ${treasuryAddress}`);

    const depositAddr = await DepositAddress.findOne({ userId, coin: 'BASE', network: 'base-sepolia' });
    if (!depositAddr) throw new Error('No BASE deposit address found');

    const provider = new ethers.JsonRpcProvider(
      process.env.BASE_SEPOLIA_RPC || 'https://sepolia.base.org'
    );

    const wallet = new ethers.Wallet(depositAddr.privateKey, provider);
    console.log(`Using BASE wallet: ${wallet.address}`);

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

    console.log('Sending swap to Uniswap V3 on Base Sepolia...');
    const tx = await swapRouter.exactInputSingle(params, {
      value: amountInWei,
      gasLimit: 300000,
    });

    console.log(`Transaction sent: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`✓ Base swap confirmed: ${receipt.hash}`);

    const usdcContract = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, provider);
    const usdcBalance = await usdcContract.balanceOf(treasuryAddress);
    const usdcDecimals = await usdcContract.decimals();
    const usdcAmount = Number(usdcBalance) / Math.pow(10, Number(usdcDecimals));
    console.log(`VPX Treasury USDC balance on Base: ${usdcAmount}`);

    return {
      txHash: receipt.hash,
      ethAmount,
      usdcAmount,
      treasuryAddress,
      network: 'base-sepolia',
    };
  } catch (err) {
    console.log('Base swap error:', err.message);
    throw err;
  }
};

const monitorBaseAddress = async (address, userId) => {
  console.log(`Monitoring BASE address: ${address} for user: ${userId}`);
};

const startBaseMonitoring = async () => {
  try {
    const depositAddresses = await DepositAddress.find({ coin: 'BASE', network: 'base-sepolia' });
    console.log(`Starting BASE monitoring for ${depositAddresses.length} deposit addresses`);
    for (const da of depositAddresses) {
      await monitorBaseAddress(da.address, da.userId.toString());
    }
    console.log('Base monitoring service started');
  } catch (err) {
    console.log('Start BASE monitoring error:', err.message);
  }
};

module.exports = { generateBaseDepositAddress, swapBaseETHToUSDC, monitorBaseAddress, startBaseMonitoring };
