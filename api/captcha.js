import Jimp from "jimp";
import fetch from "node-fetch";
import FormData from "form-data";

export default async function handler(req, res) {
  const apiKey = "6bdc3dc178feeed7259ef90fc40b3176"; // imgbb key

  // Defaults / fallback values
  const backgrounds = ["34D2E8", "F7D600", "14DE32", "B94BA6", "E12727", "98A045"];
  const colors = ["000000", "FFFFFF", "FF0000", "00FF00", "0000FF"];
  const characters = "1234567890AZSXDCFVGBLQWERTYUIOPqazwsxedcrfvtgbyhnmlkj";

  const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const generateCaptcha = (length = 6) => Array.from({ length }, () => randomItem(characters)).join("");

  // Parse user input or use random values
  const captchaLength = parseInt(req.query.length) || Math.floor(Math.random() * 3) + 5;
  const text = req.query.text || generateCaptcha(captchaLength);
  const background = req.query.background || randomItem(backgrounds);
  const color = req.query.color || randomItem(colors);
  const size = parseInt(req.query.size) || 32;

  const hexRegex = /^[0-9A-Fa-f]{6}$/;
  if (!hexRegex.test(background) || !hexRegex.test(color)) {
    return res.status(400).json({
      status: "ERROR",
      message: "Color and background must be valid 6-digit hex codes (no #)",
      direct_link: null,
    });
  }

  try {
    // Create image
    const width = text.length * (size + 5);
    const height = size * 2;
    const bgColor = Jimp.cssColorToHex(`#${background}`);
    const textColor = Jimp.cssColorToHex(`#${color}`);

    const image = new Jimp(width, height, bgColor);
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);

    // Apply shadow for contrast if background is too light/dark
    const shadowX = 3, shadowY = 3;
    const textX = 10, textY = (height - size) / 2;

    const shadowColor = color === "000000" ? "FFFFFF" : "000000";
    const shadowFont = await Jimp.loadFont(
      shadowColor === "000000" ? Jimp.FONT_SANS_32_BLACK : Jimp.FONT_SANS_32_WHITE
    );

    image.print(shadowFont, textX + shadowX, textY + shadowY, text);
    image.print(font, textX, textY, text);

    const buffer = await image.getBufferAsync(Jimp.MIME_JPEG);

    // Upload to imgbb
    const form = new FormData();
    form.append("image", `data:image/jpeg;base64,${buffer.toString("base64")}`);
    form.append("key", apiKey);
    form.append("expiration", "60");

    const upload = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body: form,
    });

    const data = await upload.json();

    if (data && data.success && data.data && data.data.url) {
      return res.status(200).json({
        status: "OK",
        captcha: text,
        background,
        color,
        size,
        direct_link: data.data.url,
        delete_url: data.data.delete_url,
        developer: "https://t.me/TryToLiveAlone",
      });
    } else {
      return res.status(500).json({
        status: "ERROR",
        message: "Failed to upload image",
        error: data,
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
