import json
import urllib.request
import urllib.parse
import os

token_path = r"C:\Users\IT\.gemini\antigravity\plugin_data\gsheets\token.json"
with open(token_path, "r", encoding="utf-8") as f:
    token_data = json.load(f)

access_token = token_data["token"]["access_token"]
headers = {
    "Authorization": f"Bearer {access_token}",
    "Content-Type": "application/json"
}

spreadsheet_id = "1KSyoUw-je7A80IuSbM1ORSuMM2w1vaNvv6C29Q_W_vE"
url = f"https://sheets.googleapis.com/v4/spreadsheets/{spreadsheet_id}"

req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
        print("Spreadsheet Title:", data.get("properties", {}).get("title"))
        print("Existing Sheets:", [s["properties"]["title"] for s in data.get("sheets", [])])
except Exception as e:
    print("Error:", e)
