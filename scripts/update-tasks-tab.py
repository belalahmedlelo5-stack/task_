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

# Auto refresh token if needed
try:
    req_data = urllib.parse.urlencode({
        'client_id': token_data['client_id'],
        'client_secret': token_data['client_secret'],
        'refresh_token': token_data['token']['refresh_token'],
        'grant_type': 'refresh_token'
    }).encode('utf-8')
    req = urllib.request.Request('https://oauth2.googleapis.com/token', data=req_data, method='POST')
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode('utf-8'))
    access_token = res['access_token']
    token_data['token']['access_token'] = access_token
    with open(token_path, 'w', encoding='utf-8') as f:
        json.dump(token_data, f, indent=2)
except Exception as e:
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

print("=== Simplifying Tasks Sheet to 2 Columns ===")

# Clear existing Tasks tab completely to remove old columns
clear_url = f"https://sheets.googleapis.com/v4/spreadsheets/{SPREADSHEET_ID}/values/Tasks!A1:Z100:clear"
api_request(clear_url, method="POST", data={})
print("Cleared old Tasks data.")

# 2-column layout: اسم المادة | المهمة المطلوبة
tasks_data = [
    ["اسم المادة (Subject)", "المهمة المطلوبة (Task)"],
    ["Stem Cell Biology (خلايا جذعية)", "presentation (بريزنتيشن للمجموعة A)"],
    ["Drug Monitoring (مراقبة دوائية)", ""],
    ["Microbial Genetics (وراثة ميكروبية)", ""],
    ["Gene Therapy (علاج جيني)", ""],
    ["Recombinant DNA Technology (تكنولوجيا اتحاد الحمض النووي)", ""],
    ["Communication and Cell Signaling (اتصال وإشارات خلوية)", ""],
    ["Industry and Bacterial Biotechnology (تكنولوجيا حيوية بكتيرية وصناعية)", ""]
]

put_url = f"https://sheets.googleapis.com/v4/spreadsheets/{SPREADSHEET_ID}/values/Tasks!A1?valueInputOption=USER_ENTERED"
val_data = {
    "range": "Tasks!A1",
    "majorDimension": "ROWS",
    "values": tasks_data
}
api_request(put_url, method="PUT", data=val_data)
print(f"Tasks tab populated with {len(tasks_data)} rows.")

# Update local seed/tasks.csv
with open(r"d:\task\seed\tasks.csv", "w", encoding="utf-8", newline="") as f:
    writer = csv.writer(f)
    for row in tasks_data:
        writer.writerow(row)
print("Updated local seed/tasks.csv.")

# Get Tasks sheetId for styling
meta = api_request(f"https://sheets.googleapis.com/v4/spreadsheets/{SPREADSHEET_ID}")
tasks_sheet_id = next(s["properties"]["sheetId"] for s in meta["sheets"] if s["properties"]["title"] == "Tasks")

format_requests = [
    # 1. Header row formatting: Emerald background, white bold text
    {
        "repeatCell": {
            "range": {
                "sheetId": tasks_sheet_id,
                "startRowIndex": 0,
                "endRowIndex": 1,
                "startColumnIndex": 0,
                "endColumnIndex": 2
            },
            "cell": {
                "userEnteredFormat": {
                    "backgroundColor": {"red": 0.05, "green": 0.45, "blue": 0.28},
                    "textFormat": {"bold": True, "foregroundColor": {"red": 1.0, "green": 1.0, "blue": 1.0}, "fontSize": 12},
                    "horizontalAlignment": "CENTER"
                }
            },
            "fields": "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)"
        }
    },
    # 2. Subject column formatting: Bold font, light green tint
    {
        "repeatCell": {
            "range": {
                "sheetId": tasks_sheet_id,
                "startRowIndex": 1,
                "endRowIndex": 8,
                "startColumnIndex": 0,
                "endColumnIndex": 1
            },
            "cell": {
                "userEnteredFormat": {
                    "backgroundColor": {"red": 0.95, "green": 0.98, "blue": 0.95},
                    "textFormat": {"bold": True, "fontSize": 11}
                }
            },
            "fields": "userEnteredFormat(backgroundColor,textFormat)"
        }
    },
    # 3. Freeze Header Row
    {
        "updateSheetProperties": {
            "properties": {
                "sheetId": tasks_sheet_id,
                "gridProperties": {
                    "frozenRowCount": 1
                }
            },
            "fields": "gridProperties.frozenRowCount"
        }
    },
    # 4. Set explicit column widths (Col A: 320px, Col B: 500px)
    {
        "updateDimensionProperties": {
            "range": {
                "sheetId": tasks_sheet_id,
                "dimension": "COLUMNS",
                "startIndex": 0,
                "endIndex": 1
            },
            "properties": {
                "pixelSize": 320
            },
            "fields": "pixelSize"
        }
    },
    {
        "updateDimensionProperties": {
            "range": {
                "sheetId": tasks_sheet_id,
                "dimension": "COLUMNS",
                "startIndex": 1,
                "endIndex": 2
            },
            "properties": {
                "pixelSize": 500
            },
            "fields": "pixelSize"
        }
    }
]

api_request(f"https://sheets.googleapis.com/v4/spreadsheets/{SPREADSHEET_ID}:batchUpdate", method="POST", data={"requests": format_requests})
print("Successfully formatted Tasks sheet tab with clean 2-column layout!")
