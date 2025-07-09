const express = require('express');
const app = express();
const axios = require('axios');

const IMGBUN_API_KEY = '61d612b99b919f89ae1f52c58e175c99';

app.get('/api/jpg', async (req, res) => {
  const { text, background = '#ffffff', size = 14 } = req.query;

  if (!text) {
    return res.json({
      status: "ERROR",
      message: "Missing required 'text' parameter.",
      direct_link: null
    });
  }

  const url = `https://api.imgbun.com/jpg?key=${IMGBUN_API_KEY}&text=${encodeURIComponent(text)}&background=${encodeURIComponent(background)}&size=${size}`;

  try {
    const response = await axios.get(url);
    const result = response.data;

    if (typeof result === "object" && result.direct_link) {
      return res.json(result);
    }

    const match = result.match(/<img[^>]+src="([^">]+)"/);
    if (!match || !match[1]) {
      return res.json({
        status: "ERROR",
        message: "Could not parse image link.",
        direct_link: null
      });
    }

    return res.json({
      status: "OK",
      message: null,
      direct_link: match[1]
    });

  } catch (err) {
    return res.json({
      status: "ERROR",
      message: "Failed to fetch from imgbun.com",
      direct_link: null
    });
  }
});

module.exports = app;
      
