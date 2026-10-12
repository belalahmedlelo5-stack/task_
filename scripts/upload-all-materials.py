import os
import sys
import csv
import subprocess
import re
import json

if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

ROOT_FOLDER_ID = "1ti_-F5a4XXr5msYhVvN4zI5eFk2w0rio"
SPREADSHEET_ID = "1KSyoUw-je7A80IuSbM1ORSuMM2w1vaNvv6C29Q_W_vE"
FILES_DIR = r"d:\task\extracted_4th\4th"

folder_ids = {
    "stem-cell-biology": "17LwiR5Hcn0LNt0z6sr3I4ESx_lMPUGnI",
    "drug-monitoring": "1SbY-DIrXVeSmGnGchRjzWFpOOK4CkFiW",
    "microbial-genetics": "1BNEc8nuLpXa9iJWj5N_HAaikdkGmKihN",
    "gene-therapy": "1KKNHzeCcmiQANc5JyHGNwCsBK_6By9-5",
    "recombinant-dna-technology": "1VWoitSqks-N0K4mSGptclUtxizj0eERV",
    "communication-cell-signaling": "1JcSFtPCTUqUigGPvZmy8rN59B7eUW1-c",
    "industry-bacterial-biotechnology": "1CHQ9ursSxe3UBq6MLpEMm0tV42KbfJHx",
}

with open(r"d:\task\seed\materials.csv", "r", encoding="utf-8") as f:
    materials = list(csv.DictReader(f))

uploaded = 0
for idx, m in enumerate(materials):
    filename = m["original_filename"]
    subj = m["subject_id"]
    if m["status"] == "ARCHIVED" or not subj:
        continue # Skip excluded quotation or unassigned files
    
    file_path = os.path.join(FILES_DIR, filename)
    if not os.path.exists(file_path):
        print(f"Skipping missing file: {filename}")
        continue

    parent_id = folder_ids.get(subj, ROOT_FOLDER_ID)
    print(f"[{idx+1}/{len(materials)}] Uploading {filename} to {subj}...")
    
    cmd = f'gdrive mutate upload "{file_path}" --parent {parent_id}'
    res = subprocess.run(cmd, shell=True, capture_output=True, text=True, encoding="utf-8")
    output = res.stdout + res.stderr
    
    match = re.search(r"\(ID:\s*([a-zA-Z0-9_-]+)\)", output)
    if match:
        file_id = match.group(1)
        # Share file
        share_cmd = f'gdrive mutate share {file_id} --type anyone --role reader'
        subprocess.run(share_cmd, shell=True, capture_output=True, text=True, encoding="utf-8")
        
        m["drive_url"] = f"https://drive.google.com/file/d/{file_id}/view"
        m["status"] = "PUBLISHED"
        uploaded += 1
        print(f"  -> Success: {file_id} -> {m['drive_url']}", flush=True)
    else:
        print(f"  -> Upload failed: {output}", flush=True)

# Write back to seed/materials.csv
fieldnames = list(materials[0].keys())
with open(r"d:\task\seed\materials.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(materials)

print(f"\nSuccessfully uploaded and linked {uploaded} files!")
