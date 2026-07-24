const https = require('https');
const Merchant = require('../models/Merchant');

// Get live USDC to fiat rate using ExchangeRate API
const getLiveRate = (currency) => {
  return new Promise((resolve, reject) => {
    https.get('https://api.exchangerate-api.com/v4/latest/USD', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const rate = parsed.rates[currency.toUpperCase()];
          if (!rate) return reject(new Error(`Currency ${currency} not supported`));
          console.log(`Live rate: 1 USDC = ${rate} ${currency}`);
          resolve(rate);
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', reject);
  });
};

const processMerchantPayout = async (merchantId, usdcAmount, txHash) => {
  try {
    const merchant = await Merchant.findOne({ merchantId });
    if (!merchant) {
      console.log(`Merchant ${merchantId} not found — skipping payout`);
      return null;
    }

    const rate = await getLiveRate(merchant.currency);
    const fiatAmount = (usdcAmount * rate).toFixed(2);

    const processingMs = Math.floor(Math.random() * 500) + 200;
    await new Promise(resolve => setTimeout(resolve, processingMs));

    await Merchant.updateOne(
      { merchantId },
      { $inc: { totalReceived: parseFloat(fiatAmount) } }
    );

    const payout = {
      merchantId,
      businessName: merchant.businessName,
      iban: merchant.iban,
      usdcAmount,
      fiatAmount: parseFloat(fiatAmount),
      currency: merchant.currency,
      country: merchant.country,
      exchangeRate: rate,
      payoutMethod: getPayoutMethod(merchant.country),
      status: 'completed',
      processingMs,
      txHash,
      simulatedAt: new Date().toISOString(),
    };

    console.log(`✓ Merchant payout simulated:`);
    console.log(`  Business: ${merchant.businessName}`);
    console.log(`  IBAN: ${merchant.iban}`);
    console.log(`  USDC: ${usdcAmount}`);
    console.log(`  Live Rate: 1 USDC = ${rate} ${merchant.currency}`);
    console.log(`  Amount: ${fiatAmount} ${merchant.currency}`);
    console.log(`  Method: ${payout.payoutMethod}`);
    console.log(`  Processing: ${processingMs}ms`);

    return payout;

  } catch (err) {
    console.log('Payout service error:', err.message);
    throw err;
  }
};

const getPayoutMethod = (country) => {
  const methods = {
    IE: 'SEPA Instant',
    GB: 'Faster Payments',
    US: 'ACH Transfer',
    IN: 'IMPS',
    AE: 'UAEFTS',
    JP: 'Zengin',
    AU: 'NPP PayID',
    CA: 'Interac e-Transfer',
    CH: 'SIC',
    SG: 'FAST',
    MY: 'DuitNow',
    BR: 'PIX',
    MX: 'SPEI',
    ZA: 'RTC',
    NO: 'Straks',
    SE: 'Swish',
    DK: 'MobilePay',
    PL: 'BLIK',
    HK: 'FPS',
    NZ: 'NPP',
  };
  return methods[country] || 'SWIFT Wire';
};

module.exports = { processMerchantPayout };
