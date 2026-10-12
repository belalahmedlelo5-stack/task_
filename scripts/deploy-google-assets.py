import sys
import os
import json
import csv
import urllib.request
import urllib.parse
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase

if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

ROOT_FOLDER_ID = "1ti_-F5a4XXr5msYhVvN4zI5eFk2w0rio"
SPREADSHEET_ID = "1KSyoUw-je7A80IuSbM1ORSuMM2w1vaNvv6C29Q_W_vE"
FILES_DIR = r"d:\task\extracted_4th\4th"

token_path = r"C:\Users\IT\.gemini\antigravity\plugin_data\gsheets\token.json"
with open(token_path, "r", encoding="utf-8") as f:
    token_data = json.load(f)

access_token = token_data["token"]["access_token"]

def api_request(url, method="GET", data=None, content_type="application/json"):
    headers = {"Authorization": f"Bearer {access_token}"}
    if content_type:
        headers["Content-Type"] = content_type
    
    if data is not None and isinstance(data, (dict, list)):
        body = json.dumps(data).encode("utf-8")
    elif data is not None and isinstance(data, str):
        body = data.encode("utf-8")
    elif data is not None and isinstance(data, bytes):
        body = data
    else:
        body = None

    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))

print("=== Step 1: Getting or creating subject folders on Drive ===")
subject_folders = {
    "stem-cell-biology": "01 - Stem Cell Biology",
    "drug-monitoring": "02 - Drug Monitoring",
    "microbial-genetics": "03 - Microbial Genetics",
    "gene-therapy": "04 - Gene Therapy",
    "recombinant-dna-technology": "05 - Recombinant DNA Technology",
    "communication-cell-signaling": "06 - Communication and Cell Signaling",
    "industry-bacterial-biotechnology": "07 - Industry and Bacterial Biotechnology",
}

# List existing folders in root
q = f"'{ROOT_FOLDER_ID}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false"
search_url = f"https://www.googleapis.com/drive/v3/files?q={urllib.parse.quote(q)}"
existing_files = api_request(search_url).get("files", [])
existing_folder_map = {f["name"]: f["id"] for f in existing_files}

folder_ids = {}
for subj_id, folder_name in subject_folders.items():
    if folder_name in existing_folder_map:
        folder_ids[subj_id] = existing_folder_map[folder_name]
        print(f"Folder exists: {folder_name} -> {folder_ids[subj_id]}")
    else:
        create_data = {
            "name": folder_name,
            "mimeType": "application/vnd.google-apps.folder",
            "parents": [ROOT_FOLDER_ID],
        }
        res = api_request("https://www.googleapis.com/drive/v3/files", method="POST", data=create_data)
        folder_ids[subj_id] = res["id"]
        print(f"Created folder: {folder_name} -> {res['id']}")

print("\n=== Step 2: Uploading materials to Drive ===")
# Read seed/materials.csv
with open(r"d:\task\seed\materials.csv", "r", encoding="utf-8") as f:
    materials = list(csv.DictReader(f))

# Helper to upload file via multipart
def upload_file_to_drive(file_path, folder_id):
    filename = os.path.basename(file_path)
    
    # Guess mime
    mime_type = "application/pdf"
    if filename.endswith(".pptx"):
        mime_type = "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    elif filename.endswith(".docx"):
        mime_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

    metadata = {
        "name": filename,
        "parents": [folder_id],
    }

    with open(file_path, "rb") as f:
        file_bytes = f.read()

    boundary = "===============" + str(abs(hash(filename))) + "=="
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": f"multipart/related; boundary={boundary}",
    }

    body = (
        f"--{boundary}\r\n"
        f"Content-Type: application/json; charset=UTF-8\r\n\r\n"
        f"{json.dumps(metadata)}\r\n"
        f"--{boundary}\r\n"
        f"Content-Type: {mime_type}\r\n\r\n"
    ).encode("utf-8") + file_bytes + f"\r\n--{boundary}--\r\n".encode("utf-8")

    upload_url = "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink"
    req = urllib.request.Request(upload_url, data=body, headers=headers, method="POST")
    with urllib.request.urlopen(req) as resp:
        result = json.loads(resp.read().decode("utf-8"))

    # Set permission to anyone with link reader
    perm_url = f"https://www.googleapis.com/drive/v3/files/{result['id']}/permissions"
    perm_data = {"role": "reader", "type": "anyone"}
    api_request(perm_url, method="POST", data=perm_data)

    return result["id"], result.get("webViewLink", f"https://drive.google.com/file/d/{result['id']}/view")

