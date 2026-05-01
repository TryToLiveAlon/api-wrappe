export default async function handler(req, res) {
  const { num } = req.query;

  // ❌ Validate input
  if (!num) {
    return res.status(400).json({
      success: false,
      message: "num query is required"
    });
  }

  try {
    const response = await fetch(
      `https://hideme.eu.org/lookup?api=number-info&key=mk-dlp7syhoknjx&num=${num}`
    );

    const data = await response.json();

    // ✅ Return only RESULTS
    return res.status(200).json({
      success: true,
      results: data?.RESULTS || []
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch data"
    });
  }
}
