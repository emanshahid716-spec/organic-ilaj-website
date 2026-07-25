import re

with open('live_site.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Stylesheets
stylesheets = re.findall(r'<link[^>]*rel=["\'][^"\']*stylesheet[^"\']*["\'][^>]*>', html, re.I)
print("Stylesheets found:")
for ss in stylesheets:
    print(ss)

# Let's search for color codes like #xxxxxx or rgb() in style tags or inline styles
# Let's look for css variables in the html or any style block
style_tags = re.findall(r'<style[^>]*>([\s\S]*?)</style>', html, re.I)
print(f"\nFound {len(style_tags)} <style> tags.")
for i, style in enumerate(style_tags):
    # Find variables like --xxx or color properties
    colors = re.findall(r'--[\w\-]+:\s*#[a-fA-F0-9]{3,8}|color:\s*#[a-fA-F0-9]{3,8}|background-color:\s*#[a-fA-F0-9]{3,8}', style)
    if colors:
        print(f"\nStyle tag {i} contains color codes:")
        print(colors[:20])
