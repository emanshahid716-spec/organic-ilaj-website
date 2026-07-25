import re

with open('live_site.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Find all image srcs
srcs = re.findall(r'<img[^>]*src=["\']([^"\']+)["\']', html, re.I)

# Clean up URLs (remove dimensions like ?width=xx)
unique_srcs = set()
for src in srcs:
    # Normalize double slashes
    if src.startswith('//'):
        src = 'https:' + src
    # Strip query params
    base_url = src.split('?')[0]
    unique_srcs.add((base_url, src))

print("Unique images on the live site:")
for base_url, full_url in sorted(list(unique_srcs)):
    print(f"Base: {base_url}")
    print(f"  Full: {full_url}")
