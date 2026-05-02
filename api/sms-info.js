export default async function handler(req, res) {
  const { term } = req.query;

  // ❌ Validate input
  if (!term) {
    return res.status(400).json({
      success: false,
      message: "term query is required"
    });
  }

  try {
    const apiRes = await fetch(
      `https://ayaanmods.site/sms.php?key=annonymoussms&term=${term}`
    );

    const data = await apiRes.json();

    const result = data?.result || {};

    // ✅ Return only important fields
    return res.status(200).json({
      success: result?.success || false,
      user_id: result?.tg_id || null,
      number: result?.number || null,
      country: result?.country || null,
      country_code: result?.country_code || null,
      message: result?.msg || null
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch data"
    });
  }
      }
