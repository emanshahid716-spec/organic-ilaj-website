import re

with open('live_site.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Find anything related to slider, banner, hero, carousel, main banner
slides = re.findall(r'<div[^>]*class=["\'][^"\']*(?:slideshow|hero|banner|slider)[^"\']*["\'][^>]*>([\s\S]*?)<\/div>', html, re.I)
print(f"Found {len(slides)} slider/hero/banner containers.")

# Let's print out all image tags with their src inside these containers or generally on the top of the body
# Let's print the first 100 lines of the body tag
body_match = re.search(r'<body[^>]*>([\s\S]*?)<\/body>', html, re.I)
if body_match:
    body_content = body_match.group(1)
    imgs = re.findall(r'<img[^>]*>', body_content[:50000], re.I)
    print("\nImages in first 50,000 chars of body:")
    for img in imgs:
        print(img)
        
# Search specifically for banner images
banner_imgs = [img for img in re.findall(r'<img[^>]*>', html) if 'banner' in img.lower()]
print("\nBanner images found:")
for b_img in banner_imgs:
    print(b_img)
