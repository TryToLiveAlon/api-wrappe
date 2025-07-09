export default async function handler(req, res) {
  const apiKey = "61d612b99b919f89ae1f52c58e175c99";

  const backgrounds = ["34D2E8", "F7D600", "14DE32", "B94BA6", "E12727", "98A045"];
  const characters = "1234567890AZSXDCFVGBLQWERTYUIOPqazwsxedcrfvtgbyhnmlkj";

  // Generate random item from an array
  const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // Generate random captcha string
  const generateCaptcha = (length) => {
    let result = "";
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  const captchaLength = parseInt(req.query.length) || Math.floor(Math.random() * 3) + 5;
  const captcha = generateCaptcha(captchaLength);
  const background = randomItem(backgrounds);  // No #, just 6-digit hex
  const size = Math.floor(Math.random() * 7) + 12;

  const url = `https://api.imgbun.com/jpg?key=${apiKey}&text=${encodeURIComponent(
    captcha
  )}&background=${background}&size=${size}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK" && data.direct_link) {
      return res.status(200).json({
        status: "OK",
        captcha,
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
