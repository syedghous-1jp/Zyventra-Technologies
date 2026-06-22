// api/whois.js - FINAL WORKING VERSION
export default async function handler(req, res) {
  const { domain } = req.query;

  if (!domain) {
    return res.status(400).json({ error: "Domain name is required" });
  }

  try {
    // Clean domain
    const cleanDomain = domain.replace(/^www\./, '').trim();
    
    // Try whois-api.com (free, no key)
    const response = await fetch(`https://whois-api.com/api/whois?domain=${cleanDomain}`);
    
    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }
    
    // Check if response is JSON
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      // If not JSON, return raw text
      return res.status(200).json({
        domain: cleanDomain,
        status: "success",
        data: { raw: text }
      });
    }

    res.status(200).json({
      domain: cleanDomain,
      status: "success",
      data: data
    });
  } catch (error) {
    // Fallback: try whoisjson.com
    try {
      const fallbackResponse = await fetch(`https://whoisjson.com/api/v1/whois?domain=${domain.replace(/^www\./, '')}`);
      const fallbackData = await fallbackResponse.json();
      
      return res.status(200).json({
        domain: domain.replace(/^www\./, ''),
        status: "success",
        data: fallbackData
      });
    } catch (fallbackError) {
      return res.status(500).json({ error: "Server error: " + error.message });
    }
  }
}
