import fetch from "node-fetch";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import { writeFileSync } from "fs";
import path from "path";
import os from "os";

export default async function handler(req, res) {
  const apiKey = "6bdc3dc178feeed7259ef90fc40b3176"; // your imgbb API key

  const backgrounds = ["34D2E8", "F7D600", "14DE32", "B94BA6", "E12727", "98A045"];
  const characters = "1234567890AZSXDCFVGBLQWERTYUIOPqazwsxedcrfvtgbyhnmlkj";

  const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

  function generateCaptcha(length) {
    let result = "";
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  function getContrastColor(hex) {
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? "000000" : "FFFFFF";
  }

  const captchaLength = parseInt(req.query.length) || Math.floor(Math.random() * 3) + 5;
  const captcha = req.query.text || generateCaptcha(captchaLength);
  const background = req.query.background || randomItem(backgrounds);
  const size = parseInt(req.query.size) || Math.floor(Math.random() * 7) + 28;
  const color = req.query.color || getContrastColor(background);

  const hexRegex = /^[0-9A-Fa-f]{6}$/;
  if (!hexRegex.test(background) || !hexRegex.test(color)) {
    return res.status(400).json({
      status: "ERROR",
      message: "Color and background must be 6-digit hex codes (no #)",
      direct_link: null,
    });
  }

  // Create canvas
  const width = 250;
  const height = 100;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = `#${background}`;
  ctx.fillRect(0, 0, width, height);

  // Text
  ctx.font = `${size}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  ctx.lineWidth = 4;
  ctx.strokeStyle = "#000000"; // black outline
  ctx.strokeText(captcha, width / 2, 20);

  ctx.fillStyle = `#${color}`;
  ctx.fillText(captcha, width / 2, 20);

  // Save image to temp file
  const buffer = canvas.toBuffer("image/jpeg");
  const tempPath = path.join(os.tmpdir(), `captcha_${Date.now()}.jpg`);
  writeFileSync(tempPath, buffer);

  // Upload to imgbb
  const formData = new FormData();
  formData.append("image", buffer.toString("base64"));
  formData.append("expiration", "60"); // auto-delete after 1 min
  formData.append("key", apiKey);

  try {
    const response = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (data.success && data.data && data.data.url) {
      return res.status(200).json({
        status: "OK",
        captcha,
        background,
        color,
        size,
        direct_link: data.data.url,
        delete_url: data.data.delete_url,
        developer: "https://t.me/TryToLiveAlone"
      });
    } else {
      return res.status(400).json({
        status: "ERROR",
        message: data.error?.message || "Upload failed",
        direct_link: null,
      });
    }
  } catch (err) {
    return res.status(500).json({
      status: "ERROR",
      message: "Internal error",
      error: err.message,
    });
  }
}
