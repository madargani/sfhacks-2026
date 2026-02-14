import { Router } from "express";
// don't import .env files as modules — use process.env (or load dotenv at app bootstrap)

const router = Router();

var fetch = require('node-fetch');
var requestOptions = {
  method: 'GET',
};

fetch("https://api.geoapify.com/v1/routing?waypoints=50.96209827745463%2C4.414458883409225%7C50.429137079078345%2C5.00088081232559&mode=drive&apiKey=6cdfd15613de488088490808b8928ebc", requestOptions)
  .then((response: { json: () => any; }) => response.json())
  .then((result: any) => console.log(result))
  .catch((error: any) => console.log('error', error));
  
router.get("/", async (req, res) => {
  try {
    const {
      fromLat, fromLng, toLat, toLng,
      mode = "drive",
    } = req.query as Record<string, string>;

    if (!fromLat || !fromLng || !toLat || !toLng) {
      return res.status(400).json({ error: "Missing fromLat/fromLng/toLat/toLng" });
    }

    const apiKey = process.env.GEOAPIFY_API_KEY; // or env.geoapifyApiKey if you add it
    if (!apiKey) return res.status(500).json({ error: "Missing GEOAPIFY_API_KEY" });

    const waypoints = `${encodeURIComponent(fromLat)},${encodeURIComponent(fromLng)}|${encodeURIComponent(toLat)},${encodeURIComponent(toLng)}`;
    const url =
      `https://api.geoapify.com/v1/routing?` +
      `waypoints=${waypoints}&mode=${encodeURIComponent(mode)}&apiKey=${encodeURIComponent(apiKey)}`;

    const resp = await fetch(url, { method: "GET" });
    const data = await resp.json();

    if (!resp.ok) {
      return res.status(resp.status).json({ error: "Geoapify error", details: data });
    }

    return res.json(data);
  } catch (e: any) {
    return res.status(500).json({ error: e?.message ?? "Unknown error" });
  }
});

export default router;