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

print("=== Updating Materials Sheet in Google Spreadsheet ===")

# Define the 7 Subjects and their dedicated Google Drive Folders
subject_folders = [
    {
        "name": "01 - Stem Cell Biology | بيولوجيا الخلايا الجذعية",
        "url": "https://drive.google.com/drive/folders/17LwiR5Hcn0LNt0z6sr3I4ESx_lMPUGnI",
        "title": "مجلد المادة الشامل (فولدر كل المحاضرات والسكاشن)",
        "category": "FOLDER",
        "code": "MBSCB403",
        "notes": "رابط فولدر درايف الرئيسي لرفع وتحميل كل ملفات المادة",
        "subject_id": "stem-cell-biology",
        "id": "mat-0001",
        "status": "PUBLISHED"
    },
    {
        "name": "02 - Drug Monitoring | مراقبة الدواء",
        "url": "https://drive.google.com/drive/folders/1SbY-DIrXVeSmGnGchRjzWFpOOK4CkFiW",
        "title": "مجلد المادة الشامل (فولدر كل المحاضرات والسكاشن)",
        "category": "FOLDER",
        "code": "EBDM151",
        "notes": "رابط فولدر درايف الرئيسي لرفع وتحميل كل ملفات المادة",
        "subject_id": "drug-monitoring",
        "id": "mat-0002",
        "status": "PUBLISHED"
    },
    {
        "name": "03 - Microbial Genetics | وراثة ميكروبية",
        "url": "https://drive.google.com/drive/folders/1BNEc8nuLpXa9iJWj5N_HAaikdkGmKihN",
        "title": "مجلد المادة الشامل (فولدر كل المحاضرات والسكاشن)",
        "category": "FOLDER",
        "code": "MBMG310",
        "notes": "رابط فولدر درايف الرئيسي لرفع وتحميل كل ملفات المادة",
        "subject_id": "microbial-genetics",
        "id": "mat-0003",
        "status": "PUBLISHED"
    },
    {
        "name": "04 - Gene Therapy | علاج جيني",
        "url": "https://drive.google.com/drive/folders/1KKNHzeCcmiQANc5JyHGNwCsBK_6By9-5",
        "title": "مجلد المادة الشامل (فولدر كل المحاضرات والسكاشن)",
        "category": "FOLDER",
        "code": "MBGT309",
        "notes": "رابط فولدر درايف الرئيسي لرفع وتحميل كل ملفات المادة",
        "subject_id": "gene-therapy",
        "id": "mat-0004",
        "status": "PUBLISHED"
    },
    {
        "name": "05 - Recombinant DNA Technology | تكنولوجيا الـ DNA معاد الاتحاد",
        "url": "https://drive.google.com/drive/folders/1VWoitSqks-N0K4mSGptclUtxizj0eERV",
        "title": "مجلد المادة الشامل (فولدر كل المحاضرات والسكاشن)",
        "category": "FOLDER",
        "code": "MBBMBR213",
        "notes": "رابط فولدر درايف الرئيسي لرفع وتحميل كل ملفات المادة",
        "subject_id": "recombinant-dna-technology",
        "id": "mat-0005",
        "status": "PUBLISHED"
    },
    {
        "name": "06 - Communication and Cell Signaling | الاتصال والإشارات الخلوية",
        "url": "https://drive.google.com/drive/folders/1JcSFtPCTUqUigGPvZmy8rN59B7eUW1-c",
        "title": "مجلد المادة الشامل (فولدر كل المحاضرات والسكاشن)",
        "category": "FOLDER",
        "code": "MBCCS410",
        "notes": "رابط فولدر درايف الرئيسي لرفع وتحميل كل ملفات المادة",
        "subject_id": "communication-cell-signaling",
        "id": "mat-0006",
        "status": "PUBLISHED"
    },
    {
        "name": "07 - Industry and Bacterial Biotechnology | التكنولوجيا الحيوية البكتيرية والصناعية",
        "url": "https://drive.google.com/drive/folders/1CHQ9ursSxe3UBq6MLpEMm0tV42KbfJHx",
        "title": "مجلد المادة الشامل (فولدر كل المحاضرات والسكاشن)",
        "category": "FOLDER",
        "code": "MBIBB313",
        "notes": "رابط فولدر درايف الرئيسي لرفع وتحميل كل ملفات المادة",
        "subject_id": "industry-bacterial-biotechnology",
        "id": "mat-0007",
        "status": "PUBLISHED"
    }
]

