with open('js/script.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Look for slug, url parameter parsing, product details population
lines = js.split('\n')
for idx, line in enumerate(lines):
    if any(k in line.lower() for k in ['slug', 'urlsearchparams', 'getproductbyslug', 'product.html']):
        print(f"L{idx+1}: {line.strip()}")
