// Vercel Serverless Function Bridge: /api/campaigns
// Server-Side Realtime Cloud Persistence Engine for District Aligarh Cyber Portal

const JSONBLOB_URL = "https://jsonblob.com/api/jsonBlob/019fcd39-c710-7475-a405-5201602f509b";

const DEFAULT_CAMPAIGNS = [
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

async function fetchCloudData() {
  try {
    const res = await fetch(JSONBLOB_URL + "?t=" + Date.now(), {
      headers: { "Accept": "application/json" },
      cache: "no-store"
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (e) {
    console.error("Error fetching cloud blob:", e);
  }
  return DEFAULT_CAMPAIGNS;
}

async function saveCloudData(data) {
  try {
    const res = await fetch(JSONBLOB_URL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(data)
    });
    return res.ok;
  } catch (e) {
    console.error("Error saving cloud blob:", e);
    return false;
  }
}

export default async function handler(req, res) {
  // CORS & Cache Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // GET: Read global campaign database
  if (req.method === "GET") {
    const campaigns = await fetchCloudData();
    return res.status(200).json(campaigns);
  }

  // PUT / POST: Write or prepend record to global cloud database
  if (req.method === "PUT" || req.method === "POST") {
    try {
      let body = req.body;
      if (typeof body === "string") {
        try { body = JSON.parse(body); } catch (e) {}
      }
      
      let currentData = await fetchCloudData();

      if (Array.isArray(body)) {
        currentData = body;
      } else if (body && typeof body === "object") {
        currentData.unshift(body);
      }

      // Re-index Sr No (1, 2, 3...)
      currentData.forEach((item, idx) => {
        item.srNo = idx + 1;
      });

      const savedOk = await saveCloudData(currentData);
      return res.status(200).json({ status: savedOk ? "success" : "partial", campaigns: currentData });
    } catch (e) {
      return res.status(400).json({ error: "Invalid JSON format: " + e.message });
    }
  }

  // DELETE: Delete record by srNo query
  if (req.method === "DELETE") {
    const { srNo } = req.query;
    if (srNo) {
      const targetSrNo = parseInt(srNo);
      let currentData = await fetchCloudData();
      currentData = currentData.filter(item => item.srNo !== targetSrNo);
      
      currentData.forEach((item, idx) => {
        item.srNo = idx + 1;
      });

      const savedOk = await saveCloudData(currentData);
      return res.status(200).json({ status: savedOk ? "success" : "partial", campaigns: currentData });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
