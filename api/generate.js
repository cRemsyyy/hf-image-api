export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests allowed" });
  }

  const { prompt } = req.body;

  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({ inputs: prompt })
      }
    );

    const result = await response.json();

    // Hugging Face sometimes returns base64 already, check
    const image_base64 = result?.[0]?.image || result?.image || null;

    if (!image_base64) {
      return res.status(500).json({ error: "No image returned" });
    }

    res.setHeader("Content-Type", "application/json");
    res.status(200).json({ image: image_base64 });
  } catch (err) {
    res.status(500).json({ error: "Image generation failed", details: err.message });
  }
}
