const BASE_URL = 'http://localhost:8000/api';

const getToken = () => localStorage.getItem('token');

const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`,
});

const handleResponse = async (res) => {
  const data = await res.json();
  if (res.status === 401) {
    // Token expired — clear storage and redirect to login
    localStorage.clear();
    window.location.href = '/';
  }
  return data;
};

export const connectWalletAPI = async (address, walletName, walletType) => {
  const res = await fetch(`${BASE_URL}/wallet/connect`, {
    method:  'POST',
    headers: authHeaders(),
    body:    JSON.stringify({ address, walletName, walletType }),
  });
  return handleResponse(res);
};

export const getBalancesAPI = async () => {
  const res = await fetch(`${BASE_URL}/wallet/balances`, {
    method:  'GET',
    headers: authHeaders(),
  });
  return handleResponse(res);
};

export const getTransactionsAPI = async () => {
  const res = await fetch(`${BASE_URL}/wallet/transactions`, {
    method:  'GET',
    headers: authHeaders(),
  });
  return handleResponse(res);
};

export const depositAPI = async (coin, amount) => {
  const res = await fetch(`${BASE_URL}/wallet/deposit`, {
    method:  'POST',
    headers: authHeaders(),
    body:    JSON.stringify({ coin, amount }),
  });
  return handleResponse(res);
};

export const withdrawAPI = async (coin, amount, toAddress) => {
  const res = await fetch(`${BASE_URL}/wallet/withdraw`, {
    method:  'POST',
    headers: authHeaders(),
    body:    JSON.stringify({ coin, amount, toAddress }),
  });
  return handleResponse(res);
};

export const swapAPI = async (fromCoin, toCoin, fromAmount) => {
  const res = await fetch(`${BASE_URL}/wallet/swap`, {
    method:  'POST',
    headers: authHeaders(),
    body:    JSON.stringify({ fromCoin, toCoin, fromAmount }),
  });
  return handleResponse(res);
};

export const getDepositAddressAPI = async (coin) => {
  const res = await fetch(`${BASE_URL}/wallet/deposit-address/${coin}`, {
    method:  'GET',
    headers: authHeaders(),
  });
  return handleResponse(res);
};