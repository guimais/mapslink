from pathlib import Path
import re
pattern = re.compile(r'(\n\s*)\{\s*\n')
for path in Path('assets/css').glob('*.css'):
    text = path.read_text()
    if '{' in text:
        text = pattern.sub(lambda m: m.group(1)+'.nav-link{\n', text)
        path.write_text(text)
