const fs = require('fs');

const coords = {
  "azteca": { lat: 19.3029, lng: -99.1505 },
  "bbva": { lat: 25.6687, lng: -100.2443 },
  "akron": { lat: 20.6817, lng: -103.4627 },
  "metlife": { lat: 40.8136, lng: -74.0745 },
  "att": { lat: 32.7473, lng: -97.0945 },
  "arrowhead": { lat: 39.0489, lng: -94.4839 },
  "nrg": { lat: 29.6847, lng: -95.4107 },
  "mercedes": { lat: 33.7554, lng: -84.4008 },
  "sofi": { lat: 33.9534, lng: -118.3387 },
  "lincoln": { lat: 39.9008, lng: -75.1675 },
  "lumen": { lat: 47.5952, lng: -122.3316 },
  "levis": { lat: 37.4032, lng: -121.9698 },
  "gillette": { lat: 42.0909, lng: -71.2643 },
  "hardrock": { lat: 25.9580, lng: -80.2389 },
  "bmo": { lat: 43.6332, lng: -79.4186 },
  "bcplace": { lat: 49.2767, lng: -123.1120 }
};

function updateStadiums() {
  const filePath = 'C:\\Users\\Tahsin\\Downloads\\world-cup-2026-companion\\world-cup-2026-companion\\data\\fallback\\stadiums.json';
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  for (const stadium of data) {
    if (coords[stadium.id]) {
      stadium.latitude = coords[stadium.id].lat;
      stadium.longitude = coords[stadium.id].lng;
    }

    const encName = encodeURIComponent(stadium.name);

    stadium.mapUrl = `https://www.google.com/maps/search/?api=1&query=${encName}`;
    stadium.localInfo.parking = `https://www.openstreetmap.org/search?query=parking+near+${encName}`;
    stadium.localInfo.food = `https://www.tripadvisor.com/Search?q=Restaurants+near+${encName}`;
    stadium.localInfo.hotels = `https://www.booking.com/searchresults.html?ss=${encName}`;
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log("Updated stadiums.json successfully!");
}

updateStadiums();
