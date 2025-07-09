export default async function handler(req, res) {
  const { text } = req.query;

  // Use default or user-supplied values
  const background = req.query.background || "#000000";
  const size = req.query.size || 40;

  if (!text) {
    return res.status(400).json({
      status: "ERROR",
      message: "Missing 'text' parameter",
      direct_link: null
    });
  }

  const key = "61d612b99b919f89ae1f52c58e175c99";
  const url = `https://api.imgbun.com/jpg?key=${key}&text=${encodeURIComponent(
    text
  )}&background=${encodeURIComponent(background)}&size=${size}`;

  try {
    const response = await fetch(url);
    const data = await response.json(); // Assumes imgbun returns JSON

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
