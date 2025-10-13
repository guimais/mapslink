from pathlib import Path
import re

for path in Path('assets/css').glob('*.css'):
    text = path.read_text(encoding='utf-8')
    def replacer(match):
        block = match.group(1)
        if 'text-shadow' not in block:
            block = block.rstrip() + '\n  text-shadow: 0 0 0.6px currentColor;\n'
        if 'font-weight' not in block:
            block = block.rstrip() + '\n  font-weight: 700;\n'
        else:
            block = re.sub(r'font-weight:\s*700', 'font-weight: 700', block)
        return '{' + block + '}'
    text = re.sub(r'\{([^{}]*?\.nav-link\.active[^{}]*?)\}', replacer, text)
    text = re.sub(r'(\.nav-link\.active\s*\{)([^}]*?)\}', lambda m: m.group(1) + ('' if 'font-weight' in m.group(2) else '  font-weight: 700;\n') + ('' if 'text-shadow' in m.group(2) else '  text-shadow: 0 0 0.6px currentColor;\n') + m.group(2).rstrip() + '\n}', text)
    path.write_text(text, encoding='utf-8')
