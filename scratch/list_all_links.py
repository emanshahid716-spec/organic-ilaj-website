import re

with open('live_site.html', 'r', encoding='utf-8') as f:
    html = f.read()

links = re.findall(r'href=["\']([^"\']+)["\']', html, re.I)
print("All links on the live site:")
for link in sorted(list(set(links))):
    print(link)
