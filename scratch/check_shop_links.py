import re

with open('shop.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find all links in shop.html
links = re.findall(r'href=["\']([^"\']+)["\']', content)
print("Product links in shop.html:")
for link in links:
    if 'product' in link or 'shop.html' in link:
        print(link)
