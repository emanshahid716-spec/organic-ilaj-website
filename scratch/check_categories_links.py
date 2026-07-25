import re

with open('categories.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find all links in categories.html
links = re.findall(r'href=["\']([^"\']+)["\']', content)
print("Links in categories.html:")
for link in links:
    if 'product' in link or 'shop.html' in link:
        print(link)
