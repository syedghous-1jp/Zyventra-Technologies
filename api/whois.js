// api/whois.js - using whoisjson.com (free, no key)
export default async function handler(req, res) {
  const { domain } = req.query;

  if (!domain) {
    return res.status(400).json({ error: "Domain name is required" });
  }

  try {
    const cleanDomain = domain.replace(/^www\./, '');
    
    // WHOIS JSON API (free, no key)
    const response = await fetch(`https://whoisjson.com/api/v1/whois?domain=${cleanDomain}`);
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('API returned non-JSON response');
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
