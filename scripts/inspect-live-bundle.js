const https = require('https');

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    }).on('error', reject);
  });
}

(async () => {
  const htmlRes = await get('https://main.d1rmonr4dy05xx.amplifyapp.com/');
  console.log('HTML status:', htmlRes.status);
  console.log('HTML head/body snippet:', htmlRes.body.substring(0, 500));
  const match = htmlRes.body.match(/src="(\/assets\/index-[^"]+\.js)"/);
  console.log('JS bundle match:', match ? match[1] : 'NOT FOUND');
  if (match) {
    const jsRes = await get('https://main.d1rmonr4dy05xx.amplifyapp.com' + match[1]);
    console.log('JS status:', jsRes.status, 'Length:', jsRes.body.length);
    const apiMatches = jsRes.body.match(/https:\/\/[^"'`\s]+amazonaws\.com[^\s"'`]*/g);
    console.log('Found AWS API URLs in bundle:', apiMatches);
    const localhostMatches = jsRes.body.match(/http:\/\/localhost:[0-9]+[^\s"'`]*/g);
    console.log('Found localhost URLs in bundle:', localhostMatches);
    
    // Check config object
    const configIndex = jsRes.body.indexOf('API_URL');
    if (configIndex !== -1) {
      console.log('Config snippet:', jsRes.body.substring(configIndex - 50, configIndex + 200));
    }
  }
})();