# Read individual materials from seed/materials.csv
subject_map = {
    "stem-cell-biology": ("01 - Stem Cell Biology | بيولوجيا الخلايا الجذعية", "MBSCB403"),
    "drug-monitoring": ("02 - Drug Monitoring | مراقبة الدواء", "EBDM151"),
    "microbial-genetics": ("03 - Microbial Genetics | وراثة ميكروبية", "MBMG310"),
    "gene-therapy": ("04 - Gene Therapy | علاج جيني", "MBGT309"),
    "recombinant-dna-technology": ("05 - Recombinant DNA Technology | تكنولوجيا الـ DNA معاد الاتحاد", "MBBMBR213"),
    "communication-cell-signaling": ("06 - Communication and Cell Signaling | الاتصال والإشارات الخلوية", "MBCCS410"),
    "industry-bacterial-biotechnology": ("07 - Industry and Bacterial Biotechnology | التكنولوجيا الحيوية البكتيرية والصناعية", "MBIBB313"),
}

individual_rows = []
counter = 8
with open(r"d:\task\seed\materials.csv", "r", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for r in reader:
        sub_id = r.get("subject_id", "")
        if sub_id not in subject_map:
            continue
        sub_name, sub_code = subject_map[sub_id]
        mat_id = f"mat-{str(counter).zfill(4)}"
        counter += 1
        individual_rows.append([
            sub_name,
            r.get("drive_url", ""),
            r.get("title", ""),
            r.get("category", "LECTURE"),
            sub_code,
            r.get("notes", ""),
            sub_id,
            mat_id,
            r.get("status", "PUBLISHED")
        ])

headers = [
    "subject_name",
    "drive_url",
    "title",
    "category",
    "course_code",
    "notes",
    "subject_id",
    "material_id",
    "status"
]

all_values = [headers]

# 1. First add the 7 Main Subject Folders
for sf in subject_folders:
    all_values.append([
        sf["name"],
        sf["url"],
        sf["title"],
        sf["category"],
        sf["code"],
        sf["notes"],
        sf["subject_id"],
        sf["id"],
        sf["status"]
    ])

# 2. Add individual lecture and section files
for row in individual_rows:
    all_values.append(row)

# Clear existing Materials tab
clear_url = f"https://sheets.googleapis.com/v4/spreadsheets/{SPREADSHEET_ID}/values/Materials!A1:Z500:clear"
api_request(clear_url, method="POST", data={})
print("Cleared old data from Materials tab.")

# Put new values
put_url = f"https://sheets.googleapis.com/v4/spreadsheets/{SPREADSHEET_ID}/values/Materials!A1?valueInputOption=USER_ENTERED"
val_data = {
    "range": "Materials!A1",
    "majorDimension": "ROWS",
    "values": all_values
}
api_request(put_url, method="PUT", data=val_data)
print(f"Materials tab updated with {len(all_values)} rows!")

# Also update local seed/materials.csv to match
with open(r"d:\task\seed\materials.csv", "w", encoding="utf-8", newline="") as f:
    writer = csv.writer(f)
    for row in all_values:
        writer.writerow(row)
print("Updated local seed/materials.csv.")

# Format the sheet (Header colors, bold, auto-column-width)
meta = api_request(f"https://sheets.googleapis.com/v4/spreadsheets/{SPREADSHEET_ID}")
mat_sheet_id = next(s["properties"]["sheetId"] for s in meta["sheets"] if s["properties"]["title"] == "Materials")

format_requests = [
    # 1. Format header row (Dark Emerald background, white bold text)
    {
        "repeatCell": {
            "range": {
                "sheetId": mat_sheet_id,
                "startRowIndex": 0,
                "endRowIndex": 1,
                "startColumnIndex": 0,
                "endColumnIndex": 9
            },
            "cell": {
                "userEnteredFormat": {
                    "backgroundColor": {"red": 0.05, "green": 0.45, "blue": 0.28},
                    "textFormat": {"bold": True, "foregroundColor": {"red": 1.0, "green": 1.0, "blue": 1.0}, "fontSize": 11},
                    "horizontalAlignment": "CENTER"
                }
            },
            "fields": "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)"
        }
    },
    # 2. Highlight the 7 Main Subject Folders rows (soft light green background, bold text)
    {
        "repeatCell": {
            "range": {
                "sheetId": mat_sheet_id,
                "startRowIndex": 1,
                "endRowIndex": 8,
                "startColumnIndex": 0,
                "endColumnIndex": 9
            },
            "cell": {
                "userEnteredFormat": {
                    "backgroundColor": {"red": 0.91, "green": 0.96, "blue": 0.92},
                    "textFormat": {"bold": True, "fontSize": 10}
                }
            },
            "fields": "userEnteredFormat(backgroundColor,textFormat)"
        }
    },
    # 3. Freeze Header Row
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
    # 4. Auto-resize columns
    {
        "autoResizeDimensions": {
            "dimensions": {
                "sheetId": mat_sheet_id,
                "dimension": "COLUMNS",
                "startIndex": 0,
                "endIndex": 9
            }
        }
    }
]

api_request(f"https://sheets.googleapis.com/v4/spreadsheets/{SPREADSHEET_ID}:batchUpdate", method="POST", data={"requests": format_requests})
print("Applied professional formatting to Materials sheet successfully!")
