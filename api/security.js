const axios = require("axios");

module.exports = async function handler(req, res) {
  try {
    const metadata = {
      ip: req.headers["x-forwarded-for"] || "unknown",
      method: req.method,
      path: req.url,
      headers: req.headers.authorization ? "Authorization present" : "Authorization missing",
      bodySize: JSON.stringify(req.body || {}).length,
      body: req.body || "none"
    };

    const beakResponse = await axios.post(
  process.env.BEAK_ENDPOINT,   // we will set this in Vercel
  {
    message: `Analyze this request and decide ALLOW, REVIEW, or BLOCK:\n${JSON.stringify(metadata)}`
  },
  {
    headers: {
      "gAAAAABpjr4jyTR5ASd6VvHbbKYzwSpCiaRBuGZqVCE3uC0RxPOKJnUH93hcVGDYOxL6pBx3ldrX8hIJRFf3C6EkBEWcP5B_1Q==":
      "gAAAAABpjr4j-dGZj56SZruxe7GITHkd063L-3cfsCaSHtWWAr6eRu4DvaaH2a9UO8l-SjDCt9r2Qy6avSDZ3JAWCSCCimkujfmCUiuVo9gC1Mv41oHHyj9ZzkPVBIhqoGkxyRe22vSA-516DuuogvA-mSyDb5JBmDQmsEzufDgXpvqk1GzTI_MxbItxBoTwpZ_b7hQZlftAA31m5JdRncv6GcmcrnJq7JINrdZXH60XncagJQZEkvtCpEOj11XlXKUwC9gADXUoOsYBdFvYlC7-GbTtZs0VWw=="
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
  console.log("ERROR DETAILS:", error.response?.data || error.message);
  return res.status(500).json({ 
    error: "Security check failed",
    details: error.response?.data || error.message
  });
}

};
