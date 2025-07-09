import axios from 'axios';

export default async function handler(req, res) {
  const { text, background = "#ffffff", size = 14 } = req.query;

  if (!text) {
    return res.status(400).json({
      status: "ERROR",
      message: "Missing required 'text' parameter.",
      direct_link: null
    });
  }

  const url = `https://api.imgbun.com/jpg?key=61d612b99b919f89ae1f52c58e175c99&text=${encodeURIComponent(text)}&background=${encodeURIComponent(background)}&size=${size}`;

  try {
    // Directly return the same structure
    res.json({
      status: "OK",
      message: null,
      direct_link: url
    });
  } catch (err) {
    res.json({
      status: "ERROR",
      message: "Failed to create image",
      direct_link: null
    });
  }
}
