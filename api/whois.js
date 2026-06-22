// api/whois.js (Alternative)
export default async function handler(req, res) {
  const { domain } = req.query;

  if (!domain) {
    return res.status(400).json({ error: "Domain name is required" });
  }

  try {
    // Alternative free WHOIS API
    const response = await fetch(`https://whois.nic.${domain.split('.').pop()}/whois?domain=${domain}`);
    const data = await response.text();

    res.status(200).json({
      domain: domain,
      status: "success",
      data: { raw: data }
    });
  } catch (error) {
    res.status(500).json({ error: "Server error: " + error.message });
  }
}
