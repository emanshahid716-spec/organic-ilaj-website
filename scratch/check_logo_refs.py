import os
import re

html_files = [f for f in os.listdir('.') if f.endswith('.html')]

for hf in html_files:
    with open(hf, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check favicon
    fav = re.search(r'href=["\']([^"\']*(?:favicon)[^"\']*)["\']', content, re.I)
    # Check logo
    logo = re.findall(r'src=["\']([^"\']*(?:logo)[^"\']*)["\']', content, re.I)
    
    print(f"{hf}:")
    print(f"  Favicon ref: {fav.group(1) if fav else 'Not found'}")
    print(f"  Logo refs: {logo}")
