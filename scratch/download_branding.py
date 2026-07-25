import urllib.request
import os

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

assets = {
    'images/logo.png': 'https://www.organicilaj.com/cdn/shop/files/organic_ilaj_icon_abb5aff4-fbe0-4f3e-9993-94bbce6c2816.png',
    'images/favicon.png': 'https://www.organicilaj.com/cdn/shop/files/Gemini_Generated_Image_v4y0v1v4y0v1v4y0-removebg-preview_1.png'
}

for local_path, url in assets.items():
    print(f"Downloading {url} to {local_path}...")
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as response:
            with open(local_path, 'wb') as f:
                f.write(response.read())
        print("Success!")
    except Exception as e:
        print(f"Error downloading {url}: {e}")
