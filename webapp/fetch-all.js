import fs from 'fs';

// Bounding box for the main populated area of Isla del Carmen
const query = `
[out:json][timeout:60];
(
  node["amenity"](18.61,-91.85,18.70,-91.70);
  node["shop"](18.61,-91.85,18.70,-91.70);
  node["tourism"](18.61,-91.85,18.70,-91.70);
  node["leisure"](18.61,-91.85,18.70,-91.70);
);
out body;
`;

async function fetchAll() {
  console.log("Fetching data from OpenStreetMap (Overpass) using bounding box...");
  try {
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'CarmenAlertaApp/1.0 (local-dev)'
      },
      body: 'data=' + encodeURIComponent(query)
    });
    
    if (!res.ok) {
      console.error("HTTP Error:", res.status, res.statusText);
      return;
    }
    
    const data = await res.json();
    console.log(`Received ${data.elements.length} elements.`);
    
    const filtered = data.elements
      .filter(el => el.tags && el.tags.name)
      .map(el => ({
        lat: el.lat,
        lon: el.lon,
        name: el.tags.name,
        type: el.tags.amenity || el.tags.shop || el.tags.tourism || el.tags.leisure || 'lugar'
      }));
      
    fs.writeFileSync('./src/establishments.json', JSON.stringify(filtered, null, 2));
    console.log(`Saved ${filtered.length} named establishments to src/establishments.json`);
  } catch (error) {
    console.error("Fetch failed:", error);
  }
}

fetchAll();
