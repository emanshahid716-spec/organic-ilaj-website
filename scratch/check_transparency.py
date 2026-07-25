from PIL import Image
import os

images = [
    'images/live_camstrich_oil.png',
    'images/live_blood_pressure.png',
    'images/live_height_weight_booster.png',
    'images/live_stomach_coolant.png',
    'images/live_weight_loss.png',
    'images/live_bio_lady_wellness.png',
    'images/live_bio_sugar_control.png'
]

for img_path in images:
    if os.path.exists(img_path):
        try:
            img = Image.open(img_path)
            print(f"{img_path}: Mode={img.mode}, Size={img.size}, HasAlpha={'A' in img.mode}")
        except Exception as e:
            print(f"Error checking {img_path}: {e}")
