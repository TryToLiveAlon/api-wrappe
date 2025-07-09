export default async function handler(req, res) {
  const { text } = req.query;
  const background = req.query.background || "#000000";
  const size = req.query.size || 40;

  if (!text) {
    return res.status(400).json({
      status: "ERROR",
      message: "Missing 'text' parameter",
      direct_link: null
    });
  }

  // ✅ Must be 6-digit hex code with #
  const isValidHex = /^#[0-9A-Fa-f]{6}$/.test(background);
  if (!isValidHex) {
    return res.status(400).json({
      status: "ERROR",
      message: "Background color must be a 6-digit hexadecimal code like #FF0000.",
      direct_link: null
    });
  }

  const key = "61d612b99b919f89ae1f52c58e175c99";

  // ✅ DO NOT encode "#" — pass it raw to imgbun
  const url = `https://api.imgbun.com/jpg?key=${key}&text=${encodeURIComponent(text)}&background=${background}&size=${size}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    return res.status(200).json({
      status: data.status || "OK",
      message: text,
      direct_link: data.direct_link,
      developer: "https://t.me/TryToLiveAlone"
    });
  } catch (e) {
    return res.status(500).json({
      status: "ERROR",
      message: "Something went wrong while fetching from imgbun.",
      direct_link: null
    });
  }
}
