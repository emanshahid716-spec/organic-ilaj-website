with open('css/style.css', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print("About-related styles in css/style.css:")
in_block = False
bracket_count = 0
block_content = []

for idx, line in enumerate(lines):
    # Print lines that define about-related classes or properties
    if any(k in line.lower() for k in ['.about', 'about-hero', 'about-img']):
        in_block = True
        bracket_count = 0
        block_content = []
    
    if in_block:
        block_content.append(f"{idx+1}: {line.strip()}")
        bracket_count += line.count('{') - line.count('}')
        if bracket_count <= 0 and '}' in line:
            in_block = False
            for b_line in block_content:
                print(b_line)
            print("-" * 40)
