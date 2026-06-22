// api/whois.js - using whois.nic (raw text)
export default async function handler(req, res) {
  const { domain } = req.query;

  if (!domain) {
    return res.status(400).json({ error: "Domain name is required" });
  }

  try {
    const cleanDomain = domain.replace(/^www\./, '');
    
    // Get TLD (com, org, etc.)
    const parts = cleanDomain.split('.');
    const tld = parts.length > 1 ? parts[parts.length - 1] : 'com';
    
    // WHOIS.nic server (raw text)
    const response = await fetch(`https://whois.nic.${tld}/whois?domain=${cleanDomain}`);
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
