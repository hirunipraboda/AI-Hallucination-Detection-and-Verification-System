const http = require('http');

const postRequest = (path, data, token = null) => {
  return new Promise((resolve, reject) => {
    const stringData = JSON.stringify(data);
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(stringData),
      }
    };
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, body: JSON.parse(body) }));
    });
    req.on('error', reject);
    req.write(stringData);
    req.end();
  });
};

const runTest = async () => {
  try {
    console.log('Logging in as admin...');
    const loginRes = await postRequest('/api/auth/login', {
      email: 'admin@truthlens.com',
      password: 'admin@123'
    });

    if (loginRes.statusCode !== 200) {
      console.error('Login failed:', loginRes.body);
      return;
    }

    const token = loginRes.body.token;
    console.log('Got token. Attempting to create source...');

    const sourceData = {
      sourceName: 'API Integration Test ' + new Date().toISOString(),
      sourceURL: 'https://test-api-' + Date.now() + '.com',
      sourceCategory: 'Other',
      authorityScore: 75,
      accuracyScore: 75,
      recencyScore: 75
    };

    const createRes = await postRequest('/api/sources', sourceData, token);
    console.log('Create Status:', createRes.statusCode);
    console.log('Create Response:', createRes.body);

    if (createRes.statusCode === 201) {
      console.log('✅ Source created successfully via API!');
    } else {
      console.log('❌ Failed to create source via API.');
    }
  } catch (err) {
    console.error('Test error:', err);
  }
};

runTest();
