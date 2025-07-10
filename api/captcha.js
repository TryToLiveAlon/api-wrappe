export default async function handler(req, res) {
  const apiKeys = [
    "61d612b99b919f89ae1f52c58e175c99",
    "a29209cd06a0afbf33a380720adf9fee",
    "2eeec5fc1b70413fe456b12c6dd669da",
    "afff7e94ecd29efccd2fc398c6143640",
    "524a748fa942274408db796e17d98b33",
    "31e9a6487553ef5067b86f5dabf50edd",
    "b1b9d45d8398bdc7d3ff04848b81c9b5",
    "0ee8385036acafa72b4625894648a026",
    "2f7e2092c311e79370ec9b02d13df62a",
    "3f9daef4e4a1c73d3aab3db0cf68ea82",
    "eb645ff0acb6bc936a82df936171f704"
  ];

  const backgrounds = ["34D2E8", "F7D600", "14DE32", "B94BA6", "E12727", "98A045"];
  const colors = ["734646", "FFFF00", "00FF00", "FF0000", "00FFFF", "0000FF", "FF9000", "FF00FF", "6E00FF", "0F7209", "CCFF00", "FFD3EF", "FFFFFF", "000000", "482B10"];
  const characters = "1234567890AZSXDCFVGBLQWERTYUIOPqazwsxedcrfvtgbyhnmlkj";

  const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const apiKey = randomItem(apiKeys);

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
  const size = req.query.size || Math.floor(Math.random() * 7) + 12;
  const color = req.query.color || randomItem(colors);

  const hexRegex = /^[0-9A-Fa-f]{6}$/;
  if (!hexRegex.test(background) || !hexRegex.test(color)) {
    return res.status(400).json({
      status: "ERROR",
      message: "Color and background must be 6-digit hex codes (no #)",
      direct_link: null
    });
  }

  const url = `https://api.imgbun.com/jpg?key=${apiKey}&text=${encodeURIComponent(
    captcha
  )}&background=${background}&color=${color}&size=${size}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK" && data.direct_link) {
      return res.status(200).json({
        status: "OK",
        captcha,
        background,
        color,
        size,
        direct_link: data.direct_link,
        developer: "https://t.me/TryToLiveAlone"
      });
    } else {
      return res.status(400).json({
        status: "ERROR",
        message: data.message || "Unknown error from imgbun",
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
