import json
import re

with open('extracted_chat/parsed_messages.json', 'r', encoding='utf-8') as f:
    messages = json.load(f)

# Find all URLs and domain types
url_regex = re.compile(r'((?:https?://|www\.|t\.me/)[^\s<>"\']+)')

categorized_links = {
    'mega': [],
    'google_drive': [],
    'loom_videos': [],
    'telegram': [],
    'reddit': [],
    'ecommerce_shopping': [],
    'tech_career_learning': [],
    'dev_localhost_ngrok': [],
    'tools_reference': [],
    'social_other': []
}

total_links_found = 0

for idx, m in enumerate(messages):
    content = m['content'].strip()
    urls = url_regex.findall(content)
    
    # Also find telegram shorthand like t.me/...
    tme_matches = re.findall(r'(t\.me/[a-zA-Z0-9_]+)', content)
    for t in tme_matches:
        full_t = 'https://' + t if not t.startswith('http') else t
        if full_t not in urls and t not in urls:
            urls.append(full_t)
            
    if not urls:
        continue
        
    for raw_url in urls:
        total_links_found += 1
        url = raw_url.strip('.,;()[]')
        url_lower = url.lower()
        
        # Clean up context/label
        lines_without_url = [l.strip() for l in content.splitlines() if url not in l and l.strip()]
        if 'loom.com/share/ca2e1c85' in url:
            context_hint = "Loom: Team Member Invitation Flow & Email Verification Button"
        elif 'loom.com/share/0afdc243' in url:
            context_hint = "Loom: Form Builder & Preline Templates Component Refactor"
        elif 'reddit.com/r/developersPak' in url:
            context_hint = "Reddit (r/developersPak): Developer project thoughts discussion"
        elif 'reddit.com/r/LahoreSocial' in url:
            context_hint = "Reddit (r/LahoreSocial): Community discussion"
        elif 'reddit.com/r/GenZpk' in url:
            context_hint = "Reddit (r/GenZpk): Favourite Quotes Discussion"
        elif 'reddit.com/r/SizeGameC' in url:
            context_hint = "Reddit (r/SizeGameC): Community post"
        elif 'daraz.pk/products/1400-i907238885' in url:
            context_hint = "Daraz PK: Product Listing"
        elif 'daraz.pk/products/1-i895958906' in url or 'daraz.pk/products/12-5-i369767484' in url:
            context_hint = "Daraz PK: Product Item"
        elif 'olee.pk' in url:
            context_hint = "Olee PK: Terry Clogs Shoes"
        elif 'junaidjamshed.com' in url:
            context_hint = "Junaid Jamshed (J.): Army Green Blended Jubba"
        elif 'hnhdesigners.com' in url:
            context_hint = "HNH Designers: Chain Tassel Tasbih Collection"
        elif 'garderobe.pk' in url:
            context_hint = "Garderobe PK: Clothing Store"
        elif 'shinyholly.com' in url:
            context_hint = "Shiny Holly: Store"
        elif 'relocateme.substack.com' in url:
            context_hint = "RelocateMe: Weekly Hand-Curated Tech Jobs Newsletter"
        elif 'datasciencedojo.com' in url:
            context_hint = "Data Science Dojo: Agentic AI Conference 2026"
        elif 'discord.gg' in url:
            context_hint = "Discord Server Invite"
        elif 'shelf-by-hzk-frontend' in url:
            context_hint = "Shelf by HZK: Vercel Frontend Deployment"
        elif 'unglib-penalizable-mathilde.ngrok-free.dev' in url:
            context_hint = "Ngrok Tunnel URL (Dev Server)"
        elif '192.168.10.37:5173' in url:
            context_hint = "Local Vite Dev Frontend Auth Login"
        elif '192.168.10.37:3000' in url:
            context_hint = "Local Dashboard Web Server"
        elif 'imdb.com/title/tt1798709' in url:
            context_hint = "IMDb: Contagion (2011) Movie Page"
        elif 'simownerdetail.app' in url:
            context_hint = "SIM Owner Detail Verification Utility"
        elif 'fs.blog/blank-sheet-method' in url:
            context_hint = "Farnam Street (FS Blog): The Blank Sheet Method for Reading"
        elif 'readings.com.pk' in url:
            context_hint = "Readings Pakistan: Book Page (#1405688)"
        elif 'framedsc.com' in url:
            context_hint = "Framed: Hall of Framed (Movie Guessing Game)"
        elif 'id.onfido.com' in url:
            context_hint = "Onfido Identity Verification Portal"
        elif 'quora.com' in url:
            context_hint = "Quora Email Digest"
        elif 'vt.tiktok.com' in url:
            context_hint = "TikTok Video Link"
        elif 'facebook.com/share/v/' in url:
            context_hint = "Facebook Video Share"
        elif lines_without_url:
            first_line = lines_without_url[0]
            context_hint = first_line[:80] + ('...' if len(first_line) > 80 else '')
        else:
            context_hint = "Direct Link"
        
        entry = {
            "msg_num": idx + 1,
            "timestamp": m['timestamp'],
            "url": url,
            "context": context_hint,
            "raw_msg": content
        }
        
        if 'mega.nz' in url_lower:
            categorized_links['mega'].append(entry)
        elif 'drive.google.com' in url_lower:
            categorized_links['google_drive'].append(entry)
        elif 'loom.com' in url_lower:
            categorized_links['loom_videos'].append(entry)
        elif 't.me' in url_lower or 'telegram' in url_lower:
            categorized_links['telegram'].append(entry)
        elif 'reddit.com' in url_lower:
            categorized_links['reddit'].append(entry)
        elif any(d in url_lower for d in ['daraz.pk', 'olee.pk', 'junaidjamshed.com', 'hnhdesigners.com', 'garderobe.pk', 'shinyholly.com']):
            categorized_links['ecommerce_shopping'].append(entry)
        elif any(d in url_lower for d in ['codedistrict', 'relocateme.substack.com', 'datasciencedojo.com', 'discord.gg', 'quora.com']):
            categorized_links['tech_career_learning'].append(entry)
        elif any(d in url_lower for d in ['localhost', '192.168.', 'ngrok-free.dev', 'vercel.app']):
            categorized_links['dev_localhost_ngrok'].append(entry)
        elif any(d in url_lower for d in ['imdb.com', 'simownerdetail.app', 'fs.blog', 'readings.com.pk', 'id.onfido.com', 'link-target.net', 'link-hub.net', 'rapid-links.com', 'framedsc.com']):
            categorized_links['tools_reference'].append(entry)
        else:
            categorized_links['social_other'].append(entry)

