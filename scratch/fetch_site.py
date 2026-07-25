import urllib.request
import re

url = 'https://www.organicilaj.com/'
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
}
req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req) as response:
        html = response.read().decode('utf-8', errors='ignore')
        print(f"Status Code: {response.status}")
        print("HTML length:", len(html))
        
        # Save HTML for inspection
        with open('live_site.html', 'w', encoding='utf-8') as f:
            f.write(html)
            
        # Find images
        imgs = re.findall(r'<img[^>]*>', html)
        print('\nFound images:')
        for img in imgs[:30]:  # Limit output
            src_m = re.search(r'src=["\']([^"\']+)["\']', img)
            alt_m = re.search(r'alt=["\']([^"\']*)["\']', img)
            if src_m:
                print(f'Src: {src_m.group(1)} | Alt: {alt_m.group(1) if alt_m else ""}')
except Exception as e:
    print('Error:', e)
