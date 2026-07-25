import re

with open('live_site.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Search for links containing "about"
about_links = re.findall(r'href=["\']([^"\']*(?:about)[^"\']*)["\']', html, re.I)
print("About page links:")
for link in about_links:
    print(link)
