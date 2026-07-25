import urllib.request
import os

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

products = {
    'images/live_bio_lady_wellness.png': 'https://www.organicilaj.com/cdn/shop/files/boxfrontnaaf.png',
    'images/live_bio_sugar_control.png': 'https://www.organicilaj.com/cdn/shop/files/front_bio_sugar_control_for_website_copy.png',
    'images/live_blood_pressure.png': 'https://www.organicilaj.com/cdn/shop/files/000001.png',
    'images/live_height_weight_booster.png': 'https://www.organicilaj.com/cdn/shop/files/front_height_and_weight.png',
    'images/live_stomach_coolant.png': 'https://www.organicilaj.com/cdn/shop/files/Stomachcoolant100g.png',
    'images/live_weight_loss.png': 'https://www.organicilaj.com/cdn/shop/files/weight_loss.png',
    'images/live_camstrich_oil.png': 'https://www.organicilaj.com/cdn/shop/files/glassybottle100ml_fc992b75-d23f-49b1-b6e2-b787a08f5b57.png'
}

for local_path, url in products.items():
    print(f"Downloading {url} to {local_path}...")
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as response:
            with open(local_path, 'wb') as f:
                f.write(response.read())
        print("Success!")
    except Exception as e:
        print(f"Error downloading {url}: {e}")
