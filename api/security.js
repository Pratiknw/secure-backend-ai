module.exports = async function handler(req, res) {

  // 🔥 Basic WAF Layer

  const ip = req.headers["x-forwarded-for"] || "unknown";
  const hasAuth = !!req.headers.authorization;
  const userAgent = req.headers["user-agent"] || "";
  const requestBody = JSON.stringify(req.body || {});

  // 🚫 Rule 1: Block missing authorization
  if (!hasAuth) {
    return res.status(403).json({
      firewall: "BLOCKED",
      reason: "Missing Authorization Header"
    });
  }

  // 🚫 Rule 2: Block suspicious SQL injection patterns
  if (requestBody.includes("SELECT") || requestBody.includes("DROP") || requestBody.includes("' OR")) {
    return res.status(403).json({
      firewall: "BLOCKED",
      reason: "SQL Injection Pattern Detected"
    });
  }

  // 🚫 Rule 3: Block suspicious user agents
  if (userAgent.toLowerCase().includes("bot") || userAgent.toLowerCase().includes("curl")) {
    return res.status(403).json({
      firewall: "BLOCKED",
      reason: "Suspicious User-Agent"
    });
  }

  // ✅ If passed WAF
  return res.status(200).json({
    firewall: "PASSED",
    message: "Request allowed by WAF"
  });
};
