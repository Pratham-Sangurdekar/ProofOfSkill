import re

with open('/Users/pratham/Documents/ProofOfSkill/solidity-track.html', 'r', encoding='utf-8') as f:
    text = f.read()

overrides = open('/tmp/index-overrides.html', 'r').read()

if '<!-- CUSTOM HEADER OVERRIDES -->' not in text:
    text = text.replace('</style>\n  </head>', '</style>\n' + overrides + '\n  </head>')
    with open('/Users/pratham/Documents/ProofOfSkill/solidity-track.html', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Overrides added")
else:
    print("Overrides already present")
