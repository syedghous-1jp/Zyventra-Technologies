// api/dns-lookup.js
export default async function handler(req, res) {
  const { domain } = req.query;

  if (!domain) {
    return res.status(400).json({ error: "Domain name is required" });
  }

  try {
    const response = await fetch(`https://dns.google/resolve?name=${domain}`);
    const data = await response.json();

    res.status(200).json({
      domain: domain,
      status: "success",
      records: data
    });
  } catch (error) {
    res.status(500).json({ error: "Server error: " + error.message });
  }
}
