// api/whois.js - using whois-api.com (free, no key)
export default async function handler(req, res) {
  const { domain } = req.query;

  if (!domain) {
    return res.status(400).json({ error: "Domain name is required" });
  }

  try {
    const cleanDomain = domain.replace(/^www\./, '');
    
    // WHOIS API (free, no key)
    const response = await fetch(`https://whois-api.com/api/whois?domain=${cleanDomain}`);
    
    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }
    
    const data = await response.json();

    res.status(200).json({
      domain: cleanDomain,
      status: "success",
      data: data
    });
  } catch (error) {
    res.status(500).json({ error: "Server error: " + error.message });
  }
}
