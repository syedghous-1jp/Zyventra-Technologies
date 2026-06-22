// api/whois.js
export default async function handler(req, res) {
  const { domain } = req.query;

  if (!domain) {
    return res.status(400).json({ error: "Domain name is required" });
  }

  try {
    // Get TLD from domain
    const parts = domain.split('.');
    const tld = parts.length > 1 ? parts[parts.length - 1] : 'com';
    
    // WHOIS server for the TLD
    const whoisServer = `whois.nic.${tld}`;
    
    // Fetch WHOIS data
    const response = await fetch(`https://${whoisServer}/whois?domain=${domain}`);
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
