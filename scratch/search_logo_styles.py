import re

with open('live_site.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Find any image with logo in alt or class or src
matches = re.findall(r'<img[^>]*>', html, re.I)
print("All images with logo, brand, icon or favicon in their attributes:")
for img in matches:
    if any(k in img.lower() for k in ['logo', 'brand', 'icon', 'favicon', 'logo-colore', 'colore']):
        print(img)

# Search for any CSS styles or colors related to logo
style_matches = re.findall(r'<style>[\s\S]*?<\/style>', html, re.I)
for style in style_matches:
    if 'logo' in style.lower():
        print("\nFound style containing 'logo':")
        print(style[:200] + "...")
