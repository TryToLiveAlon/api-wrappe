import { createCanvas, registerFont } from "canvas";
import fs from "fs";
import path from "path";
import FormData from "form-data";
import fetch from "node-fetch";

registerFont(path.resolve('./fonts/OpenSans-Regular.ttf'), { family: 'OpenSans' });

export default async function handler(req, res) {
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
  const size = parseInt(req.query.size) || Math.floor(Math.random() * 4) * 16 + 16;
  const color = req.query.color || randomItem(colors);

  const hexRegex = /^[0-9A-Fa-f]{6}$/;
  if (!hexRegex.test(background) || !hexRegex.test(color)) {
    return res.status(400).json({
      status: "ERROR",
      message: "Color and background must be 6-digit hex codes (no #)",
      direct_link: null,
    });
  }

  try {
    const width = 300;
    const height = 100;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = `#${background}`;
    ctx.fillRect(0, 0, width, height);

    ctx.font = `${size}px "OpenSans"`;
    ctx.fillStyle = `#${color}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.shadowBlur = 2;

    ctx.fillText(captcha, width / 2, height / 2);

    const buffer = canvas.toBuffer("image/jpeg");
    const tempPath = path.join("/tmp", `${Date.now()}.jpg`);
    fs.writeFileSync(tempPath, buffer);

    const formData = new FormData();
    formData.append("file", fs.createReadStream(tempPath));

    const uploadRes = await fetch("https://file.io", {
      method: "POST",
      body: formData,
      headers: formData.getHeaders(),
      redirect: "manual" // 🚨 Prevent auto redirect that breaks readable stream
    });

    // If 3xx status, get `location` header manually
    if (uploadRes.status >= 300 && uploadRes.status < 400) {
      const redirectUrl = uploadRes.headers.get("location");
      return res.status(200).json({
        status: "OK",
        captcha,
        background,
        color,
        size,
        direct_link: redirectUrl,
        developer: "https://t.me/TryToLiveAlone"
      });
    }

    const uploadData = await uploadRes.json();
    fs.unlinkSync(tempPath);

    if (!uploadData.success || !uploadData.link) {
      return res.status(400).json({
        status: "ERROR",
        message: "Upload failed",
        direct_link: null
      });
    }

    return res.status(200).json({
      status: "OK",
      captcha,
      background,
      color,
      size,
      direct_link: uploadData.link,
      developer: "https://t.me/TryToLiveAlone"
    });

  } catch (err) {
    return res.status(500).json({
      status: "ERROR",
      message: "Internal server error",
      error: err.message
    });
  }
      }
