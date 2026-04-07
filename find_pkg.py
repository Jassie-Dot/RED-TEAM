import os
import json

base_path = r"c:\Users\Lenovo\Documents\Vigil AI\frontend"
found_files = []

for root, dirs, files in os.walk(base_path):
    if "node_modules" in dirs:
        dirs.remove("node_modules")
    if "package.json" in files:
        found_files.append(os.path.join(root, "package.json"))

for file_path in found_files:
    print(f"File: {file_path}")
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
            print(f"Content length: {len(content)}")
    except Exception as e:
        print(f"Error reading: {e}")
