import re
with open('/Users/pratham/Documents/ProofOfSkill/solidity-track.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Fix grid template columns
text = re.sub(r'grid-template-columns:\s*240px 1fr auto 280px 60px;', 'grid-template-columns: 240px 1fr auto 280px;', text)

def repl(m):
    return m.group(0).replace('flex-direction: column;', 'flex-direction: row; align-items: center; gap: 16px;').replace('justify-content: center;', '')

text = re.sub(r'\.wallet-info\s*{[^}]*}', repl, text, flags=re.DOTALL)

with open('/Users/pratham/Documents/ProofOfSkill/solidity-track.html', 'w', encoding='utf-8') as f:
    f.write(text)

