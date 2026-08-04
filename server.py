import http.server
import socketserver
import json
import os
import urllib.parse

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(DIRECTORY, "data", "campaigns.json")

# Ensure data directory exists
os.makedirs(os.path.join(DIRECTORY, "data"), exist_ok=True)

# Default Seed Data if campaigns.json doesn't exist
DEFAULT_CAMPAIGNS = [
    {
        "srNo": 1,
        "policeStation": "PS Civil lines",
        "placeCampaign": "AMU Campus Hall & University Road, Aligarh",
        "countPerson": 450,
        "officerName": "Inspector Aligarh Cyber Crime Cell",
        "date": "2026-07-29",
        "photo": "images/campaign_1.jpg"
    },
    {
        "srNo": 2,
        "policeStation": "PS Atruali",
        "placeCampaign": "Inter College Hall & Market Centre, Atrauli",
        "countPerson": 320,
        "officerName": "Sub-Inspector PS Atrauli",
        "date": "2026-07-22",
        "photo": "images/campaign_2.jpg"
    },
    {
        "srNo": 3,
        "policeStation": "Cyber Crime Cell",
        "placeCampaign": "Police Line Auditorium, District Aligarh",
        "countPerson": 600,
        "officerName": "In-charge Cyber Crime Cell Aligarh",
        "date": "2026-07-15",
        "photo": "images/campaign_3.jpg"
    }
]

def load_campaigns():
    if not os.path.exists(DATA_FILE):
        save_campaigns(DEFAULT_CAMPAIGNS)
        return DEFAULT_CAMPAIGNS
    try:
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading campaigns: {e}")
        return DEFAULT_CAMPAIGNS

def save_campaigns(campaigns):
    try:
        with open(DATA_FILE, "w", encoding="utf-8") as f:
            json.dump(campaigns, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"Error saving campaigns: {e}")

class CyberDatabaseHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        parsed_path = urllib.parse.urlparse(self.path)
        if parsed_path.path == "/api/campaigns":
            campaigns = load_campaigns()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(campaigns).encode("utf-8"))
        else:
            super().do_GET()

    def do_POST(self):
        parsed_path = urllib.parse.urlparse(self.path)
        if parsed_path.path == "/api/campaigns":
            content_length = int(self.headers.get("Content-Length", 0))
            post_data = self.rfile.read(content_length)
            try:
                new_record = json.loads(post_data.decode("utf-8"))
                campaigns = load_campaigns()

                # Prepend new record & re-index srNo
                campaigns.insert(0, new_record)
                for idx, item in enumerate(campaigns):
                    item["srNo"] = idx + 1

                save_campaigns(campaigns)

                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                response = {"status": "success", "message": "Record saved to Central Database", "campaigns": campaigns}
                self.wfile.write(json.dumps(response).encode("utf-8"))
            except Exception as e:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                response = {"status": "error", "message": str(e)}
                self.wfile.write(json.dumps(response).encode("utf-8"))
        else:
            self.send_response(404)
            self.end_headers()

    def do_DELETE(self):
        parsed_path = urllib.parse.urlparse(self.path)
        if parsed_path.path.startswith("/api/campaigns/"):
            try:
                sr_no_str = parsed_path.path.split("/")[-1]
                target_sr_no = int(sr_no_str)
                campaigns = load_campaigns()

                campaigns = [c for c in campaigns if c.get("srNo") != target_sr_no]
                for idx, item in enumerate(campaigns):
                    item["srNo"] = idx + 1

                save_campaigns(campaigns)

                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                response = {"status": "success", "message": f"Record #{target_sr_no} deleted from Central Database", "campaigns": campaigns}
                self.wfile.write(json.dumps(response).encode("utf-8"))
            except Exception as e:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                response = {"status": "error", "message": str(e)}
                self.wfile.write(json.dumps(response).encode("utf-8"))
        else:
            self.send_response(404)
            self.end_headers()

if __name__ == "__main__":
    print(f"Starting Aligarh Cyber Central Database Server on port {PORT}...")
    with socketserver.TCPServer(("0.0.0.0", PORT), CyberDatabaseHandler) as httpd:
        print(f"Central Database Server running at http://0.0.0.0:{PORT}")
        httpd.serve_forever()
