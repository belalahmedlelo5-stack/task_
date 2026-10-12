import sys
import os
import json
import csv
import urllib.request
import urllib.parse

if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

token_path = r"C:\Users\IT\.gemini\antigravity\plugin_data\gsheets\token.json"
with open(token_path, "r", encoding="utf-8") as f:
    token_data = json.load(f)

# Refresh token
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

headers = {
    "Authorization": f"Bearer {access_token}",
    "Content-Type": "application/json"
}

SPREADSHEET_ID = "1KSyoUw-je7A80IuSbM1ORSuMM2w1vaNvv6C29Q_W_vE"

def api_request(url, method="GET", data=None):
    body = json.dumps(data).encode("utf-8") if data is not None else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    with urllib.request.urlopen(req) as resp:
        if resp.status == 204:
            return {}
        return json.loads(resp.read().decode("utf-8"))

print("=== Reorganizing Materials Tab into 7 Subjects x 12 Slots Layout ===", flush=True)

# 7 Subjects metadata & Drive Folders
subjects = [
    {
        "id": "stem-cell-biology",
        "name": "01 - Stem Cell Biology (بيولوجيا الخلايا الجذعية)",
        "folder_url": "https://drive.google.com/drive/folders/17LwiR5Hcn0LNt0z6sr3I4ESx_lMPUGnI"
    },
    {
        "id": "drug-monitoring",
        "name": "02 - Drug Monitoring (مراقبة الدواء)",
        "folder_url": "https://drive.google.com/drive/folders/1SbY-DIrXVeSmGnGchRjzWFpOOK4CkFiW"
    },
    {
        "id": "microbial-genetics",
        "name": "03 - Microbial Genetics (وراثة ميكروبية)",
        "folder_url": "https://drive.google.com/drive/folders/1BNEc8nuLpXa9iJWj5N_HAaikdkGmKihN"
    },
    {
        "id": "gene-therapy",
        "name": "04 - Gene Therapy (علاج جيني)",
        "folder_url": "https://drive.google.com/drive/folders/1KKNHzeCcmiQANc5JyHGNwCsBK_6By9-5"
    },
    {
        "id": "recombinant-dna-technology",
        "name": "05 - Recombinant DNA Technology (تكنولوجيا الـ DNA معاد الاتحاد)",
        "folder_url": "https://drive.google.com/drive/folders/1VWoitSqks-N0K4mSGptclUtxizj0eERV"
    },
    {
        "id": "communication-cell-signaling",
        "name": "06 - Communication and Cell Signaling (الاتصال والإشارات الخلوية)",
        "folder_url": "https://drive.google.com/drive/folders/1JcSFtPCTUqUigGPvZmy8rN59B7eUW1-c"
    },
    {
        "id": "industry-bacterial-biotechnology",
        "name": "07 - Industry and Bacterial Biotechnology (التكنولوجيا الحيوية البكتيرية والصناعية)",
        "folder_url": "https://drive.google.com/drive/folders/1CHQ9ursSxe3UBq6MLpEMm0tV42KbfJHx"
    }
]

# Read existing individual materials from seed/materials.csv
materials_by_sub = {s["id"]: [] for s in subjects}
with open(r"d:\task\seed\materials.csv", "r", encoding="utf-8") as f:
    reader = csv.reader(f)
    header = next(reader, None)
    for row in reader:
        if len(row) > 6 and row[3] != "FOLDER":
            sub_id = row[6]
            title = row[2]
            drive_url = row[1]
            cat = row[3]
            if sub_id in materials_by_sub:
                materials_by_sub[sub_id].append((cat, title, drive_url))

# Build clean 3-column rows:
# [اسم المادة (Subject), نوع ومحتوى الملف (محاضرة / سكشن), رابط درايف (Drive Link)]
final_rows = [
    ["اسم المادة (Subject)", "نوع ومحتوى الملف (محاضرة / سكشن)", "رابط درايف (Drive Link)"]
]

divider_row_indices = []
SLOTS_PER_SUBJECT = 12

