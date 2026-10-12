import sys
import os
import json
import urllib.request
import urllib.parse
from collections import defaultdict

if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

token_path = r"C:\Users\IT\.gemini\antigravity\plugin_data\gsheets\token.json"
with open(token_path, "r", encoding="utf-8") as f:
    token_data = json.load(f)

# Auto refresh token
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

print("=== Scanning Google Drive for Duplicate Files ===", flush=True)

# 1. Get all file IDs referenced in Materials tab of Google Sheet
url = f"https://sheets.googleapis.com/v4/spreadsheets/{SPREADSHEET_ID}/values/Materials!B1:B100"
sheet_data = api_request(url)
sheet_file_ids = set()
for r in sheet_data.get("values", [])[1:]:
    if r and r[0]:
        u = r[0]
        if "/d/" in u:
            fid = u.split("/d/")[1].split("/")[0]
            sheet_file_ids.add(fid)

print(f"File IDs linked in Google Sheet: {len(sheet_file_ids)}", flush=True)

# 2. Get all files in project folders
ROOT_FOLDER_ID = "1ti_-F5a4XXr5msYhVvN4zI5eFk2w0rio"
SUBJECT_FOLDER_IDS = {
    "17LwiR5Hcn0LNt0z6sr3I4ESx_lMPUGnI",
    "1SbY-DIrXVeSmGnGchRjzWFpOOK4CkFiW",
    "1BNEc8nuLpXa9iJWj5N_HAaikdkGmKihN",
    "1KKNHzeCcmiQANc5JyHGNwCsBK_6By9-5",
    "1VWoitSqks-N0K4mSGptclUtxizj0eERV",
    "1JcSFtPCTUqUigGPvZmy8rN59B7eUW1-c",
    "1CHQ9ursSxe3UBq6MLpEMm0tV42KbfJHx"
}
ALL_OUR_FOLDERS = SUBJECT_FOLDER_IDS | {ROOT_FOLDER_ID}

url = "https://www.googleapis.com/drive/v3/files?pageSize=1000&fields=files(id,name,mimeType,size,md5Checksum,parents,createdTime)&q=trashed=false"
all_files = api_request(url).get("files", [])

our_files = [f for f in all_files if f.get("parents") and any(p in ALL_OUR_FOLDERS for p in f.get("parents"))]
print(f"Total files in our project folders: {len(our_files)}", flush=True)

by_name = defaultdict(list)
for f in our_files:
    if f.get("mimeType") == "application/vnd.google-apps.folder":
        continue
    by_name[f["name"]].append(f)

to_delete = []
to_keep = []

for name, flist in by_name.items():
    if len(flist) > 1:
        in_sheet = [f for f in flist if f["id"] in sheet_file_ids]
        not_in_sheet = [f for f in flist if f["id"] not in sheet_file_ids]
        
        if len(in_sheet) == 1:
            keep = in_sheet[0]
            remove = not_in_sheet
        else:
            flist.sort(key=lambda x: x.get("createdTime", ""), reverse=True)
            keep = flist[0]
            remove = flist[1:]
            
        to_keep.append((name, keep))
        for r in remove:
            to_delete.append((name, r))

print(f"Unique files with duplicate copies: {len(to_keep)}", flush=True)
print(f"Duplicate copies to delete: {len(to_delete)}", flush=True)

deleted_count = 0
for name, item in to_delete:
    fid = item["id"]
    try:
        del_url = f"https://www.googleapis.com/drive/v3/files/{fid}"
        api_request(del_url, method="PATCH", data={"trashed": True})
        deleted_count += 1
        print(f"[{deleted_count}/{len(to_delete)}] Trashed duplicate: {name} (ID: {fid})", flush=True)
    except Exception as e:
        print(f"Error trashing {name} ({fid}): {e}", flush=True)

print(f"\nSuccessfully cleaned up {deleted_count} duplicate files from Google Drive!", flush=True)
