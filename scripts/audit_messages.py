import json
import re

with open('extracted_chat/parsed_messages.json', 'r', encoding='utf-8') as f:
    messages = json.load(f)

# Let's write all messages with their indices and timestamps to a readable text/markdown file for full review
with open('extracted_chat/all_messages_reviewed.md', 'w', encoding='utf-8') as out:
    for idx, m in enumerate(messages):
        out.write(f"### Msg {idx+1} | {m['timestamp']} | {m['sender']}\n")
        out.write(f"```\n{m['content']}\n```\n\n")

print("Wrote extracted_chat/all_messages_reviewed.md for complete audit.")
