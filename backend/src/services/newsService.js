const https = require('https');

const NEWS_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

let latestNews = [];

const fetchNews = () => {
  const token = process.env.CRYPTOPANIC_TOKEN;
  const options = {
    hostname: 'cryptopanic.com',
    path: `/api/developer/v2/posts/?auth_token=${token}&public=true&kind=news`,
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'Accept': 'application/json',
    }
  };

  const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        if (parsed.results && parsed.results.length > 0) {
          latestNews = parsed.results.slice(0, 6).map(item => ({
            title:  item.title,
            source: 'CryptoPanic',
            url:    item.url || '#',
            time:   getTimeAgo(new Date(item.published_at)),
          }));
          console.log(`News updated: ${latestNews.length} articles fetched`);
        } else {
          console.log('No results in response:', JSON.stringify(parsed));
        }
      } catch (err) {
        console.log('Error parsing news:', err.message);
        console.log('Raw data:', data.substring(0, 200));
      }
    });
  });

  req.on('error', (err) => {
    console.log('Error fetching news:', err.message);
  });

  req.end();
};

const getTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60)    return `${seconds}s ago`;
  if (seconds < 3600)  return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

const startNewsService = () => {
  fetchNews();
  setInterval(fetchNews, NEWS_REFRESH_INTERVAL);
  console.log('News service started - refreshing every 5 minutes');
};

const getLatestNews = () => latestNews;

module.exports = { startNewsService, getLatestNews };