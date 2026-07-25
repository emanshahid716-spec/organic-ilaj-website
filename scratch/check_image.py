from PIL import Image
import os

images_to_check = [
    'images/about-hero-products.webp',
    'images/about-products-showcase.webp',
    'images/hero_collage.webp',
    'images/real-products/camstrich-camel-ostrich-oil.png',
    'images/real-products/stomach-coolant-real.png'
]

for img_path in images_to_check:
    if os.path.exists(img_path):
        try:
            img = Image.open(img_path)
            print(f"{img_path} size:", img.size)
            print(f"{img_path} format:", img.format)
        except Exception as e:
            print(f"Error checking {img_path}: {e}")
    else:
        print(f"File {img_path} does not exist.")