for s in subjects:
    sub_id = s["id"]
    sub_name = s["name"]
    folder_url = s["folder_url"]
    existing = materials_by_sub[sub_id]

    # Section divider row
    divider_index = len(final_rows)
    divider_row_indices.append(divider_index)
    final_rows.append([f"📁 {sub_name}", "مجلد المادة الشامل على جوجل درايف", folder_url])

    # 12 slots under each subject
    for slot_idx in range(1, SLOTS_PER_SUBJECT + 1):
        if slot_idx <= len(existing):
            cat, title, url = existing[slot_idx - 1]
            cat_ar = "محاضرة" if cat == "LECTURE" else ("سكشن" if cat == "SECTION" else ("أسئلة" if cat == "QUESTIONS" else "ملف إضافي"))
            content_label = f"{cat_ar}: {title}"
            final_rows.append([sub_name, content_label, url])
        else:
            # Empty placeholder slot ready for the admin
            final_rows.append([sub_name, "", ""])

print(f"Total structured rows prepared: {len(final_rows)}", flush=True)

# 1. Clear old Materials tab
clear_url = f"https://sheets.googleapis.com/v4/spreadsheets/{SPREADSHEET_ID}/values/Materials!A1:Z500:clear"
api_request(clear_url, method="POST", data={})
print("Cleared old Materials tab in Google Sheets.", flush=True)

# 2. Write new rows
put_url = f"https://sheets.googleapis.com/v4/spreadsheets/{SPREADSHEET_ID}/values/Materials!A1?valueInputOption=USER_ENTERED"
val_data = {
    "range": "Materials!A1",
    "majorDimension": "ROWS",
    "values": final_rows
}
api_request(put_url, method="PUT", data=val_data)
print(f"Materials tab populated with {len(final_rows)} rows!", flush=True)

# 3. Update local seed/materials.csv
with open(r"d:\task\seed\materials.csv", "w", encoding="utf-8", newline="") as f:
    writer = csv.writer(f)
    for r in final_rows:
        writer.writerow(r)
print("Updated local seed/materials.csv.", flush=True)

# 4. Format Materials sheet
meta = api_request(f"https://sheets.googleapis.com/v4/spreadsheets/{SPREADSHEET_ID}")
mat_sheet_id = next(s["properties"]["sheetId"] for s in meta["sheets"] if s["properties"]["title"] == "Materials")

format_requests = [
    # Freeze row 1
    {
        "updateSheetProperties": {
            "properties": {
                "sheetId": mat_sheet_id,
                "gridProperties": {
                    "frozenRowCount": 1
                }
            },
            "fields": "gridProperties.frozenRowCount"
        }
    },
    # Main Header (Row 1): Dark Emerald
    {
        "repeatCell": {
            "range": {
                "sheetId": mat_sheet_id,
                "startRowIndex": 0,
                "endRowIndex": 1,
                "startColumnIndex": 0,
                "endColumnIndex": 3
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
    # Column widths
    {
        "updateDimensionProperties": {
            "range": {
                "sheetId": mat_sheet_id,
                "dimension": "COLUMNS",
                "startIndex": 0,
                "endIndex": 1
            },
            "properties": {"pixelSize": 330},
            "fields": "pixelSize"
        }
    },
    {
        "updateDimensionProperties": {
            "range": {
                "sheetId": mat_sheet_id,
                "dimension": "COLUMNS",
                "startIndex": 1,
                "endIndex": 2
            },
            "properties": {"pixelSize": 420},
            "fields": "pixelSize"
        }
    },
    {
        "updateDimensionProperties": {
            "range": {
                "sheetId": mat_sheet_id,
                "dimension": "COLUMNS",
                "startIndex": 2,
                "endIndex": 3
            },
            "properties": {"pixelSize": 480},
            "fields": "pixelSize"
        }
    }
]

# Add styling for each subject divider row (Rich Green background, bold white text)
for div_idx in divider_row_indices:
    format_requests.append({
        "repeatCell": {
            "range": {
                "sheetId": mat_sheet_id,
                "startRowIndex": div_idx,
                "endRowIndex": div_idx + 1,
                "startColumnIndex": 0,
                "endColumnIndex": 3
            },
            "cell": {
                "userEnteredFormat": {
                    "backgroundColor": {"red": 0.12, "green": 0.55, "blue": 0.35},
                    "textFormat": {"bold": True, "foregroundColor": {"red": 1.0, "green": 1.0, "blue": 1.0}, "fontSize": 11}
                }
            },
            "fields": "userEnteredFormat(backgroundColor,textFormat)"
        }
    })

api_request(f"https://sheets.googleapis.com/v4/spreadsheets/{SPREADSHEET_ID}:batchUpdate", method="POST", data={"requests": format_requests})
print("Applied styling and 12-slot layout successfully!", flush=True)
