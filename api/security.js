import axios from "axios";

export default async function handler(req, res) {
  try {
    const metadata = {
      ip: req.headers["x-forwarded-for"] || "unknown",
      method: req.method,
      path: req.url,
      headers: req.headers.authorization ? "Authorization present" : "Authorization missing",
      bodySize: JSON.stringify(req.body || {}).length,
      body: req.body || "none"
    };

    // 🔴 Replace with your actual Beak endpoint later
    const beakResponse = await axios.post(
      "https://YOUR_BEAK_ENDPOINT",
      {
        message: `Analyze this request and decide ALLOW, REVIEW, or BLOCK:\n${JSON.stringify(metadata)}`
      },
      {
        headers: {
          Authorization: "Bearer YOUR_BEAK_API_KEY"
        }
      }
    );

    const decision = beakResponse.data.action || "ALLOW";

    if (decision === "BLOCK") {
      return res.status(403).json({ message: "Blocked by AI Security Agent" });
    }

    return res.status(200).json({
      message: "Request allowed",
      decision: decision
    });

  } catch (error) {
    return res.status(500).json({ error: "Security check failed" });
  }
}
