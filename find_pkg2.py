import os

base_path = r"c:\Users\Lenovo\Documents\Vigil AI\frontend"
found_files = []

for root, dirs, files in os.walk(base_path):
    if "node_modules" in dirs:
        dirs.remove("node_modules")
    if "package.json" in files:
        found_files.append(os.path.join(root, "package.json"))
        
with open(r"c:\Users\Lenovo\Documents\Vigil AI\pkg.txt", "w", encoding="utf-8") as f:
    for file_path in found_files:
        f.write(file_path + "\n")
