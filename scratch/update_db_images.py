import re

db_path = 'js/products-data.js'
with open(db_path, 'r', encoding='utf-8') as f:
    code = f.read()

# Define the replacement map based on filenames in the Shopify CDN URLs
replacements = {
    r'https://www\.organicilaj\.com/cdn/shop/files/boxfrontnaaf\.png\?width=900': 'images/live_bio_lady_wellness.png',
    r'https://www\.organicilaj\.com/cdn/shop/files/boxfrontside\.png\?width=900': 'images/live_bio_lady_wellness.png',
    r'https://www\.organicilaj\.com/cdn/shop/files/front_bio_sugar_control_for_website_copy\.png\?width=900': 'images/live_bio_sugar_control.png',
    r'https://www\.organicilaj\.com/cdn/shop/files/side_bio_sugar_control_for_website_copy\.png\?width=900': 'images/live_bio_sugar_control.png',
    r'https://www\.organicilaj\.com/cdn/shop/files/000001\.png\?width=900': 'images/live_blood_pressure.png',
    r'https://www\.organicilaj\.com/cdn/shop/files/0002\.png\?width=900': 'images/live_blood_pressure.png',
    r'https://www\.organicilaj\.com/cdn/shop/files/frontkidshealthboostercreamfront\.png\?width=900': 'images/live_height_weight_booster.png',
    r'https://www\.organicilaj\.com/cdn/shop/files/frontkidshealthboostercreamback\.png\?width=900': 'images/live_height_weight_booster.png',
    r'https://www\.organicilaj\.com/cdn/shop/files/glassybottle100ml_fc992b75-d23f-49b1-b6e2-b787a08f5b57\.png\?width=900': 'images/live_camstrich_oil.png',
    r'https://www\.organicilaj\.com/cdn/shop/files/front_height_and_weight\.png\?width=900': 'images/live_height_weight_booster.png',
    r'https://www\.organicilaj\.com/cdn/shop/files/back_height_grow\.png\?width=900': 'images/live_height_weight_booster.png',
    r'https://www\.organicilaj\.com/cdn/shop/files/Stomachcoolant100g\.png\?width=900': 'images/live_stomach_coolant.png',
    r'https://www\.organicilaj\.com/cdn/shop/files/back_stomach_coolant\.png\?width=900': 'images/live_stomach_coolant.png',
    r'https://www\.organicilaj\.com/cdn/shop/files/plate_stomach_coolant\.png\?width=900': 'images/live_stomach_coolant.png',
    r'https://www\.organicilaj\.com/cdn/shop/files/weight_loss\.png\?width=900': 'images/live_weight_loss.png',
    r'https://www\.organicilaj\.com/cdn/shop/files/back_weight_loss_png\.png\?width=900': 'images/live_weight_loss.png',
    r'https://www\.organicilaj\.com/cdn/shop/files/plateweightloss01\.png\?width=900': 'images/live_weight_loss.png',
}

# Apply replacements
updated_code = code
for pattern, replacement in replacements.items():
    updated_code = re.sub(pattern, replacement, updated_code)

# Check if there are any remaining Shopify URLs in image or gallery fields
remaining = re.findall(r'https://www\.organicilaj\.com/cdn/shop/files/[^\s"\']+', updated_code)
if remaining:
    print("Warning: Remaining Shopify CDN links found:")
    for rem in set(remaining):
        print(rem)

# Write updated code back
with open(db_path, 'w', encoding='utf-8') as f:
    f.write(updated_code)
print("Updated js/products-data.js successfully!")
