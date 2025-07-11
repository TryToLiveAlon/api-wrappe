import { createCanvas } from "@napi-rs/canvas";
import fetch from "node-fetch";

export default async function handler(req, res) {
  const apiKey = "6bdc3dc178feeed7259ef90fc40b3176";

  const backgrounds = ["34D2E8", "F7D600", "14DE32", "B94BA6", "E12727", "98A045"];
  const colors = ["734646", "FFFF00", "00FF00", "FF0000", "00FFFF", "0000FF", "FF9000", "FF00FF", "6E00FF", "0F7209", "CCFF00", "FFD3EF", "FFFFFF", "000000", "482B10"];
  const characters = "1234567890AZSXDCFVGBLQWERTYUIOPqazwsxedcrfvtgbyhnmlkj";

  const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const generateCaptcha = (length) => {
    let result = "";
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  const captchaLength = parseInt(req.query.length) || Math.floor(Math.random() * 3) + 5;
  const captcha = req.query.text || generateCaptcha(captchaLength);
  const background = req.query.background || randomItem(backgrounds);
  const size = parseInt(req.query.size) || Math.floor(Math.random() * 7) + 24;
  const color = req.query.color || randomItem(colors);

  const hexRegex = /^[0-9A-Fa-f]{6}$/;
  if (!hexRegex.test(background) || !hexRegex.test(color)) {
    return res.status(400).json({
      status: "ERROR",
      message: "Color and background must be 6-digit hex codes (no #)",
      direct_link: null
    });
  }

  try {
    // Create image
    const canvas = createCanvas(400, 150);
    const ctx = canvas.getContext("2d");

    // Draw background
    ctx.fillStyle = `#${background}`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw text
    ctx.fillStyle = `#${color}`;
    ctx.font = `${size}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(captcha, canvas.width / 2, canvas.height / 2);

    // Convert to base64
    const buffer = canvas.toBuffer("image/png");
    const base64Image = buffer.toString("base64");

    // Upload to ImgBB
    const params = new URLSearchParams();
    params.append("key", apiKey);
    params.append("image", base64Image);
    params.append("expiration", "60");

    const upload = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body: params
    });

    const uploadResult = await upload.json();

    if (uploadResult.success) {
      return res.status(200).json({
        status: "OK",
        captcha,
        background,
        color,
        size,
        direct_link: uploadResult.data.url,
        developer: "https://t.me/TryToLiveAlone"
      });
    } else {
      return res.status(500).json({
        status: "ERROR",
        message: uploadResult.error?.message || "Upload failed",
        direct_link: null
      });
    }
  } catch (err) {
    return res.status(500).json({
      status: "ERROR",
      message: "Internal error",
      error: err.message
    });
  }
}