print(f"Total links categorized: {total_links_found}")
for k, v in categorized_links.items():
    print(f"{k}: {len(v)} links")

# Write EXTRACTED_LINKS.md
with open('EXTRACTED_LINKS.md', 'w', encoding='utf-8') as f:
    f.write("# 🔗 Lore Archive — Extracted Links & Resources\n\n")
    f.write("> **Source**: WhatsApp Chat Export (+92 310 4515488)\n")
    f.write(f"> **Total Extracted Links**: {total_links_found}\n\n")
    
    f.write("## 📑 Quick Navigation\n\n")
    f.write("- [1. 📦 MEGA.nz Storage & Folder Links](#1--meganz-storage--folder-links) ({})\n".format(len(categorized_links['mega'])))
    f.write("- [2. ☁️ Google Drive Cloud Storage](#2-️-google-drive-cloud-storage) ({})\n".format(len(categorized_links['google_drive'])))
    f.write("- [3. 🎥 Loom Video Walkthroughs](#3--loom-video-walkthroughs) ({})\n".format(len(categorized_links['loom_videos'])))
    f.write("- [4. ✈️ Telegram Channels & Invite Links](#4-️-telegram-channels--invite-links) ({})\n".format(len(categorized_links['telegram'])))
    f.write("- [5. 💬 Reddit Community Threads & Discussions](#5--reddit-community-threads--discussions) ({})\n".format(len(categorized_links['reddit'])))
    f.write("- [6. 🛍️ E-Commerce & Product Shopping](#6-️-e-commerce--product-shopping) ({})\n".format(len(categorized_links['ecommerce_shopping'])))
    f.write("- [7. 💼 Tech, Career & Educational Platforms](#7--tech-career--educational-platforms) ({})\n".format(len(categorized_links['tech_career_learning'])))
    f.write("- [8. 💻 Development, Localhost & Ngrok Endpoints](#8--development-localhost--ngrok-endpoints) ({})\n".format(len(categorized_links['dev_localhost_ngrok'])))
    f.write("- [9. 🛠️ Tools, References & Movie/Book Catalog](#9-️-tools-references--moviebook-catalog) ({})\n".format(len(categorized_links['tools_reference'])))
    f.write("- [10. 🌐 Social Media & Other Links](#10--social-media--other-links) ({})\n\n".format(len(categorized_links['social_other'])))
    
    f.write("---\n\n")
    
    # 1. MEGA
    f.write("## 1. 📦 MEGA.nz Storage & Folder Links\n\n")
    f.write("| # | Timestamp | Folder / Content Label | MEGA URL |\n")
    f.write("|---|-----------|------------------------|----------|\n")
    for i, e in enumerate(categorized_links['mega'], 1):
        label = e['context'] if e['context'] != 'Direct Link' else 'Shared Folder'
        f.write(f"| {i} | `{e['timestamp']}` | **{label}** | [{e['url']}]({e['url']}) |\n")
    f.write("\n---\n\n")
    
    # 2. Google Drive
    f.write("## 2. ☁️ Google Drive Cloud Storage\n\n")
    f.write("| # | Timestamp | Description | URL |\n")
    f.write("|---|-----------|-------------|-----|\n")
    for i, e in enumerate(categorized_links['google_drive'], 1):
        f.write(f"| {i} | `{e['timestamp']}` | **{e['context']}** | [{e['url']}]({e['url']}) |\n")
    f.write("\n---\n\n")
    
    # 3. Loom
    f.write("## 3. 🎥 Loom Video Walkthroughs\n\n")
    f.write("| # | Timestamp | Topic / Feature Description | Loom Link |\n")
    f.write("|---|-----------|-----------------------------|-----------|\n")
    for i, e in enumerate(categorized_links['loom_videos'], 1):
        f.write(f"| {i} | `{e['timestamp']}` | **{e['context']}** | [{e['url']}]({e['url']}) |\n")
    f.write("\n---\n\n")
    
    # 4. Telegram
    f.write("## 4. ✈️ Telegram Channels & Invite Links\n\n")
    f.write("| # | Timestamp | Handle / Channel | URL |\n")
    f.write("|---|-----------|------------------|-----|\n")
    for i, e in enumerate(categorized_links['telegram'], 1):
        f.write(f"| {i} | `{e['timestamp']}` | **{e['context']}** | [{e['url']}]({e['url']}) |\n")
    f.write("\n---\n\n")
    
    # 5. Reddit
    f.write("## 5. 💬 Reddit Community Threads & Discussions\n\n")
    f.write("| # | Timestamp | Subreddit / Topic | Thread URL |\n")
    f.write("|---|-----------|-------------------|------------|\n")
    for i, e in enumerate(categorized_links['reddit'], 1):
        f.write(f"| {i} | `{e['timestamp']}` | **{e['context']}** | [{e['url']}]({e['url']}) |\n")
    f.write("\n---\n\n")
    
    # 6. E-Commerce
    f.write("## 6. 🛍️ E-Commerce & Product Shopping\n\n")
    f.write("| # | Timestamp | Store / Item | Link |\n")
    f.write("|---|-----------|--------------|------|\n")
    for i, e in enumerate(categorized_links['ecommerce_shopping'], 1):
        f.write(f"| {i} | `{e['timestamp']}` | **{e['context']}** | [{e['url']}]({e['url']}) |\n")
    f.write("\n---\n\n")
    
    # 7. Tech & Career
    f.write("## 7. 💼 Tech, Career & Educational Platforms\n\n")
    f.write("| # | Timestamp | Opportunity / Platform | URL |\n")
    f.write("|---|-----------|------------------------|-----|\n")
    for i, e in enumerate(categorized_links['tech_career_learning'], 1):
        f.write(f"| {i} | `{e['timestamp']}` | **{e['context']}** | [{e['url']}]({e['url']}) |\n")
    f.write("\n---\n\n")
    
    # 8. Dev & Localhost
    f.write("## 8. 💻 Development, Localhost & Ngrok Endpoints\n\n")
    f.write("| # | Timestamp | Endpoint Target | URL |\n")
    f.write("|---|-----------|-----------------|-----|\n")
    for i, e in enumerate(categorized_links['dev_localhost_ngrok'], 1):
        f.write(f"| {i} | `{e['timestamp']}` | **{e['context']}** | [{e['url']}]({e['url']}) |\n")
    f.write("\n---\n\n")
    
    # 9. Tools & References
    f.write("## 9. 🛠️ Tools, References & Movie/Book Catalog\n\n")
    f.write("| # | Timestamp | Tool / Catalog Reference | Link |\n")
    f.write("|---|-----------|--------------------------|------|\n")
    for i, e in enumerate(categorized_links['tools_reference'], 1):
        f.write(f"| {i} | `{e['timestamp']}` | **{e['context']}** | [{e['url']}]({e['url']}) |\n")
    f.write("\n---\n\n")
    
    # 10. Social / Other
    f.write("## 10. 🌐 Social Media & Other Links\n\n")
    f.write("| # | Timestamp | Platform / Media | Link |\n")
    f.write("|---|-----------|------------------|------|\n")
    for i, e in enumerate(categorized_links['social_other'], 1):
        f.write(f"| {i} | `{e['timestamp']}` | **{e['context']}** | [{e['url']}]({e['url']}) |\n")

print("Generated EXTRACTED_LINKS.md successfully.")
