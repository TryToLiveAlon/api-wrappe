import Jimp from "jimp";
import fs from "fs";
import path from "path";
import FormData from "form-data";
import fetch from "node-fetch";

export default async function handler(req, res) {
  const imgbbApiKey = "6bdc3dc178feeed7259ef90fc40b3176";

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
    // Determine closest supported font size
    const validFontSizes = [8, 16, 32, 64, 128];
    const closestFontSize = validFontSizes.reduce((prev, curr) =>
      Math.abs(curr - size) < Math.abs(prev - size) ? curr : prev
    );

    const font = await Jimp.loadFont(Jimp[`FONT_SANS_${closestFontSize}_BLACK`]);
    const shadowFont = await Jimp.loadFont(Jimp[`FONT_SANS_${closestFontSize}_WHITE`]);

    const width = 300;
    const height = 100;

    const image = new Jimp(width, height, `#${background}`);

    const textWidth = Jimp.measureText(font, captcha);
    const textHeight = Jimp.measureTextHeight(font, captcha, width);

    const x = (width - textWidth) / 2;
    const y = (height - textHeight) / 2;

    // Add shadow behind text for contrast
    image.print(shadowFont, x + 1, y + 1, captcha);
    image.print(font, x, y, captcha);

    const tempPath = path.join("/tmp", `${Date.now()}.jpg`);
    await image.quality(80).writeAsync(tempPath);

    // Upload to ImgBB
    const formData = new FormData();
    formData.append("key", imgbbApiKey);
    formData.append("image", fs.createReadStream(tempPath));

    const uploadRes = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body: formData,
    });

    const uploadData = await uploadRes.json();

    fs.unlinkSync(tempPath); // Clean up temp file

    if (uploadData.success) {
      return res.status(200).json({
        status: "OK",
        captcha,
        background,
        color,
        size: closestFontSize,
        direct_link: uploadData.data.url,
        delete_url: uploadData.data.delete_url,
        developer: "https://t.me/TryToLiveAlone",
      });
    } else {
      return res.status(400).json({
        status: "ERROR",
        message: uploadData.error?.message || "Upload failed",
        direct_link: null,
      });
    }
  } catch (err) {
    return res.status(500).json({
      status: "ERROR",
      message: "Internal server error",
      error: err.message,
    });
  }
      }
