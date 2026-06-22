export default async function handler(req, res) {
  const { domain } = req.query;
  if (!domain) return res.status(400).json({ error: "Domain required" });

  try {
    const cleanDomain = domain.replace(/^www\./, '');
    const response = await fetch(`https://whois-api.com/api/whois?domain=${cleanDomain}`);
    
    if (!response.ok) throw new Error('API rate limit or error');
    
    const data = await response.json();
    res.json({ domain: cleanDomain, status: "success", data });
  } catch (error) {
    // Fallback to raw WHOIS
    try {
      const tld = cleanDomain.split('.').pop();
      const raw = await fetch(`https://whois.nic.${tld}/whois?domain=${cleanDomain}`);
      const text = await raw.text();
      res.json({ domain: cleanDomain, status: "success", data: { raw: text } });
    } catch (e) {
      res.status(500).json({ error: "WHOIS lookup failed" });
    }
  }
}
