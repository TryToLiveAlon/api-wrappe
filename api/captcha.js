export default async function handler(req, res) {
  const apiKey = "61d612b99b919f89ae1f52c58e175c99";

  const backgrounds = ["34D2E8", "F7D600", "14DE32", "B94BA6", "E12727", "98A045"];
  const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const characters = "1234567890AZSXDCFVGBLQWERTYUIOPqazwsxedcrfvtgbyhnmlkj";
  function generateCaptcha(length) {
    let result = "";
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  const captchaLength = parseInt(req.query.length) || Math.floor(Math.random() * 3) + 5;
  const captcha = generateCaptcha(captchaLength);
  const background = `%23${randomItem(backgrounds)}`;
  const size = Math.floor(Math.random() * 7) + 12;

  const apiUrl = `https://api.imgbun.com/jpg?key=${apiKey}&text=${encodeURIComponent(
    captcha
  )}&background=${background}&size=${size}`;

  try {
    const response = await fetch(apiUrl);
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
        message: "imgbun API error: " + data.message,
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
