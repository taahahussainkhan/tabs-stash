import re
import json
import urllib.parse
from datetime import datetime

chat_file = "extracted_chat/WhatsApp Chat with +92 310 4515488.txt"

with open(chat_file, 'r', encoding='utf-8') as f:
    raw = f.read()

# Normalize non-standard spaces
raw = raw.replace('\u202f', ' ').replace('\xa0', ' ').replace('\u200e', '')

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
            'sender': sender.strip(),
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

# Save parsed messages as JSON for easy analysis
with open('extracted_chat/parsed_messages.json', 'w', encoding='utf-8') as f:
    json.dump(messages, f, indent=2, ensure_ascii=False)

print(f"Total messages parsed: {len(messages)}")
