import re
import json
import os

chat_file = "extracted_chat/WhatsApp Chat with +92 310 4515488.txt"

with open(chat_file, 'r', encoding='utf-8') as f:
    text = f.read()

# Normalize narrow no-break spaces and non-standard spaces
text = text.replace('\u202f', ' ').replace('\xa0', ' ').replace('\u200e', '')

# Typical WhatsApp regex:
# [DD/MM/YY, HH:MM:SS AM/PM] Sender: Message
# or DD/MM/YY, HH:MM - Sender: Message
# or M/D/YY, H:MM AM - Sender: Message
# Let's inspect raw lines to find exact regex

lines = text.splitlines()
print(f"Total lines: {len(lines)}")
for i in range(min(30, len(lines))):
    print(f"L{i+1}: {repr(lines[i])}")
