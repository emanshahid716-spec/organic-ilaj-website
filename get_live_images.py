import urllib.request
import re

url = 'https://www.organicilaj.com/'
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}
req = urllib.request.Request(url, headers=headers)
try:
    html = urllib.request.urlopen(req).read().decode('utf-8', errors='ignore')
    imgs = re.findall(r'<img[^>]*>', html)
    print('All images on live site:')
    for img in imgs:
        src_m = re.search(r'src=["\']([^"\']+)["\']', img)
        alt_m = re.search(r'alt=["\']([^"\']*)["\']', img)
        if src_m:
            print(f'Src: {src_m.group(1)} | Alt: {alt_m.group(1) if alt_m else ""}')
except Exception as e:
    print('Error:', e)
