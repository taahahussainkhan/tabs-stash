import zipfile
import os

zip_path = "WhatsApp Chat with +92 310 4515488.zip"
extract_dir = "extracted_chat"

os.makedirs(extract_dir, exist_ok=True)
with zipfile.ZipFile(zip_path, 'r') as zip_ref:
    zip_ref.extractall(extract_dir)

files = os.listdir(extract_dir)
print(f"Extracted {len(files)} files: {files}")
for f in files:
    full_path = os.path.join(extract_dir, f)
    print(f"File: {f}, Size: {os.path.getsize(full_path)} bytes")
