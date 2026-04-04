const http = require('http');

const data = JSON.stringify({
  originalResponse: "This is a test response intended to trigger the analysis engine. It should be long enough to pass validation. AI is smart and everything is definitely proven without doubt."
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/analyses',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    console.log('Response Body:', body);
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.write(data);
req.end();
