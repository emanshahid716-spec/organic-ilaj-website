import os
import re

js_dir = 'js'
for f in os.listdir(js_dir):
    if f.endswith('.js'):
        path = os.path.join(js_dir, f)
        with open(path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        lines = content.split('\n')
        for idx, line in enumerate(lines):
            if 'location' in line.lower() or 'href' in line.lower():
                print(f"{f} L{idx+1}: {line.strip()}")
