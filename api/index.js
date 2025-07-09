export default async function handler(req, res) {
  const { text } = req.query;
  const background = req.query.background || "#000000";
  const size = req.query.size || 40;

  if (!text) {
    return res.status(400).json({
      status: "ERROR",
      message: "Missing 'text' parameter",
      direct_link: null,
    });
  }

  // Validate background color (must be 6-digit hex starting with "#")
  function isValidHexColor(hex) {
    return /^#[0-9A-Fa-f]{6}$/.test(hex);
  }

  if (!isValidHexColor(background)) {
    return res.status(400).json({
      status: "ERROR",
      message: "Background color must be a 6-digit hexadecimal code like #FF0000.",
      direct_link: null,
    });
  }

  const key = "61d612b99b919f89ae1f52c58e175c99";
  const encodedText = encodeURIComponent(text);
  const encodedBg = encodeURIComponent(background);
  const imageUrl = `https://api.imgbun.com/jpg?key=${key}&text=${encodedText}&background=${encodedBg}&size=${size}`;

  return res.status(200).json({
    status: "OK",
    message: text,
    direct_link: imageUrl,
    developer: "https://t.me/TryToLiveAlone"
  });
}
