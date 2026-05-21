require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;
const STEAM_KEY = process.env.STEAM_API_KEY;
const STEAM_BASE = 'https://api.steampowered.com';

app.use(cors({ origin: 'http://localhost:4200' }));
app.use(express.json());

// Resolve a Steam vanity URL (username) to a 64-bit Steam ID
app.get('/api/steam/resolve/:vanityUrl', async (req, res) => {
  try {
    const { data } = await axios.get(`${STEAM_BASE}/ISteamUser/ResolveVanityURL/v1/`, {
      params: { key: STEAM_KEY, vanityurl: req.params.vanityUrl },
    });
    res.json(data.response);
  } catch (e) {
    res.status(500).json({ error: 'Failed to resolve vanity URL' });
  }
});

// Get player summary (avatar, name, status)
app.get('/api/steam/player/:steamId', async (req, res) => {
  try {
    const { data } = await axios.get(`${STEAM_BASE}/ISteamUser/GetPlayerSummaries/v2/`, {
      params: { key: STEAM_KEY, steamids: req.params.steamId },
    });
    res.json(data.response.players[0] || null);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch player' });
  }
});

// Get owned games with playtime
app.get('/api/steam/games/:steamId', async (req, res) => {
  try {
    const { data } = await axios.get(`${STEAM_BASE}/IPlayerService/GetOwnedGames/v1/`, {
      params: {
        key: STEAM_KEY,
        steamid: req.params.steamId,
        include_appinfo: true,
        include_played_free_games: true,
      },
    });
    res.json(data.response);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch games' });
  }
});

// Get recently played games (last 2 weeks)
app.get('/api/steam/recent/:steamId', async (req, res) => {
  try {
    const { data } = await axios.get(`${STEAM_BASE}/IPlayerService/GetRecentlyPlayedGames/v1/`, {
      params: { key: STEAM_KEY, steamid: req.params.steamId, count: 10 },
    });
    res.json(data.response);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch recent games' });
  }
});

app.listen(PORT, () => console.log(`Game Dashboard API running on port ${PORT}`));
