import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const cache = new Map();

export const getCoordinates = async (villageName) => {
  if (cache.has(villageName)) return cache.get(villageName);

  const { data } = await axios.get("https://us1.locationiq.com/v1/search", {
    params: {
      key: process.env.LOCATIONIQ_API_KEY,
      q: `${villageName}, Punjab, India`,
      format: "json",
      limit: 1
    }
  });

  if (!data || data.length === 0) {
    throw new Error(`Could not find coordinates for: ${villageName}`);
  }

  const coords = {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon) // LocationIQ returns "lon" not "lng"
  };

  cache.set(villageName, coords);
  return coords;
};