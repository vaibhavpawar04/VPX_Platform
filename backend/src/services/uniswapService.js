const { ethers } = require('ethers');
const DepositAddress = require('../models/depositAddress');

// Correct Sepolia SwapRouter02 address
const SWAP_ROUTER = '0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E';
const WETH_ADDRESS = '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14';
const USDC_ADDRESS = '0x94a9d9ac8a22534e3faca9f4e7f2e2cf85d5e4c8';
const POOL_FEE = 3000; // 0.3%

// SwapRouter02 ABI — NO deadline field
const SWAP_ROUTER_ABI = [
  'function exactInputSingle((address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96) params) external payable returns (uint256 amountOut)',
];

const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
];

const swapETHToUSDC = async (userId, ethAmount) => {
  try {
    console.log(`Starting Uniswap swap: ${ethAmount} ETH → USDC for user ${userId}`);

    const depositAddr = await DepositAddress.findOne({ userId, coin: 'ETH', network: 'sepolia' });
    if (!depositAddr) throw new Error('No ETH deposit address found');

    const provider = new ethers.JsonRpcProvider(
      `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
    );
    const wallet = new ethers.Wallet(depositAddr.privateKey, provider);
    console.log(`Using wallet: ${wallet.address}`);

    const amountInWei = ethers.parseEther(ethAmount.toString());
    console.log(`Swapping ${ethAmount} ETH (${amountInWei} wei)`);

    const swapRouter = new ethers.Contract(SWAP_ROUTER, SWAP_ROUTER_ABI, wallet);

    // SwapRouter02 params — NO deadline
    const params = {
      tokenIn: WETH_ADDRESS,
      tokenOut: USDC_ADDRESS,
      fee: POOL_FEE,
      recipient: wallet.address,
      amountIn: amountInWei,
      amountOutMinimum: 0,
      sqrtPriceLimitX96: 0,
    };

    console.log('Sending swap transaction to Uniswap V3 SwapRouter02...');
    const tx = await swapRouter.exactInputSingle(params, {
      value: amountInWei,
      gasLimit: 300000,
    });

    console.log(`Transaction sent: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`✓ Uniswap swap confirmed: ${receipt.hash}`);

    // Check USDC received
    const usdcContract = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, provider);
    const usdcBalance = await usdcContract.balanceOf(wallet.address);
    const usdcDecimals = await usdcContract.decimals();
    const usdcAmount = Number(usdcBalance) / Math.pow(10, Number(usdcDecimals));
    console.log(`USDC balance after swap: ${usdcAmount}`);

    return {
      txHash: receipt.hash,
      ethAmount,
      usdcAmount,
    };

  } catch (err) {
    console.log('Uniswap swap error:', err.message);
    throw err;
  }
};

module.exports = { swapETHToUSDC };