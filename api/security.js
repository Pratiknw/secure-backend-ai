export default async function handler(req, res) {
  try {
    const authHeader = req.headers.authorization;

    let decision = "ALLOW";
    let reason = "Safe request";

    // 🚨 Fake AI logic (simulates real firewall AI)
    if (!authHeader) {
      decision = "BLOCK";
      reason = "Missing Authorization Header";
    } 
    else if (authHeader.includes("attack")) {
      decision = "BLOCK";
      reason = "Suspicious token detected";
    } 
    else if (authHeader.includes("review")) {
      decision = "REVIEW";
      reason = "Needs manual verification";
    }

    return res.status(200).json({
      firewall: decision,
      reason: reason
    });

  } catch (error) {
    return res.status(500).json({
      error: "Security check failed"
    });
  }
}
