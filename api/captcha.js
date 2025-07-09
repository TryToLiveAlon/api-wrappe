export default async function handler(req, res) {
  const apiKey = "61d612b99b919f89ae1f52c58e175c99";

  const backgrounds = ["34D2E8", "F7D600", "14DE32", "B94BA6", "E12727", "98A045"];
  const colors = [
    "734646", "FFFF00", "00FF00", "FF0000", "00FFFF", "0000FF",
    "FF9000", "FF00FF", "6E00FF", "0F7209", "CCFF00",
    "FFD3EF", "FFFFFF", "000000", "482B10"
  ];

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

  const background = randomItem(backgrounds);
  const color = randomItem(colors);
  const size = Math.floor(Math.random() * 7) + 12;

  const url = `https://api.imgbun.com/jpg?key=${apiKey}&text=${encodeURIComponent(
    captcha
  )}&background=%23${background}&color=${color}&size=${size}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    return res.status(200).json({
      status: data.status,
      captcha,
      direct_link: data.direct_link,
      developer: "https://t.me/TryToLiveAlone"
    });
  } catch (err) {
    return res.status(500).json({
      status: "ERROR",
      message: "Could not generate image",
      error: err.message
    });
  }
      }
