import json
import re

with open('extracted_chat/parsed_messages.json', 'r', encoding='utf-8') as f:
    messages = json.load(f)

print(f"Loaded {len(messages)} messages.")

# Let's inspect messages that contain media logs or links
url_pattern = re.compile(r'https?://[^\s<>"]+|www\.[^\s<>"]+')

media_indicators = [
    'deathnote', 'attack on titans', 'doll', 'breaking bad', 'game of thrones',
    'started', 'start', 'completed', 'complete', 'ended', 'end', 'watching', 'watch',
    'season', 's0', 's1', 's2', 's3', 's4', 's5', 's6', 's7', 's8',
    'episode', 'ep', 'episodes', 'movie', 'series', 'anime', 'part', 'left',
    'film', 'show', 'watched'
]

media_messages = []
link_messages = []
other_messages = []

for idx, m in enumerate(messages):
    text = m['content'].strip()
    urls = url_pattern.findall(text)
    
    if urls:
        link_messages.append({
            'index': idx,
            'timestamp': m['timestamp'],
            'sender': m['sender'],
            'content': text,
            'urls': urls
        })
    
    text_lower = text.lower()
    # Check if this message is a media/watch log
    # Also check if lines look like title listings or watch status
    is_media = False
    for k in media_indicators:
        if k in text_lower:
            is_media = True
            break
            
    if is_media or 'season' in text_lower or 'episode' in text_lower or 's0' in text_lower or 'ep' in text_lower:
        media_messages.append({
            'index': idx,
            'timestamp': m['timestamp'],
            'sender': m['sender'],
            'content': text
        })

print(f"Messages with links: {len(link_messages)}")
print(f"Messages identified with media keywords: {len(media_messages)}")

# Let's save debug lists
with open('extracted_chat/media_candidates.json', 'w', encoding='utf-8') as f:
    json.dump(media_messages, f, indent=2, ensure_ascii=False)

with open('extracted_chat/link_candidates.json', 'w', encoding='utf-8') as f:
    json.dump(link_messages, f, indent=2, ensure_ascii=False)
