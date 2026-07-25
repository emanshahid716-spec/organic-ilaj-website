import re

with open('live_site.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Look for favicon
favicon_links = re.findall(r'<link[^>]*rel=["\'][^"\']*icon[^"\']*["\'][^>]*>', html, re.I)
print("Favicon links found:")
for link in favicon_links:
    print(link)

# Look for logo image or text in header
logo_imgs = []
header_section = ""
# Let's find the header tag or logo-related structures
header_match = re.search(r'<header[^>]*>([\s\S]*?)</header>', html, re.I)
if header_match:
    header_section = header_match.group(1)
    # Search for all image tags in header
    logo_imgs = re.findall(r'<img[^>]*>', header_section, re.I)

print("\nImages in <header>:")
for img in logo_imgs:
    print(img)

# Let's search for "logo" class or ID
logo_matches = re.findall(r'<[^>]*class=["\'][^"\']*logo[^"\']*["\'][^>]*>([\s\S]*?)<\/[^>]+>', html, re.I)
print(f"\nFound {len(logo_matches)} logo class elements.")

# Look for the hero section banner/image in the live HTML
hero_imgs = re.findall(r'<div[^>]*class=["\'][^"\']*hero[^"\']*["\'][^>]*>([\s\S]*?)<\/div>', html, re.I)
print(f"\nFound {len(hero_imgs)} elements with hero class.")
