require('dotenv').config();
const mongoose = require('mongoose');
const Merchant = require('../src/models/Merchant');

const merchants = [
  { merchantId: 'merchant_eur', businessName: 'Starbucks Dublin', iban: 'IE29AIBK93115212345678', currency: 'EUR', country: 'IE' },
  { merchantId: 'merchant_gbp', businessName: 'Tesco London', iban: 'GB29NWBK60161331926819', currency: 'GBP', country: 'GB' },
  { merchantId: 'merchant_usd', businessName: 'Walmart New York', iban: 'US12345678901234567890', currency: 'USD', country: 'US' },
  { merchantId: 'merchant_inr', businessName: 'Reliance Mumbai', iban: 'IN30234918042108', currency: 'INR', country: 'IN' },
  { merchantId: 'merchant_aed', businessName: 'Mall of Emirates Dubai', iban: 'AE070331234567890123456', currency: 'AED', country: 'AE' },
  { merchantId: 'merchant_jpy', businessName: 'Seven Eleven Tokyo', iban: 'JP1234567890123456', currency: 'JPY', country: 'JP' },
  { merchantId: 'merchant_aud', businessName: 'Woolworths Sydney', iban: 'AU123456789012345678', currency: 'AUD', country: 'AU' },
  { merchantId: 'merchant_cad', businessName: 'Tim Hortons Toronto', iban: 'CA123456789012345678', currency: 'CAD', country: 'CA' },
  { merchantId: 'merchant_chf', businessName: 'Migros Zurich', iban: 'CH5604835012345678009', currency: 'CHF', country: 'CH' },
  { merchantId: 'merchant_sgd', businessName: 'FairPrice Singapore', iban: 'SG12345678901234', currency: 'SGD', country: 'SG' },
  { merchantId: 'merchant_myr', businessName: 'Petronas Kuala Lumpur', iban: 'MY12345678901234567890', currency: 'MYR', country: 'MY' },
  { merchantId: 'merchant_brl', businessName: 'Itau Sao Paulo', iban: 'BR1800360305000010009795493P1', currency: 'BRL', country: 'BR' },
  { merchantId: 'merchant_mxn', businessName: 'OXXO Mexico City', iban: 'MX12345678901234567890', currency: 'MXN', country: 'MX' },
  { merchantId: 'merchant_zar', businessName: 'Woolworths Cape Town', iban: 'ZA123456789012345678', currency: 'ZAR', country: 'ZA' },
  { merchantId: 'merchant_nok', businessName: 'Rema 1000 Oslo', iban: 'NO9386011117947', currency: 'NOK', country: 'NO' },
  { merchantId: 'merchant_sek', businessName: 'ICA Stockholm', iban: 'SE3550000000054910000003', currency: 'SEK', country: 'SE' },
  { merchantId: 'merchant_dkk', businessName: 'Netto Copenhagen', iban: 'DK5000400440116243', currency: 'DKK', country: 'DK' },
  { merchantId: 'merchant_pln', businessName: 'Biedronka Warsaw', iban: 'PL61109010140000071219812874', currency: 'PLN', country: 'PL' },
  { merchantId: 'merchant_hkd', businessName: 'ParkNShop Hong Kong', iban: 'HK12345678901234567890', currency: 'HKD', country: 'HK' },
  { merchantId: 'merchant_nzd', businessName: 'Countdown Auckland', iban: 'NZ1234567890123456', currency: 'NZD', country: 'NZ' },
];

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('MongoDB connected');
  for (const merchant of merchants) {
    await Merchant.findOneAndUpdate(
      { merchantId: merchant.merchantId },
      merchant,
      { upsert: true, new: true }
    );
    console.log(`✓ Seeded: ${merchant.businessName} (${merchant.currency})`);
  }
  console.log(`\n✅ All ${merchants.length} merchants seeded!`);
  mongoose.disconnect();
}).catch(err => {
  console.log('Error:', err.message);
  process.exit(1);
});