uploaded_count = 0
for m in materials:
    filename = m["original_filename"]
    subj = m["subject_id"]
    if m["status"] == "ARCHIVED" or not subj:
        continue # Skip excluded commercial quote
    
    file_path = os.path.join(FILES_DIR, filename)
    if not os.path.exists(file_path):
        print(f"Warning: File not found locally: {filename}")
        continue

    folder_id = folder_ids.get(subj, ROOT_FOLDER_ID)
    try:
        f_id, f_url = upload_file_to_drive(file_path, folder_id)
        m["drive_url"] = f_url
        m["status"] = "PUBLISHED"
        uploaded_count += 1
        print(f"[{uploaded_count}/30] Uploaded: {filename} -> {f_url}")
    except Exception as e:
        print(f"Error uploading {filename}: {e}")

# Save updated materials back to seed/materials.csv
fieldnames = list(materials[0].keys())
with open(r"d:\task\seed\materials.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(materials)

print(f"\nSuccessfully uploaded {uploaded_count} files to Google Drive and updated seed/materials.csv!")

print("\n=== Step 3: Setting up Sheets Tabs and Data ===")
sheet_meta_url = f"https://sheets.googleapis.com/v4/spreadsheets/{SPREADSHEET_ID}"
meta = api_request(sheet_meta_url)
existing_sheets = {s["properties"]["title"]: s["properties"]["sheetId"] for s in meta.get("sheets", [])}

target_tabs = ["Subjects", "Materials", "Tasks", "Sessions"]
requests = []

# Add missing tabs
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
    batch_url = f"https://sheets.googleapis.com/v4/spreadsheets/{SPREADSHEET_ID}:batchUpdate"
    api_request(batch_url, method="POST", data={"requests": requests})
    print("Added tabs to spreadsheet.")
    # Re-fetch meta
    meta = api_request(sheet_meta_url)
    existing_sheets = {s["properties"]["title"]: s["properties"]["sheetId"] for s in meta.get("sheets", [])}

# Delete default sheet if exists
for old_name, old_id in existing_sheets.items():
    if old_name not in target_tabs:
        try:
            del_req = {"requests": [{"deleteSheet": {"sheetId": old_id}}]}
            api_request(f"https://sheets.googleapis.com/v4/spreadsheets/{SPREADSHEET_ID}:batchUpdate", method="POST", data=del_req)
            print(f"Removed default sheet: {old_name}")
        except Exception as e:
            print("Note removing default sheet:", e)

# Helper to write rows to a tab
def write_tab_data(tab_name, csv_path):
    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.reader(f)
        all_rows = list(reader)

    value_data = {
        "range": f"'{tab_name}'!A1",
        "majorDimension": "ROWS",
        "values": all_rows,
    }

    url = f"https://sheets.googleapis.com/v4/spreadsheets/{SPREADSHEET_ID}/values/'{urllib.parse.quote(tab_name)}'!A1?valueInputOption=USER_ENTERED"
    res = api_request(url, method="PUT", data=value_data)
    print(f"Populated tab '{tab_name}': {len(all_rows)} rows written.")

write_tab_data("Subjects", r"d:\task\seed\subjects.csv")
write_tab_data("Materials", r"d:\task\seed\materials.csv")
write_tab_data("Sessions", r"d:\task\seed\sessions.csv")
write_tab_data("Tasks", r"d:\task\seed\tasks.csv")

print("\n=== Deployment of Google Drive & Google Sheets Completed Successfully! ===")
print(f"Root Drive Folder: https://drive.google.com/drive/folders/{ROOT_FOLDER_ID}")
print(f"Google Sheet: https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit")
