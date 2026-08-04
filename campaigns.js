// Vercel Serverless Function API Endpoint: /api/campaigns
// Server-side persistent state for Aligarh Cyber Wednesday Portal

let inMemoryCampaigns = [
  {
    srNo: 1,
    policeStation: "PS Civil lines",
    placeCampaign: "AMU Campus Hall & University Road, Aligarh",
    countPerson: 450,
    officerName: "Inspector Aligarh Cyber Crime Cell",
    date: "2026-07-29",
    photo: "images/campaign_1.jpg"
  },
  {
    srNo: 2,
    policeStation: "PS Atruali",
    placeCampaign: "Inter College Hall & Market Centre, Atrauli",
    countPerson: 320,
    officerName: "Sub-Inspector PS Atrauli",
    date: "2026-07-22",
    photo: "images/campaign_2.jpg"
  },
  {
    srNo: 3,
    policeStation: "Cyber Crime Cell",
    placeCampaign: "Police Line Auditorium, District Aligarh",
    countPerson: 600,
    officerName: "In-charge Cyber Crime Cell Aligarh",
    date: "2026-07-15",
    photo: "images/campaign_3.jpg"
  }
];

export default async function handler(req, res) {
  // Set CORS & No-Cache Headers for 100% Realtime Sync
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // GET: Fetch all campaigns
  if (req.method === "GET") {
    return res.status(200).json(inMemoryCampaigns);
  }

  // PUT / POST: Update or replace all campaigns
  if (req.method === "PUT" || req.method === "POST") {
    try {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      if (Array.isArray(body)) {
        inMemoryCampaigns = body;
        return res.status(200).json({ status: "success", campaigns: inMemoryCampaigns });
      } else if (body && typeof body === "object") {
        inMemoryCampaigns.unshift(body);
        inMemoryCampaigns.forEach((item, idx) => { item.srNo = idx + 1; });
        return res.status(200).json({ status: "success", campaigns: inMemoryCampaigns });
      }
    } catch (e) {
      return res.status(400).json({ error: "Invalid JSON format" });
    }
  }

  // DELETE: Remove record by srNo query
  if (req.method === "DELETE") {
    const { srNo } = req.query;
    if (srNo) {
      const targetSrNo = parseInt(srNo);
      inMemoryCampaigns = inMemoryCampaigns.filter(item => item.srNo !== targetSrNo);
      inMemoryCampaigns.forEach((item, idx) => { item.srNo = idx + 1; });
      return res.status(200).json({ status: "success", campaigns: inMemoryCampaigns });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
