import Jimp from "jimp";
import FormData from "form-data";
import fetch from "node-fetch";

export default async function handler(req, res) {
  const characters = "1234567890AZSXDCFVGBLQWERTYUIOPqazwsxedcrfvtgbyhnmlkj";
  const defaultBackgrounds = ["34D2E8", "F7D600", "14DE32", "B94BA6", "E12727", "98A045"];
  const defaultColors = ["734646", "FFFF00", "00FF00", "FF0000", "00FFFF", "0000FF", "FF9000", "FF00FF", "6E00FF", "0F7209", "CCFF00", "FFD3EF", "FFFFFF", "000000", "482B10"];

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
  const background = req.query.background || randomItem(defaultBackgrounds);
  const size = parseInt(req.query.size) || Math.floor(Math.random() * 7) + 24;
  const color = req.query.color || randomItem(defaultColors);

  const hexRegex = /^[0-9A-Fa-f]{6}$/;
  if (!hexRegex.test(background) || !hexRegex.test(color)) {
    return res.status(400).json({
      status: "ERROR",
      message: "Color and background must be 6-digit hex codes (no #)",
      direct_link: null
    });
  }

  try {
    const image = new Jimp(250, 100, "#" + background);
    const font = await Jimp.loadFont(Jimp[`FONT_SANS_${size}_BLACK`]);

    const textWidth = Jimp.measureText(font, captcha);
    const textHeight = Jimp.measureTextHeight(font, captcha, 250);

    const x = (250 - textWidth) / 2;
    const y = (100 - textHeight) / 2;

    const textImage = new Jimp(textWidth, textHeight, 0x00000000);
    await textImage.print(font, 0, 0, {
      text: captcha,
      alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
      alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
    }, textWidth, textHeight);

    const textHex = Jimp.cssColorToHex("#" + color);
    textImage.scan(0, 0, textImage.bitmap.width, textImage.bitmap.height, function (x, y, idx) {
      if (this.bitmap.data[idx + 3] > 0) {
        this.bitmap.data[idx + 0] = (textHex >> 16) & 0xFF; // R
        this.bitmap.data[idx + 1] = (textHex >> 8) & 0xFF;  // G
        this.bitmap.data[idx + 2] = textHex & 0xFF;         // B
      }
    });

    image.composite(textImage, x, y);
    const buffer = await image.getBufferAsync(Jimp.MIME_JPEG);

    const form = new FormData();
    form.append("image", buffer.toString("base64"));
    form.append("key", "6bdc3dc178feeed7259ef90fc40b3176");
    form.append("expiration", "60");

    const upload = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body: form
    });

    const result = await upload.json();

    if (!result.success) {
      return res.status(500).json({
        status: "ERROR",
        message: "Failed to upload to imgbb",
        details: result
      });
    }

    return res.status(200).json({
      status: "OK",
      captcha,
      background,
      color,
      size,
      direct_link: result.data.url,
      delete_url: result.data.delete_url,
      developer: "https://t.me/TryToLiveAlone"
    });

  } catch (error) {
    return res.status(500).json({
      status: "ERROR",
      message: "Internal server error",
      error: error.message
    });
  }
  }
