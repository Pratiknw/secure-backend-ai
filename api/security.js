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

    const response = await axios.post(
      "https://api.beakops.com/v1/chat/completions",   // ✅ Beak API endpoint
      {
        model: "gpt-4.1",
        messages: [
          {
            role: "system",
            content: "You are a backend security agent. Decide ALLOW, REVIEW, or BLOCK."
          },
          {
            role: "user",
            content: `Analyze this request:\n${JSON.stringify(metadata)}`
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.BEAK_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const aiReply = response.data.choices[0].message.content;

    let decision = "ALLOW";
    if (aiReply.includes("BLOCK")) decision = "BLOCK";
    else if (aiReply.includes("REVIEW")) decision = "REVIEW";

    if (decision === "BLOCK") {
      return res.status(403).json({ message: "Blocked by AI Security Agent" });
    }

    return res.status(200).json({
      message: "Request processed",
      decision,
      aiAnalysis: aiReply
    });

  } catch (error) {
    console.error(error.response?.data || error.message);
    return res.status(500).json({ error: "Security check failed" });
  }
}


  } catch (error) {
    return res.status(500).json({ error: "Security check failed" });
  }
}
