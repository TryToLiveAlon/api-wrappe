import { createCanvas, registerFont } from "canvas";
import fs from "fs";
import path from "path";
import FormData from "form-data";
import fetch from "node-fetch";

// Register font
registerFont(path.resolve('./fonts/OpenSans-Regular.ttf'), { family: 'OpenSans' });

export default async function handler(req, res) {
  const characters = "1234567890AZSXDCFVGBLQWERTYUIOPqazwsxedcrfvtgbyhnmlkj";
  const generateCaptcha = (length) => {
    let result = "";
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  const captchaLength = parseInt(req.query.length) || Math.floor(Math.random() * 3) + 5;
  const captcha = req.query.text || generateCaptcha(captchaLength);
  const size = parseInt(req.query.size) || Math.floor(Math.random() * 4) * 16 + 16;

  try {
    const width = 300;
    const height = 100;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // White background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, width, height);

    // Add noise dots
    for (let i = 0; i < 300; i++) {
      ctx.fillStyle = "#888888"; // grey dots
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, 1, 0, Math.PI * 2);
      ctx.fill();
    }

    // Add random lines
    for (let i = 0; i < 8; i++) {
      ctx.strokeStyle = "#CCCCCC"; // light grey lines
      ctx.beginPath();
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.lineTo(Math.random() * width, Math.random() * height);
      ctx.stroke();
    }

    // CAPTCHA text
    ctx.font = `${size}px "OpenSans"`;
    ctx.fillStyle = "#000066"; // Dark blue (target)
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Slight rotation
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate((Math.random() - 0.5) * 0.1);
    ctx.fillText(captcha, 0, 0);
    ctx.restore();

    const buffer = canvas.toBuffer("image/jpeg");
    const tempPath = path.join("/tmp", `${Date.now()}.jpg`);
    fs.writeFileSync(tempPath, buffer);

    // Upload to tmpfiles.org
    const formData = new FormData();
    formData.append("file", fs.createReadStream(tempPath));

    const uploadRes = await fetch("https://tmpfiles.org/api/v1/upload", {
      method: "POST",
      body: formData,
      headers: formData.getHeaders(),
    });

    const uploadData = await uploadRes.json();
    fs.unlinkSync(tempPath);

    if (uploadData?.data?.url) {
      const urlParts = uploadData.data.url.split("/").filter(Boolean);
      const id = urlParts[2];
      const filename = urlParts[3];
      const directLink = `https://tmpfiles.org/dl/${id}/${filename}`;

      return res.status(200).json({
        status: "OK",
        captcha,
        background: "FFFFFF",
        color: "000066",
        size,
        direct_link: directLink,
        developer: "https://t.me/TryToLiveAlone"
      });
    } else {
      return res.status(400).json({
        status: "ERROR",
        message: "Upload failed",
        direct_link: null
      });
    }
  } catch (err) {
    return res.status(500).json({
      status: "ERROR",
      message: "Internal server error",
      error: err.message
    });
  }
                                  }
