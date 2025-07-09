export default async function handler(req, res) {
  const { text, background = "#000000", size = 40 } = req.query;

  if (!text) {
    return res.status(400).json({ error: "Missing 'text' parameter" });
  }

  const key = "61d612b99b919f89ae1f52c58e175c99"; // Hidden from users
  const url = `https://api.imgbun.com/jpg?key=${key}&text=${encodeURIComponent(text)}&background=${encodeURIComponent(background)}&size=${size}`;

  try {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();

    res.setHeader("Content-Type", "image/jpeg");
    res.setHeader("Cache-Control", "public, max-age=86400");
    return res.send(Buffer.from(buffer));
  } catch (error) {
    res.status(500).json({ error: "Image generation failed." });
  }
}
