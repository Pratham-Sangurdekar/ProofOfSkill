import re

def update_html(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Update CSS Grid to 4 main columns plus a potential gap, or specifically: `grid-template-columns: 240px 1fr auto 240px;`
    content = re.sub(r'grid-template-columns:\s*240px\s+1fr\s+auto\s+240px\s+60px\s*;', 'grid-template-columns: 240px 1fr auto 240px;', content)
    
    # 2. Remove the fox-icon completely
    fox_icon_regex = r'<div class="fox-icon">\s*<svg.*?</svg>\s*</div>'
    content = re.sub(fox_icon_regex, '', content, flags=re.DOTALL)
    
    # 3. Change .wallet-info CSS for the flex row setup so the text and Metamask SVG sit side-by-side
    content = content.replace('flex-direction: column;', 'flex-direction: row;\n        align-items: center;\n        justify-content: space-between;')
    
    # 4. Insert the precise SVG into the wallet-info element
    # The current connect button looks like: <div class="wallet-info" ... id="connectWalletButton" ...> <div class="status">...</div> <div class="meta"...>...</div> </div>
    svg = '''
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:28px; height:28px; flex-shrink:0;">
        <path d="M16 8L20 14L28 10L24 24H8L4 10L12 14L16 8Z" fill="#F6851B" stroke="#E2761B" stroke-width="1.5" stroke-linejoin="round"/>
        <path d="M12 14L16 20L20 14L16 8L12 14Z" fill="#E2761B"/>
        <path d="M8 24L12 14L16 20L8 24Z" fill="#E2761B"/>
        <path d="M24 24L20 14L16 20L24 24Z" fill="#E2761B"/>
      </svg>'''
    
    connect_btn_regex = r'(<div class="wallet-info"[^>]*id="connectWalletButton"[^>]*>)\s*(<div class="status">[\s\S]*?</div>)\s*(<div class="meta"[^>]*>[\s\S]*?</div>)\s*</div>'
    
    def repl(m):
        inner_div = '        <div style="display:flex; flex-direction:column; justify-content:center; align-items:flex-start;">\n          ' + m.group(2).strip() + '\n          ' + m.group(3).strip() + '\n        </div>'
        return m.group(1).strip() + '\n' + inner_div + '\n' + svg + '\n      </div>'
    
    content = re.sub(connect_btn_regex, repl, content)
    
    # 5. Let's fix the solidiy-track.html navbar color specifically to seamlessly match index.html
    # Some CSS engines override via internal layout. Let's hard-enforce the correct #A9A491 borders, the #F4F2EB background on components, and the glass header.
    if 'Solidity Track' in content:
        # Remove any existing injected fix styles to avoid duplicates
        content = re.sub(r'<!-- CUSTOM HEADER OVERRIDES -->.*<!-- /CUSTOM HEADER OVERRIDES -->', '', content, flags=re.DOTALL)
        
        extra_css = """
    <!-- CUSTOM HEADER OVERRIDES -->
    <style>
      #customNavHeader {
        background: rgba(244, 242, 235, 0.6) !important;
        border-bottom: 1px solid #A9A491 !important;
        border-top: 1px solid #A9A491 !important;
      }
      #customNavHeader .brand {
        background: #F4F2EB !important;
        color: #1A1A1A !important;
        border-right: 1px solid #A9A491 !important;
      }
      #customNavHeader .nav-item {
        color: #1A1A1A !important;
      }
      #customNavHeader .nav-item.active {
        background: #1A1A1A !important;
        color: #FFF !important;
      }
      #customNavHeader .wallet-info {
        background: #F4F2EB !important;
        color: #555 !important;
        border-left: 1px solid #A9A491 !important;
        border-right: 1px solid #A9A491 !important;
      }
      #customNavHeader .wallet-info .status {
        color: #1A1A1A !important;
      }
      #customNavHeader .rewards-info {
        background: #F4F2EB !important;
      }
      #customNavHeader .rewards-text .label {
        color: #555 !important;
      }
      #customNavHeader .rewards-text .value {
        color: #1A1A1A !important;
      }
      #customNavHeader .withdraw-btn {
        color: #555 !important;
        border: 1px solid #A9A491 !important;
      }
      #customNavHeader .withdraw-btn:hover {
        background: #1A1A1A !important;
        color: #FFF !important;
      }
    </style>
    <!-- /CUSTOM HEADER OVERRIDES -->
"""
        content = content.replace('</head>', extra_css + '</head>')
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

update_html('/Users/pratham/Documents/ProofOfSkill/index.html')
update_html('/Users/pratham/Documents/ProofOfSkill/solidity-track.html')
