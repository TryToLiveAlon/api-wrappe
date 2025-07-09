import express from "express";
import axios from "axios";

const app = express();

const IMGBUN_API_KEY = "61d612b99b919f89ae1f52c58e175c99";

app.get("/api/jpg", async (req, res) => {
  const { text, background = "#ffffff", size = 14 } = req.query;

  if (!text) {
    return res.json({
      status: "ERROR",
      message: "Missing required 'text' parameter.",
      direct_link: null,
    });
  }

  const apiUrl = `https://api.imgbun.com/jpg?key=${IMGBUN_API_KEY}&text=${encodeURIComponent(
    text
  )}&background=${encodeURIComponent(background)}&size=${size}`;

  try {
    const response = await axios.get(apiUrl);
    const result = response.data;

    const match = typeof result === "string" ? result.match(/<img[^>]+src="([^">]+)"/) : null;

    return res.json({
      status: "OK",
      message: null,
      direct_link: match?.[1] || result.direct_link || null,
    });
  } catch (err) {
    return res.json({
      status: "ERROR",
      message: "Failed to fetch from Imgbun API",
      direct_link: null,
    });
  }
});

export default app;
