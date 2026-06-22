// api/whois.js
export default async function handler(req, res) {
  const { domain } = req.query;

  if (!domain) {
    return res.status(400).json({ error: "Domain name is required" });
  }

  try {
    const cleanDomain = domain.replace(/^www\./, '');
    const response = await fetch(`https://whoisjson.com/api/v1/whois?domain=${cleanDomain}`);
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
