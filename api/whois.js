// api/whois.js
export default async function handler(req, res) {
  const { domain } = req.query;

  if (!domain) {
    return res.status(400).json({ error: "Domain name is required" });
  }

  try {
    // Free WHOIS API (no key needed for basic queries)
    const response = await fetch(`https://whois-api.com/api/whois?domain=${domain}`);
    const data = await response.json();

    res.status(200).json({
      domain: domain,
      status: "success",
      data: data
    });
  } catch (error) {
    res.status(500).json({ error: "Server error: " + error.message });
  }
}
