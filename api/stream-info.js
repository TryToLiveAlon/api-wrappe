export default async function handler(req, res) {
  const { url } = req.query;

  // ❌ Validate
  if (!url) {
    return res.status(400).json({
      success: false,
      message: "url query is required"
    });
  }

  try {
    const apiRes = await fetch(
      `https://telegram-player-bot.kiranaosapp.workers.dev/api?url=${encodeURIComponent(url)}`
    );

    const data = await apiRes.json();

    // ✅ Return clean response
    return res.status(200).json({
      success: true,
      title: data?.title || null,
      stream_url: data?.stream?.url || null,
      thumbnail: data?.thumbnail || null,
      duration: data?.duration || null,
      quality: data?.quality || null
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch stream info"
    });
  }
}
