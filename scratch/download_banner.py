import urllib.request

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

url = 'https://www.organicilaj.com/cdn/shop/files/website_new_bannar_01.jpg?v=1780377225'
local_path = 'images/hero_banner.jpg'

print(f"Downloading banner {url}...")
req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req) as response:
        with open(local_path, 'wb') as f:
            f.write(response.read())
    print("Success!")
except Exception as e:
    print(f"Error downloading: {e}")
