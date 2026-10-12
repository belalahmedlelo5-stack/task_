import sys
import os
import json
import csv
import urllib.request
import urllib.parse

if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

SPREADSHEET_ID = "1KSyoUw-je7A80IuSbM1ORSuMM2w1vaNvv6C29Q_W_vE"
token_path = r"C:\Users\IT\.gemini\antigravity\plugin_data\gsheets\token.json"

with open(token_path, "r", encoding="utf-8") as f:
    token_data = json.load(f)

access_token = token_data["token"]["access_token"]

def api_request(url, method="GET", data=None):
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    body = json.dumps(data).encode("utf-8") if data is not None else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))

print("=== Setting up Google Sheet tabs ===")
meta = api_request(f"https://sheets.googleapis.com/v4/spreadsheets/{SPREADSHEET_ID}")
existing_sheets = {s["properties"]["title"]: s["properties"]["sheetId"] for s in meta.get("sheets", [])}

target_tabs = ["Subjects", "Materials", "Tasks", "Sessions"]
requests = []

# Add tabs
for tab in target_tabs:
    if tab not in existing_sheets:
        requests.append({
            "addSheet": {
                "properties": {
                    "title": tab,
                    "gridProperties": {"frozenRowCount": 1}
                }
            }
        })

if requests:
    api_request(f"https://sheets.googleapis.com/v4/spreadsheets/{SPREADSHEET_ID}:batchUpdate", method="POST", data={"requests": requests})
    print("Added target tabs.")
    meta = api_request(f"https://sheets.googleapis.com/v4/spreadsheets/{SPREADSHEET_ID}")
    existing_sheets = {s["properties"]["title"]: s["properties"]["sheetId"] for s in meta.get("sheets", [])}

# Delete any default sheet not in target_tabs
for old_name, old_id in existing_sheets.items():
    if old_name not in target_tabs:
        try:
            del_req = {"requests": [{"deleteSheet": {"sheetId": old_id}}]}
            api_request(f"https://sheets.googleapis.com/v4/spreadsheets/{SPREADSHEET_ID}:batchUpdate", method="POST", data=del_req)
            print(f"Removed default sheet: {old_name}")
        except Exception as e:
            print("Note removing default sheet:", e)

def write_csv_to_tab(tab_name, csv_path):
    with open(csv_path, "r", encoding="utf-8") as f:
        rows = list(csv.reader(f))

    url = f"https://sheets.googleapis.com/v4/spreadsheets/{SPREADSHEET_ID}/values/'{urllib.parse.quote(tab_name)}'!A1?valueInputOption=USER_ENTERED"
    val_data = {
        "range": f"'{tab_name}'!A1",
        "majorDimension": "ROWS",
        "values": rows
    }
    api_request(url, method="PUT", data=val_data)
    print(f"Tab '{tab_name}' populated with {len(rows)} rows.")

write_csv_to_tab("Subjects", r"d:\task\seed\subjects.csv")
write_csv_to_tab("Materials", r"d:\task\seed\materials.csv")
write_csv_to_tab("Sessions", r"d:\task\seed\sessions.csv")
write_csv_to_tab("Tasks", r"d:\task\seed\tasks.csv")

print("\n=== Google Spreadsheet fully populated! ===")
