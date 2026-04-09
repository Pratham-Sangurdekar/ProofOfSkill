import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix grid columns in .header
content = re.sub(r'grid-template-columns:\s*240px\s+1fr\s+auto\s+240px\s+60px\s*;', 'grid-template-columns: 240px 1fr auto 280px;', content)
content = re.sub(r'grid-template-columns:\s*240px\s+1fr\s+auto\s+240px\s*;', 'grid-template-columns: 240px 1fr auto 280px;', content)

# Fix .wallet-info CSS
content = content.replace('flex-direction: column;', 'flex-direction: row; align-items: center; justify-content: space-between;')
# wait, there's another CSS flex-direction: column? The container has it. I shouldn't blindly replace it.

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
