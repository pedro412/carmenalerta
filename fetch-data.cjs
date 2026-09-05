const https = require('https');
const fs = require('fs');

const query = `
  [out:json][timeout:25];
  (
    node["amenity"](18.630,-91.820,18.660,-91.760);
    node["shop"](18.630,-91.820,18.660,-91.760);
  );
  out body;
`;

const req = https.request('https://overpass-api.de/api/interpreter', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
}, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      const filtered = parsed.elements
        .filter(el => el.tags && el.tags.name)
        .map(el => ({
          lat: el.lat,
          lon: el.lon,
          name: el.tags.name,
          type: el.tags.amenity || el.tags.shop
        }));
      fs.writeFileSync('./src/establishments.json', JSON.stringify(filtered, null, 2));
      console.log('Saved ' + filtered.length + ' establishments.');
    } catch(e) {
      console.error(e);
    }
  });
});

req.write(query);
req.end();
