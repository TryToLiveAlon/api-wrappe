export default async function handler(req, res) {
  const { text, background = "#000000", size = 40 } = req.query;

  if (!text) {
    return res.status(400).json({ status: "ERROR", message: "Missing 'text' parameter" });
  }

  const key = "61d612b99b919f89ae1f52c58e175c99";
  const url = `https://api.imgbun.com/jpg?key=${key}&text=${encodeURIComponent(text)}&background=${encodeURIComponent(background)}&size=${size}`;

  try {
    const response = await fetch(url);
    const data = await response.json(); // Parse JSON from imgbun

    return res.status(200).json({
      status: data.status || "OK",
      message: text,
      direct_link: data.direct_link
    });
  } catch (error) {
    return res.status(500).json({
      status: "ERROR",
      message: "Something went wrong",
      direct_link: null
    });
  }
}
