import re
import json

chat_file = "extracted_chat/WhatsApp Chat with +92 310 4515488.txt"

with open(chat_file, 'r', encoding='utf-8') as f:
    raw = f.read()

# Normalize spaces
raw = raw.replace('\u202f', ' ').replace('\xa0', ' ').replace('\u200e', '')

# Pattern for message header: DD/MM/YYYY, H:MM am/pm - Sender:
# Note: sometimes sender might be missing for system messages, but here it's e.g.:
# 30/07/2025, 10:08 am - Messages to yourself...
# 25/07/2025, 11:18 am - Taaha: <Media omitted>
msg_pattern = re.compile(r'^(\d{1,2}/\d{1,2}/\d{2,4},\s+\d{1,2}:\d{2}\s+(?:am|pm|AM|PM))\s+-\s+(?:([^:]+):\s+)?(.*)$', re.MULTILINE)

# Split by lines and group multi-line messages
lines = raw.splitlines()
messages = []
current_msg = None

line_header_regex = re.compile(r'^(\d{1,2}/\d{1,2}/\d{2,4},\s+\d{1,2}:\d{2}\s+(?:am|pm|AM|PM))\s+-\s+(.*)$')

for line in lines:
    match = line_header_regex.match(line)
    if match:
        if current_msg:
            messages.append(current_msg)
        timestamp_str = match.group(1)
        rest = match.group(2)
        if ': ' in rest:
            sender, content = rest.split(': ', 1)
        else:
            sender = 'System'
            content = rest
        current_msg = {
            'timestamp': timestamp_str,
            'sender': sender,
            'content': content
        }
    else:
        if current_msg:
            current_msg['content'] += '\n' + line
        else:
            current_msg = {
                'timestamp': 'Unknown',
                'sender': 'Unknown',
                'content': line
            }

if current_msg:
    messages.append(current_msg)

print(f"Total parsed messages: {len(messages)}")

# Let's inspect some messages to see movie/series patterns and link patterns
url_regex = re.compile(r'https?://[^\s<>"]+|www\.[^\s<>"]+')

media_keywords = [
    'completed', 'started', 'start', 'end', 'ended', 'watching', 'watch',
    'episode', 'ep', 'season', 's0', 's1', 's2', 's3', 's4', 's5',
    'movie', 'series', 'anime', 'part', 'vol', 'chapter', 'left'
]

print("\n--- SAMPLE MESSAGES ---")
for i, m in enumerate(messages[:40]):
    print(f"[{i+1}] {m['timestamp']} | {m['sender']}: {m['content']}")

# Let's look for messages with media logs or links
print("\n--- MESSAGES WITH MEDIA / LOG KEYWORDS OR MULTI-LINES ---")
for i, m in enumerate(messages):
    c = m['content'].lower()
    if any(k in c for k in media_keywords) or len(m['content'].splitlines()) > 1:
        print(f"[{i+1}] {m['timestamp']} | {m['content']}")
