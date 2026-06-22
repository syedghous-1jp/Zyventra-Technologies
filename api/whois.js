// api/whois.js - Using ip-api.com WHOIS (works!)
export default async function handler(req, res) {
  const { domain } = req.query;

  if (!domain) {
    return res.status(400).json({ error: "Domain name is required" });
  }

  try {
    // Clean domain
    const cleanDomain = domain.replace(/^www\./, '');
    
    // ip-api.com WHOIS endpoint
    const response = await fetch(`http://ip-api.com/whois/${cleanDomain}`);
    const data = await response.text();

    res.status(200).json({
      domain: cleanDomain,
      status: "success",
      data: { raw: data }
    });
  } catch (error) {
    res.status(500).json({ error: "Server error: " + error.message });
  }
}
