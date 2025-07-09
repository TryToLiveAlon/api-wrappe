export default async function handler(req, res) {
  const apiKey = "61d612b99b919f89ae1f52c58e175c99";

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

  // Use query param or fallback to random/default
  const background = req.query.background || randomItem(backgrounds); // Should be HEX only, no #
  const size = req.query.size || Math.floor(Math.random() * 7) + 12;
  const color = req.query.color || randomItem(colors);

  // Validate color format (must be 6-digit HEX without '#')
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
