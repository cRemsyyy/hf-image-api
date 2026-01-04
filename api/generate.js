export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
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

    const data = await response.json();

    // Hugging Face sometimes returns base64 differently
    const base64Image = data?.images?.[0] || data?.image || null;

    if (!base64Image) {
      return res.status(500).json({ error: "No image returned" });
    }

    res.status(200).json({ image: base64Image });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
