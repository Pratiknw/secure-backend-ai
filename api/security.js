const axios = require("axios");

const requestCounts = {};

module.exports = async function handler(req, res) {

  const ip = req.headers["x-forwarded-for"] || "unknown";
  const hasAuth = !!req.headers.authorization || req.query.auth === "true";
  const userAgent = req.headers["user-agent"] || "";
  const requestBody =
    JSON.stringify(req.body || {}) + JSON.stringify(req.query || {});

  // 🔥 Rate Limiting
  requestCounts[ip] = (requestCounts[ip] || 0) + 1;
  if (requestCounts[ip] > 5) {
    return res.status(429).json({
      firewall: "BLOCKED",
      reason: "Rate limit exceeded"
    });
  }

  // 🚫 Missing Authorization
  if (!hasAuth) {
    return res.status(403).json({
      firewall: "BLOCKED",
      reason: "Missing Authorization Header"
    });
  }

  // 🚫 Basic SQL Detection
  if (
    requestBody.includes("SELECT") ||
    requestBody.includes("DROP") ||
    requestBody.includes("' OR")
  ) {
    return res.status(403).json({
      firewall: "BLOCKED",
      reason: "SQL Injection Pattern Detected"
    });
  }

  // ✅ If firewall passed → Call AI

  try {
    const metadata = {
      ip,
      userAgent,
      body: requestBody
    };

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a backend security agent. Respond with only one word: ALLOW, REVIEW, or BLOCK."
          },
          {
            role: "user",
            content: JSON.stringify(metadata)
          }
        ]
      },
      {
        headers: {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
}

      }
    );

    const aiDecision =
      response.data.choices[0].message.content.trim();

    return res.status(200).json({
      firewall: "PASSED",
      aiDecision
    });

  } catch (error) {
  console.log("OPENAI ERROR:", error.response?.data || error.message);

  return res.status(500).json({
    error: "AI analysis failed",
    details: error.response?.data || error.message
  });
}

};
