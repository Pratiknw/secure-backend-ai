const requestCounts = {};

module.exports = async function handler(req, res) {

  const ip = req.headers["x-forwarded-for"] || "unknown";
  const hasAuth = !!req.headers.authorization || req.query.auth === "true";
  const userAgent = req.headers["user-agent"] || "";
  const requestBody = JSON.stringify(req.body || {}) + JSON.stringify(req.query || {});

  // 🔥 Rate Limiting (Max 5 requests per IP)
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

  // 🚫 SQL Injection Detection
  if (requestBody.includes("SELECT") || requestBody.includes("DROP") || requestBody.includes("' OR")) {
    return res.status(403).json({
      firewall: "BLOCKED",
      reason: "SQL Injection Pattern Detected"
    });
  }

  // 🚫 Suspicious User-Agent
  if (userAgent.toLowerCase().includes("bot") || userAgent.toLowerCase().includes("curl")) {
    return res.status(403).json({
      firewall: "BLOCKED",
      reason: "Suspicious User-Agent"
    });
  }

  return res.status(200).json({
    firewall: "PASSED",
    message: "Request allowed by WAF"
  });
};
