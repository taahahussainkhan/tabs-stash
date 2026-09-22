import json
import re
from datetime import datetime

with open('extracted_chat/parsed_messages.json', 'r', encoding='utf-8') as f:
    messages = json.load(f)

def parse_dt(ts_str):
    try:
        ts_clean = re.sub(r'\s+', ' ', ts_str).strip()
        return datetime.strptime(ts_clean, '%d/%m/%Y, %I:%M %p')
    except Exception:
        return None

def format_duration(start_dt, end_dt):
    if not start_dt or not end_dt:
        return "N/A"
    diff = end_dt - start_dt
    total_minutes = int(diff.total_seconds() // 60)
    if total_minutes < 0:
        return "N/A"
    days = total_minutes // (24 * 60)
    hours = (total_minutes % (24 * 60)) // 60
    minutes = total_minutes % 60
    parts = []
    if days > 0:
        parts.append(f"{days}d")
    if hours > 0:
        parts.append(f"{hours}h")
    if minutes > 0 or not parts:
        parts.append(f"{minutes}m")
    return " ".join(parts)

# Typo normalization dictionaries
# Start typos: start, stat, statt, starr, starat, statte, startd, stared, atart, Fstart, s5art, Star
# Complete typos: compl, comp, como, comol, comple, compel, completed, compeleted, competed
# Abandon typos: abandon, abandones, abandonesd, abandoened

# Let's inspect every media entry in order and track exact start/end links:
entries = [
    {
        "id": 1,
        "clean_title": "Death Note",
        "category": "Anime Series",
        "raw_start_text": "deathnote",
        "start_msg_id": 11,
        "start_time_str": "12/08/2025, 4:21 pm",
        "raw_end_text": "-",
        "end_msg_id": None,
        "end_time_str": "-",
        "status": "📌 Listed / Planned",
        "notes": "Logged alongside Attack on Titan in Msg 11"
    },
    {
        "id": 2,
        "clean_title": "Attack on Titan",
        "category": "Anime Series",
        "raw_start_text": "attack on titans",
        "start_msg_id": 11,
        "start_time_str": "12/08/2025, 4:21 pm",
        "raw_end_text": "-",
        "end_msg_id": None,
        "end_time_str": "-",
        "status": "📌 Listed / Planned",
        "notes": "Logged alongside Death Note in Msg 11"
    },
    {
        "id": 3,
        "clean_title": "Doll",
        "category": "Media / Video",
        "raw_start_text": "doll",
        "start_msg_id": 13,
        "start_time_str": "15/08/2025, 12:57 am",
        "raw_end_text": "-",
        "end_msg_id": None,
        "end_time_str": "-",
        "status": "📌 Saved / Downloaded",
        "notes": "Linked with MEGA folder archive"
    },
    {
        "id": 4,
        "clean_title": "Blue Streak (1999)",
        "category": "Movie (Comedy/Action)",
        "raw_start_text": "Blue streak movie \nStart 1:26",
        "start_msg_id": 83,
        "start_time_str": "14/12/2025, 1:27 am",
        "raw_end_text": "Completed 11:55 am",
        "end_msg_id": 84,
        "end_time_str": "14/12/2025, 12:02 pm",
        "status": "✅ Completed",
        "notes": "Start logged at 1:26 am; Reply message logged completion at 11:55 am (Msg 84)"
    },
    {
        "id": 5,
        "clean_title": "Halloween (1978)",
        "category": "Movie (Horror)",
        "raw_start_text": "Hallowen 1978 :2 31",
        "start_msg_id": 93,
        "start_time_str": "20/12/2025, 2:31 pm",
        "raw_end_text": "-",
        "end_msg_id": None,
        "end_time_str": "-",
        "status": "⏳ In Progress / Open-Ended",
        "notes": "John Carpenter classic; logged timestamp 2:31 pm"
    },
    {
        "id": 6,
        "clean_title": "Chernobyl (2019)",
        "category": "HBO Miniseries",
        "raw_start_text": "Chernobyl start",
        "start_msg_id": 107,
        "start_time_str": "28/12/2025, 2:17 pm",
        "raw_end_text": "-",
        "end_msg_id": None,
        "end_time_str": "-",
        "status": "⏳ Started / Open-Ended",
        "notes": "HBO Historical drama miniseries"
    },
    {
        "id": 7,
        "clean_title": "True Detective",
        "category": "HBO TV Series",
        "raw_start_text": "True detective",
        "start_msg_id": 120,
        "start_time_str": "17/01/2026, 2:55 pm",
        "raw_end_text": "-",
        "end_msg_id": None,
        "end_time_str": "-",
        "status": "📌 Listed / Planned",
        "notes": "Crime drama series"
    },
    {
        "id": 8,
        "clean_title": "Ice Age",
        "category": "Movie (Animation)",
        "raw_start_text": "To start ice age",
        "start_msg_id": 123,
        "start_time_str": "20/01/2026, 9:19 pm",
        "raw_end_text": "-",
        "end_msg_id": None,
        "end_time_str": "-",
        "status": "📌 Planned / Watchlist",
        "notes": "Queued to start"
    },
    {
        "id": 9,
        "clean_title": "Contagion (2011)",
        "category": "Movie (Thriller/Sci-Fi)",
        "raw_start_text": "https://www.imdb.com/title/tt1798709/\n\nto watch this weekend",
        "start_msg_id": 126,
        "start_time_str": "23/01/2026, 2:28 pm",
        "raw_end_text": "-",
        "end_msg_id": None,
        "end_time_str": "-",
        "status": "📌 Planned / Weekend Watchlist",
        "notes": "Steven Soderbergh pandemic thriller"
    },
    {
        "id": 10,
        "clean_title": "Interstellar (2014)",
        "category": "Movie (Sci-Fi)",
        "raw_start_text": "Interstellar start 2nd tim",
        "start_msg_id": 128,
        "start_time_str": "24/01/2026, 2:08 pm",
        "raw_end_text": "-",
        "end_msg_id": None,
        "end_time_str": "-",
        "status": "⏳ Started (2nd Watch)",
        "notes": "Christopher Nolan sci-fi film re-watch"
    },
    {
        "id": 11,
        "clean_title": "Seven Years in Tibet (1997)",
        "category": "Movie (Biographical/Drama)",
        "raw_start_text": "Seven years in tibet",
        "start_msg_id": 130,
        "start_time_str": "24/01/2026, 4:31 pm",
        "raw_end_text": "-",
        "end_msg_id": None,
        "end_time_str": "-",
        "status": "📌 Listed / In Progress",
        "notes": "Starring Brad Pitt"
    },
    {
        "id": 12,
        "clean_title": "Ranjha Ranjha Kardi",
        "category": "Pakistani Drama Series",
        "raw_start_text": "Ranjha ranjha start second watch",
        "start_msg_id": 141,
        "start_time_str": "14/02/2026, 4:51 pm",
        "raw_end_text": "-",
        "end_msg_id": None,
        "end_time_str": "-",
        "status": "⏳ Started (2nd Watch)",
        "notes": "Iqra Aziz & Imran Ashraf drama re-watch"
    },
    {
        "id": 13,
        "clean_title": "Breaking Bad — Season 1",
        "category": "TV Series (Crime/Drama)",
        "raw_start_text": "Breaking bad s1 started 22 april(one day before today)",
        "start_msg_id": 184,
        "start_time_str": "21/04/2026 (~approx)",
        "raw_end_text": "S1 ended just know and started s2",
        "end_msg_id": 184,
        "end_time_str": "25/04/2026, 1:55 am",
        "status": "✅ Completed",
        "notes": "Completed Season 1; transitioned immediately to Season 2"
    },
    {
        "id": 14,
        "clean_title": "Breaking Bad — Season 2",
        "category": "TV Series (Crime/Drama)",
        "raw_start_text": "started s2",
        "start_msg_id": 184,
        "start_time_str": "25/04/2026, 1:55 am",
        "raw_end_text": "S3 started yesterday night around 10-11",
        "end_msg_id": 188,
        "end_time_str": "29/04/2026, 11:00 pm",
        "status": "✅ Completed",
        "notes": "Completed Season 2 prior to starting Season 3"
    },
    {
        "id": 15,
        "clean_title": "Donnie Darko (2001)",
        "category": "Movie (Sci-Fi/Psychological)",
        "raw_start_text": "Donnie darko",
        "start_msg_id": 185,
        "start_time_str": "26/04/2026, 5:27 pm",
        "raw_end_text": "-",
        "end_msg_id": None,
        "end_time_str": "-",
        "status": "📌 Listed / In Progress",
        "notes": "Jake Gyllenhaal cult classic"
    },
    {
        "id": 16,
        "clean_title": "The Brave Little Toaster (1987)",
        "category": "Movie (Animation)",
        "raw_start_text": "Toaster movie",
        "start_msg_id": 186,
        "start_time_str": "26/04/2026, 6:23 pm",
        "raw_end_text": "-",
        "end_msg_id": None,
        "end_time_str": "-",
        "status": "📌 Listed / In Progress",
        "notes": "Classic animated adventure"
    },
    {
        "id": 17,
        "clean_title": "Breaking Bad — Season 3",
        "category": "TV Series (Crime/Drama)",
        "raw_start_text": "S3 started yesterday night around 10-11",
        "start_msg_id": 188,
        "start_time_str": "29/04/2026, 10:30 pm",
        "raw_end_text": "From season 4 from ep3 resume",
        "end_msg_id": 192,
        "end_time_str": "03/05/2026, 7:02 pm",
        "status": "✅ Completed",
        "notes": "Completed Season 3 before continuing Season 4"
    },
    {
        "id": 18,
        "clean_title": "Breaking Bad — Season 4",
        "category": "TV Series (Crime/Drama)",
        "raw_start_text": "From season 4 from ep3 resume",
        "start_msg_id": 192,
        "start_time_str": "03/05/2026, 7:02 pm",
        "raw_end_text": "S4 ended s5 stardd",
        "end_msg_id": 196,
        "end_time_str": "06/05/2026, 11:35 pm",
        "status": "✅ Completed",
        "notes": "Resumed from Ep 3; Finished Season 4 on 6 May"
    },
    {
        "id": 19,
        "clean_title": "Breaking Bad — Season 5",
        "category": "TV Series (Crime/Drama)",
        "raw_start_text": "s5 stardd",
        "start_msg_id": 196,
        "start_time_str": "06/05/2026, 11:35 pm",
        "raw_end_text": "Breaking bead seaosn 5 ended",
        "end_msg_id": 198,
        "end_time_str": "11/05/2026, 12:01 am",
        "status": "✅ Completed",
        "notes": "Full series finale completed (Typo handled: 'Breaking bead')"
    },
    {
        "id": 20,
        "clean_title": "El Camino: A Breaking Bad Movie (2019)",
        "category": "Movie (Crime/Drama)",
        "raw_start_text": "El.camino start",
        "start_msg_id": 199,
        "start_time_str": "11/05/2026, 8:58 pm",
        "raw_end_text": "Complete",
        "end_msg_id": 203,
        "end_time_str": "13/05/2026, 10:22 pm",
        "status": "✅ Completed",
        "notes": "Reply message 'Complete' (Msg 203) closed the watch session"
    },
    {
        "id": 21,
        "clean_title": "From — Season 4 Episode 4",
        "category": "TV Series (Mystery/Sci-Fi)",
        "raw_start_text": "From s4 ep4",
        "start_msg_id": 200,
        "start_time_str": "11/05/2026, 10:10 pm",
        "raw_end_text": "-",
        "end_msg_id": None,
        "end_time_str": "-",
        "status": "✅ Watched / In Progress",
        "notes": "MGM+ sci-fi horror series episode log"
    },
    {
        "id": 22,
        "clean_title": "Better Call Saul — Season 1",
        "category": "TV Series (Crime/Drama)",
        "raw_start_text": "Bwtter call saul s1 start",
        "start_msg_id": 204,
        "start_time_str": "13/05/2026, 10:43 pm",
        "raw_end_text": "-",
        "end_msg_id": None,
        "end_time_str": "-",
        "status": "⏳ Started",
        "notes": "Typo handled: 'Bwtter call saul'"
    },
    {
        "id": 23,
        "clean_title": "Lost — Season 1",
        "category": "TV Series (Mystery/Sci-Fi)",
        "raw_start_text": "Lost s1 start",
        "start_msg_id": 207,
        "start_time_str": "16/05/2026, 1:37 pm",
        "raw_end_text": "Abandonesd, didnt likes",
        "end_msg_id": 209,
        "end_time_str": "17/05/2026, 1:25 pm",
        "status": "❌ Abandoned (Dropped)",
        "notes": "Dropped after 1 day: 'Abandonesd, didnt likes' (Reply Msg 209)"
    },
    {
        "id": 24,
        "clean_title": "From — Season 4 Episode 5",
        "category": "TV Series (Mystery/Sci-Fi)",
        "raw_start_text": "From s4 e5 start",
        "start_msg_id": 210,
        "start_time_str": "17/05/2026, 1:28 pm",
        "raw_end_text": "-",
        "end_msg_id": None,
        "end_time_str": "-",
        "status": "⏳ Started",
        "notes": "From Season 4 Episode 5 session"
    },
    {
        "id": 25,
        "clean_title": "Dark",
        "category": "TV Series (Sci-Fi/Thriller)",
        "raw_start_text": "Dark atarted",
        "start_msg_id": 211,
        "start_time_str": "17/05/2026, 4:09 pm",
        "raw_end_text": "-",
        "end_msg_id": None,
        "end_time_str": "-",
        "status": "⏳ Started",
        "notes": "German Netflix sci-fi series (Typo handled: 'atarted')"
    },
    {
        "id": 26,
        "clean_title": "Europa Report (2013)",
        "category": "Movie (Sci-Fi)",
        "raw_start_text": "Europa report",
        "start_msg_id": 212,
        "start_time_str": "20/05/2026, 11:00 pm",
        "raw_end_text": "Completed",
        "end_msg_id": 213,
        "end_time_str": "21/05/2026, 1:51 am",
        "status": "✅ Completed",
        "notes": "Completed in 2h 51m (Reply Msg 213)"
    },
    {
        "id": 27,
        "clean_title": "Sunshine (2007)",
        "category": "Movie (Sci-Fi)",
        "raw_start_text": "Sunshine start",
        "start_msg_id": 214,
        "start_time_str": "22/05/2026, 12:04 am",
        "raw_end_text": "Abandones",
        "end_msg_id": 215,
        "end_time_str": "22/05/2026, 11:16 pm",
        "status": "❌ Abandoned (Dropped)",
        "notes": "Danny Boyle film dropped (Reply Msg 215)"
    },
    {
        "id": 28,
        "clean_title": "Vikings — Season 1 Episode 1",
        "category": "TV Series (Historical/Drama)",
        "raw_start_text": "Resumed vikings ep 1s1",
        "start_msg_id": 216,
        "start_time_str": "22/05/2026, 11:16 pm",
        "raw_end_text": "-",
        "end_msg_id": None,
        "end_time_str": "-",
        "status": "⏳ Resumed",
        "notes": "Resumed directly after dropping Sunshine"
    },
    {
        "id": 29,
        "clean_title": "The Mist (2007)",
        "category": "Movie (Horror/Sci-Fi)",
        "raw_start_text": "The mist movie Star",
        "start_msg_id": 222,
        "start_time_str": "24/05/2026, 3:41 pm",
        "raw_end_text": "Complete",
        "end_msg_id": 224,
        "end_time_str": "25/05/2026, 5:22 pm",
        "status": "✅ Completed",
        "notes": "Stephen King adaptation (Typo: 'Star' -> Start; Reply Msg 224)"
    },
    {
        "id": 30,
        "clean_title": "Game of Thrones — Season 2",
        "category": "HBO TV Series (Fantasy)",
        "raw_start_text": "Game of Thrones S2",
        "start_msg_id": None,
        "start_time_str": "Pre-28/05/2026",
        "raw_end_text": "Got season 2 compl",
        "end_msg_id": 227,
        "end_time_str": "28/05/2026, 4:29 pm",
        "status": "✅ Completed",
        "notes": "Completed Season 2 (Typo: 'Got season 2 compl')"
    },
    {
        "id": 31,
        "clean_title": "Game of Thrones — Season 3",
        "category": "HBO TV Series (Fantasy)",
        "raw_start_text": "S3 started now",
        "start_msg_id": 228,
        "start_time_str": "28/05/2026, 5:05 pm",
        "raw_end_text": "-",
        "end_msg_id": None,
        "end_time_str": "-",
        "status": "⏳ Started",
        "notes": "Started immediately after finishing Season 2"
    },
    {
        "id": 32,
        "clean_title": "Lee Cronin's Movie / Mummy",
        "category": "Movie (Horror)",
        "raw_start_text": "Lee cronins mumy start",
        "start_msg_id": 230,
        "start_time_str": "30/05/2026, 2:30 pm",
        "raw_end_text": "-",
        "end_msg_id": None,
        "end_time_str": "-",
        "status": "⏳ Started",
        "notes": "Horror feature (Typo: 'mumy' -> mummy)"
    },
    {
        "id": 33,
        "clean_title": "From — Season 4 Episode 6",
        "category": "TV Series (Mystery/Sci-Fi)",
        "raw_start_text": "From s4 ep6 start",
        "start_msg_id": 231,
        "start_time_str": "31/05/2026, 5:29 pm",
        "raw_end_text": "Compl an hour or two before",
        "end_msg_id": 232,
        "end_time_str": "31/05/2026, 8:23 pm (~6:30-7:30 pm)",
        "status": "✅ Completed",
        "notes": "Completed earlier in the evening (Reply Msg 232)"
    },
    {
        "id": 34,
        "clean_title": "Bhoot Bangla",
        "category": "Movie (Horror/Comedy)",
        "raw_start_text": "Bhoot bangla start",
        "start_msg_id": 249,
        "start_time_str": "13/06/2026, 2:14 pm",
        "raw_end_text": "Completed",
        "end_msg_id": 251,
        "end_time_str": "13/06/2026, 8:42 pm",
        "status": "✅ Completed",
        "notes": "Completed in 6h 28m (Reply Msg 251)"
    },
    {
        "id": 35,
        "clean_title": "The Railway Men (2023)",
        "category": "Netflix Miniseries",
        "raw_start_text": "Railway men stat",
        "start_msg_id": 252,
        "start_time_str": "13/06/2026, 9:27 pm",
        "raw_end_text": "Comp",
        "end_msg_id": 254,
        "end_time_str": "14/06/2026, 2:34 pm",
        "status": "✅ Completed",
        "notes": "Bhopal disaster drama (Typos: 'stat' -> start, 'Comp' -> Complete, Reply Msg 254)"
    },
    {
        "id": 36,
        "clean_title": "From — Season 4 Episode 8",
        "category": "TV Series (Mystery/Sci-Fi)",
        "raw_start_text": "From s4 e8 start",
        "start_msg_id": 255,
        "start_time_str": "14/06/2026, 3:09 pm",
        "raw_end_text": "-",
        "end_msg_id": None,
        "end_time_str": "-",
        "status": "⏳ Started",
        "notes": "Episode 8 session start"
    },
    {
        "id": 37,
        "clean_title": "Aşk-ı Memnu (Ishq-e-Mamnoo)",
        "category": "Turkish Drama Series",
        "raw_start_text": "Ishq e mamnu start",
        "start_msg_id": 262,
        "start_time_str": "18/06/2026, 11:35 pm",
        "raw_end_text": "-",
        "end_msg_id": None,
        "end_time_str": "-",
        "status": "⏳ Started",
        "notes": "Turkish classic series"
    },
    {
        "id": 38,
        "clean_title": "From — Season 4 Episode 9",
        "category": "TV Series (Mystery/Sci-Fi)",
        "raw_start_text": "Ep9 start",
        "start_msg_id": 264,
        "start_time_str": "21/06/2026, 12:59 pm",
        "raw_end_text": "-",
        "end_msg_id": None,
        "end_time_str": "-",
        "status": "⏳ Started",
        "notes": "Episode 9 session start"
    },
    {
        "id": 39,
        "clean_title": "Mandala Murders",
        "category": "TV Series (Crime/Thriller)",
        "raw_start_text": "Mandala murders start",
        "start_msg_id": 269,
        "start_time_str": "26/06/2026, 2:30 pm",
        "raw_end_text": "Comp",
        "end_msg_id": 270,
        "end_time_str": "27/06/2026, 1:09 am",
        "status": "✅ Completed",
        "notes": "Completed in 10h 39m (Reply Msg 270: 'Comp')"
    },
    {
        "id": 40,
        "clean_title": "Kohrra (2023)",
        "category": "Netflix Series (Crime/Mystery)",
        "raw_start_text": "Kohrrq statt",
        "start_msg_id": 272,
        "start_time_str": "27/06/2026, 12:02 pm",
        "raw_end_text": "Abandoned due to being in punjabi",
        "end_msg_id": 273,
        "end_time_str": "27/06/2026, 1:07 pm",
        "status": "❌ Abandoned (Dropped)",
        "notes": "Dropped after 1 hour (Reason: Punjabi language, Reply Msg 273)"
    },
    {
        "id": 41,
        "clean_title": "Aranyak (2021)",
        "category": "Netflix Series (Crime/Mystery)",
        "raw_start_text": "Aranyak statt",
        "start_msg_id": 274,
        "start_time_str": "27/06/2026, 1:07 pm",
        "raw_end_text": "-",
        "end_msg_id": None,
        "end_time_str": "-",
        "status": "⏳ Started",
        "notes": "Started immediately after dropping Kohrra (Typo: 'statt')"
    },
    {
        "id": 42,
        "clean_title": "From — Season 4 Episode 10 (Finale)",
        "category": "TV Series (Mystery/Sci-Fi)",
        "raw_start_text": "Ep 10 start finale",
        "start_msg_id": 277,
        "start_time_str": "28/06/2026, 12:26 pm",
        "raw_end_text": "Compeleted",
        "end_msg_id": 279,
        "end_time_str": "28/06/2026, 9:00 pm",
        "status": "✅ Completed",
        "notes": "Season 4 finale finished (Reply Msg 278 'Comol' / Msg 279 'Compeleted')"
    },
    {
        "id": 43,
        "clean_title": "Dahaad (2023)",
        "category": "Prime Video Series (Crime/Drama)",
        "raw_start_text": "Dahaad start",
        "start_msg_id": 282,
        "start_time_str": "03/07/2026, 10:31 pm",
        "raw_end_text": "-",
        "end_msg_id": None,
        "end_time_str": "-",
        "status": "⏳ Started",
        "notes": "Prime Video crime mystery series"
    },
    {
        "id": 44,
        "clean_title": "Testament: The Story of Moses (2024)",
        "category": "Netflix Docuseries",
        "raw_start_text": "Testament the story of moses \nStart",
        "start_msg_id": 288,
        "start_time_str": "11/07/2026, 1:13 pm",
        "raw_end_text": "Compeleted",
        "end_msg_id": 290,
        "end_time_str": "12/07/2026, 1:00 am",
        "status": "✅ Completed",
        "notes": "3-part docuseries completed in 11h 47m (Reply Msg 290)"
    },
    {
        "id": 45,
        "clean_title": "Raakh (2024)",
        "category": "Prime Video Series",
        "raw_start_text": "Raakh seeies on prime video start",
        "start_msg_id": 291,
        "start_time_str": "12/07/2026, 11:35 am",
        "raw_end_text": "Compeleted",
        "end_msg_id": 292,
        "end_time_str": "12/07/2026, 9:41 pm",
        "status": "✅ Completed",
        "notes": "Completed same evening in 10h 6m (Reply Msg 292)"
    },
    {
        "id": 46,
        "clean_title": "Journey to the Center of the Earth",
        "category": "Movie (Adventure/Sci-Fi)",
        "raw_start_text": "Journey to the center of earth \n\n\nStart on prime",
        "start_msg_id": 293,
        "start_time_str": "13/07/2026, 12:01 am",
        "raw_end_text": "-",
        "end_msg_id": None,
        "end_time_str": "-",
        "status": "⏳ Started",
        "notes": "Started on Prime Video"
    },
    {
        "id": 47,
        "clean_title": "Pati Patni Aur Woh (2019)",
        "category": "Movie (Comedy/Romance)",
        "raw_start_text": "Patinpatni aur wo do \nMovie start on netdlix",
        "start_msg_id": 296,
        "start_time_str": "14/07/2026, 9:33 pm",
        "raw_end_text": "Abandon",
        "end_msg_id": 297,
        "end_time_str": "15/07/2026, 2:33 pm",
        "status": "❌ Abandoned (Dropped)",
        "notes": "Dropped next day (Reply Msg 297)"
    },
    {
        "id": 48,
        "clean_title": "Delhi Crime",
        "category": "Netflix Series (Crime/Drama)",
        "raw_start_text": "Delhi crim. Start",
        "start_msg_id": 298,
        "start_time_str": "15/07/2026, 2:33 pm",
        "raw_end_text": "-",
        "end_msg_id": None,
        "end_time_str": "-",
        "status": "⏳ Started",
        "notes": "Started directly after dropping Pati Patni Aur Woh"
    },
    {
        "id": 49,
        "clean_title": "Panchayat",
        "category": "TVF / Prime Video Series (Comedy/Drama)",
        "raw_start_text": "Panchayat series statt",
        "start_msg_id": 299,
        "start_time_str": "15/07/2026, 8:00 pm",
        "raw_end_text": "-",
        "end_msg_id": None,
        "end_time_str": "-",
        "status": "⏳ Started",
        "notes": "Typo: 'statt' -> start"
    },
    {
        "id": 50,
        "clean_title": "Mardaani 3 / Mardaani",
        "category": "Movie (Action/Crime)",
        "raw_start_text": "Mardanin 3",
        "start_msg_id": 301,
        "start_time_str": "15/07/2026, 10:03 pm",
        "raw_end_text": "-",
        "end_msg_id": None,
        "end_time_str": "-",
        "status": "📌 Listed / Watched",
        "notes": "Rani Mukerji franchise entry"
    },
    {
        "id": 51,
        "clean_title": "Drishyam 2",
        "category": "Movie (Thriller)",
        "raw_start_text": "Drishyam 2",
        "start_msg_id": 305,
        "start_time_str": "17/07/2026, 10:38 pm",
        "raw_end_text": "-",
        "end_msg_id": None,
        "end_time_str": "-",
        "status": "📌 Listed / Watched",
        "notes": "Ajay Devgn suspense sequel"
    },
    {
        "id": 52,
        "clean_title": "Friends",
        "category": "TV Series (Sitcom)",
        "raw_start_text": "Freinds sstar",
        "start_msg_id": 308,
        "start_time_str": "19/07/2026, 12:54 pm",
        "raw_end_text": "-",
        "end_msg_id": None,
        "end_time_str": "-",
        "status": "⏳ Started",
        "notes": "Classic sitcom (Typo: 'Freinds sstar')"
    },
    {
        "id": 53,
        "clean_title": "Cocktail (2012)",
        "category": "Movie (Romance/Comedy)",
        "raw_start_text": "Cocktail movie start",
        "start_msg_id": 315,
        "start_time_str": "22/07/2026, 7:59 pm",
        "raw_end_text": "Comple",
        "end_msg_id": 316,
        "end_time_str": "24/07/2026, 12:54 am",
        "status": "✅ Completed",
        "notes": "Completed in 1d 4h 55m (Reply Msg 316: 'Comple')"
    },
    {
        "id": 54,
        "clean_title": "Musafir Cafe",
        "category": "Audiobook / Story",
        "raw_start_text": "Musafir cafe atart",
        "start_msg_id": 318,
        "start_time_str": "24/07/2026, 10:55 pm",
        "raw_end_text": "-",
        "end_msg_id": None,
        "end_time_str": "-",
        "status": "⏳ Started",
        "notes": "Divya Prakash Dubey story (Typo: 'atart')"
    },
    {
        "id": 55,
        "clean_title": "Raat Akeli Hai (2020)",
        "category": "Movie (Crime/Mystery)",
        "raw_start_text": "Rat akeli he \nFstart",
        "start_msg_id": 319,
        "start_time_str": "25/07/2026, 7:37 pm",
        "raw_end_text": "-",
        "end_msg_id": None,
        "end_time_str": "-",
        "status": "⏳ Started",
        "notes": "Nawazuddin Siddiqui mystery (Typo: 'Fstart')"
    },
    {
        "id": 56,
        "clean_title": "The Walking Dead: Dead City — Season 3 Episode 1",
        "category": "TV Series (Horror/Drama)",
        "raw_start_text": "The walking dead dead city s3 ep 1",
        "start_msg_id": 322,
        "start_time_str": "26/07/2026, 1:39 pm",
        "raw_end_text": "Compel",
        "end_msg_id": 324,
        "end_time_str": "26/07/2026, 3:29 pm",
        "status": "✅ Completed",
        "notes": "Episode completed in 1h 50m (Reply Msg 324: 'Compel')"
    },
    {
        "id": 57,
        "clean_title": "Kartavya",
        "category": "TV Series / Drama",
        "raw_start_text": "Kartavya reusme",
        "start_msg_id": 325,
        "start_time_str": "26/07/2026, 9:05 pm",
        "raw_end_text": "Comple",
        "end_msg_id": 326,
        "end_time_str": "27/07/2026, 2:09 am",
        "status": "✅ Completed",
        "notes": "Resumed & finished in 5h 4m (Reply Msg 326: 'Comple')"
    },
    {
        "id": 58,
        "clean_title": "I Will Find You",
        "category": "Book / Mystery",
        "raw_start_text": "I will find you",
        "start_msg_id": 330,
        "start_time_str": "31/07/2026, 1:13 pm",
        "raw_end_text": "-",
        "end_msg_id": None,
        "end_time_str": "-",
        "status": "📌 Listed / Planned",
        "notes": "Harlan Coben novel"
    },
    {
        "id": 59,
        "clean_title": "Shehr-e-Zaat",
        "category": "Pakistani Drama Series",
        "raw_start_text": "Sheher e zaat start \nDram",
        "start_msg_id": 331,
        "start_time_str": "01/08/2026, 12:30 am",
        "raw_end_text": "-",
        "end_msg_id": None,
        "end_time_str": "-",
        "status": "⏳ Started",
        "notes": "Umera Ahmed / Mahira Khan classic drama"
    },
    {
        "id": 60,
        "clean_title": "Spider-Man (2002)",
        "category": "Movie (Superhero)",
        "raw_start_text": "Spiderman 2002 start",
        "start_msg_id": 333,
        "start_time_str": "08/08/2026, 1:18 pm",
        "raw_end_text": "Completed",
        "end_msg_id": 334,
        "end_time_str": "09/08/2026, 4:58 pm",
        "status": "✅ Completed",
        "notes": "Tobey Maguire classic; Completed in 1d 3h 40m (Reply Msg 334)"
    },
    {
        "id": 61,
        "clean_title": "Spider-Man 2 (2004)",
        "category": "Movie (Superhero)",
        "raw_start_text": "Spiderman 2 start",
        "start_msg_id": 335,
        "start_time_str": "09/08/2026, 8:07 pm",
        "raw_end_text": "Compeleted",
        "end_msg_id": 339,
        "end_time_str": "13/08/2026, 1:45 am",
        "status": "✅ Completed",
        "notes": "Sam Raimi sequel; Completed in 3d 5h 38m (Reply Msg 339)"
    },
    {
        "id": 62,
        "clean_title": "O Rangreza",
        "category": "Pakistani Drama Series",
        "raw_start_text": "O rangreza start",
        "start_msg_id": 340,
        "start_time_str": "13/08/2026, 11:01 pm",
        "raw_end_text": "-",
        "end_msg_id": None,
        "end_time_str": "-",
        "status": "⏳ Started",
        "notes": "HUM TV Drama (Sajal Aly, Bilal Abbas Khan)"
    },
    {
        "id": 63,
        "clean_title": "The Last House on the Left (2009)",
        "category": "Movie (Horror/Thriller)",
        "raw_start_text": "The last house atart",
        "start_msg_id": 341,
        "start_time_str": "14/08/2026, 12:25 am",
        "raw_end_text": "Comp",
        "end_msg_id": 342,
        "end_time_str": "14/08/2026, 12:50 pm",
        "status": "✅ Completed",
        "notes": "Completed in 12h 25m (Reply Msg 342: 'Comp')"
    },
    {
        "id": 64,
        "clean_title": "Main Wapis Aaunga",
        "category": "Movie / Drama",
        "raw_start_text": "Mein wapis aunga statt",
        "start_msg_id": 343,
        "start_time_str": "14/08/2026, 7:58 pm",
        "raw_end_text": "Compeleted",
        "end_msg_id": 344,
        "end_time_str": "15/08/2026, 2:19 pm",
        "status": "✅ Completed",
        "notes": "Completed in 18h 21m (Reply Msg 344)"
    },
    {
        "id": 65,
        "clean_title": "Ikka (2024)",
        "category": "Movie (Action/Drama)",
        "raw_start_text": "Ikka movie start",
        "start_msg_id": 345,
        "start_time_str": "15/08/2026, 3:46 pm",
        "raw_end_text": "Completed",
        "end_msg_id": 346,
        "end_time_str": "15/08/2026, 7:31 pm",
        "status": "✅ Completed",
        "notes": "Completed in 3h 45m (Reply Msg 346)"
    },
    {
        "id": 66,
        "clean_title": "Kafeel",
        "category": "Pakistani Drama / Media",
        "raw_start_text": "Kafeel",
        "start_msg_id": None,
        "start_time_str": "Pre-21/08/2026",
        "raw_end_text": "Kafeel completed",
        "end_msg_id": 348,
        "end_time_str": "21/08/2026, 8:22 pm",
        "status": "✅ Completed",
        "notes": "Logged completion"
    },
    {
        "id": 67,
        "clean_title": "Sang-e-Mar Mar",
        "category": "Pakistani Drama Series",
        "raw_start_text": "Sang e mar mar start",
        "start_msg_id": 349,
        "start_time_str": "22/08/2026, 12:28 pm",
        "raw_end_text": "-",
        "end_msg_id": None,
        "end_time_str": "-",
        "status": "⏳ Started",
        "notes": "Mustafa Afridi tribal family drama"
    },
    {
        "id": 68,
        "clean_title": "Ishq Murshid",
        "category": "Pakistani Drama Series",
        "raw_start_text": "Ishq murshad statt",
        "start_msg_id": 350,
        "start_time_str": "23/08/2026, 12:51 am",
        "raw_end_text": "Left these",
        "end_msg_id": 351,
        "end_time_str": "23/08/2026, 2:28 pm",
        "status": "❌ Abandoned (Dropped)",
        "notes": "Dropped in afternoon: 'Left these' (Reply Msg 351)"
    },
    {
        "id": 69,
        "clean_title": "Yakeen Ka Safar",
        "category": "Pakistani Drama Series",
        "raw_start_text": "Started yakeen jansafar",
        "start_msg_id": 352,
        "start_time_str": "23/08/2026, 2:28 pm",
        "raw_end_text": "-",
        "end_msg_id": None,
        "end_time_str": "-",
        "status": "⏳ Started",
        "notes": "Started immediately after dropping Ishq Murshid (Typo: 'yakeen jansafar')"
    },
    {
        "id": 70,
        "clean_title": "Bin Roye",
        "category": "Pakistani Drama Series",
        "raw_start_text": "Bin roye start",
        "start_msg_id": 353,
        "start_time_str": "23/08/2026, 5:00 pm",
        "raw_end_text": "-",
        "end_msg_id": None,
        "end_time_str": "-",
        "status": "⏳ Started",
        "notes": "Farhat Ishtiaq drama series"
    },
    {
        "id": 71,
        "clean_title": "Supernatural",
        "category": "TV Series (Dark Fantasy)",
        "raw_start_text": "Supernatural start",
        "start_msg_id": 354,
        "start_time_str": "23/08/2026, 11:50 pm",
        "raw_end_text": "Completed",
        "end_msg_id": 356,
        "end_time_str": "27/08/2026, 12:15 am",
        "status": "✅ Completed (Session)",
        "notes": "Completed binge session in 3d 0h 25m (Reply Msg 356)"
    },
    {
        "id": 72,
        "clean_title": "Hum Kahan Ke Sachay Thay",
        "category": "Pakistani Drama Series",
        "raw_start_text": "Hum kahan kay saxhy thay \n\nStarted . \nSexond watch",
        "start_msg_id": 357,
        "start_time_str": "31/08/2026, 9:58 pm",
        "raw_end_text": "-",
        "end_msg_id": None,
        "end_time_str": "-",
        "status": "⏳ Started (2nd Watch)",
        "notes": "Umera Ahmed / Mahira Khan drama re-watch (Typo: 'saxhy thay', 'Sexond watch')"
    },
    {
        "id": 73,
        "clean_title": "Iron Man (2008)",
        "category": "MCU Phase 1 Movie",
        "raw_start_text": "Ironnman start 2008",
        "start_msg_id": 358,
        "start_time_str": "02/09/2026, 2:45 pm",
        "raw_end_text": "Completed",
        "end_msg_id": 359,
        "end_time_str": "04/09/2026, 12:21 pm",
        "status": "✅ Completed",
        "notes": "MCU Marathon Movie #1; Completed in 1d 21h 36m (Reply Msg 359)"
    },
    {
        "id": 74,
        "clean_title": "Iron Man 2 (2010)",
        "category": "MCU Phase 1 Movie",
        "raw_start_text": "IRon man 2 \nStart",
        "start_msg_id": 360,
        "start_time_str": "04/09/2026, 1:31 pm",
        "raw_end_text": "Completed",
        "end_msg_id": 362,
        "end_time_str": "05/09/2026, 1:20 am",
        "status": "✅ Completed",
        "notes": "MCU Marathon Movie #2; Completed in 11h 49m (Reply Msg 362)"
    },
    {
        "id": 75,
        "clean_title": "Thor (2011)",
        "category": "MCU Phase 1 Movie",
        "raw_start_text": "Thor 2011 start",
        "start_msg_id": 363,
        "start_time_str": "05/09/2026, 11:12 am",
        "raw_end_text": "Competed",
        "end_msg_id": 364,
        "end_time_str": "05/09/2026, 5:57 pm",
        "status": "✅ Completed",
        "notes": "MCU Marathon Movie #3; Completed in 6h 45m (Typo: 'Competed', Reply Msg 364)"
    },
    {
        "id": 76,
        "clean_title": "Captain America: The First Avenger (2011)",
        "category": "MCU Phase 1 Movie",
        "raw_start_text": "Captain america , the firs tavenger start",
        "start_msg_id": 365,
        "start_time_str": "05/09/2026, 6:23 pm",
        "raw_end_text": "Completed",
        "end_msg_id": 366,
        "end_time_str": "06/09/2026, 3:03 pm",
        "status": "✅ Completed",
        "notes": "MCU Marathon Movie #4; Completed in 20h 40m (Reply Msg 366)"
    },
    {
        "id": 77,
        "clean_title": "The Avengers (2012)",
        "category": "MCU Phase 1 Movie",
        "raw_start_text": "Thw avengers started",
        "start_msg_id": 367,
        "start_time_str": "06/09/2026, 3:15 pm",
        "raw_end_text": "Took break from marvel",
        "end_msg_id": 368,
        "end_time_str": "06/09/2026, 6:30 pm",
        "status": "⏸️ Paused (Break)",
        "notes": "MCU Marathon paused after 3h 15m to watch YOU Series (Reply Msg 368)"
    },
    {
        "id": 78,
        "clean_title": "YOU — Season 1 (2018)",
        "category": "Netflix Series (Psychological/Thriller)",
        "raw_start_text": "You series started season 1",
        "start_msg_id": 369,
        "start_time_str": "06/09/2026, 6:31 pm",
        "raw_end_text": "Seaosn 1 complete",
        "end_msg_id": 372,
        "end_time_str": "11/09/2026, 6:32 pm",
        "status": "✅ Completed",
        "notes": "Full 10-episode Season 1 binge completed in 5d 0h 1m (Reply Msg 372)"
    },
    {
        "id": 79,
        "clean_title": "Godzilla (2014)",
        "category": "Movie (MonsterVerse/Sci-Fi)",
        "raw_start_text": "Godzilla 2014 start",
        "start_msg_id": 371,
        "start_time_str": "10/09/2026, 12:33 am",
        "raw_end_text": "Completed",
        "end_msg_id": 373,
        "end_time_str": "12/09/2026, 2:50 am",
        "status": "✅ Completed",
        "notes": "Completed in 2d 2h 17m (Reply Msg 373)"
    },
    {
        "id": 80,
        "clean_title": "Iron Man 3 (2013)",
        "category": "MCU Phase 2 Movie",
        "raw_start_text": "Iron man 3 starat",
        "start_msg_id": 374,
        "start_time_str": "12/09/2026, 11:12 am",
        "raw_end_text": "Completed",
        "end_msg_id": 375,
        "end_time_str": "12/09/2026, 3:49 pm",
        "status": "✅ Completed",
        "notes": "MCU Marathon Resumed; Completed in 4h 37m (Reply Msg 375)"
    },
    {
        "id": 81,
        "clean_title": "Thor: The Dark World (2013)",
        "category": "MCU Phase 2 Movie",
        "raw_start_text": "Thor the dark world statte",
        "start_msg_id": 376,
        "start_time_str": "12/09/2026, 4:15 pm",
        "raw_end_text": "Completed",
        "end_msg_id": 377,
        "end_time_str": "13/09/2026, 12:28 am",
        "status": "✅ Completed",
        "notes": "MCU Marathon Movie #6; Completed in 8h 13m (Reply Msg 377)"
    },
    {
        "id": 82,
        "clean_title": "Guardians of the Galaxy (2014)",
        "category": "MCU Phase 2 Movie",
        "raw_start_text": "Guardians of galaxy 2014 start",
        "start_msg_id": 378,
        "start_time_str": "13/09/2026, 12:40 am",
        "raw_end_text": "Completed",
        "end_msg_id": 379,
        "end_time_str": "13/09/2026, 3:39 pm",
        "status": "✅ Completed",
        "notes": "MCU Marathon Movie #7; Completed in 14h 59m (Reply Msg 379)"
    },
    {
        "id": 83,
        "clean_title": "Captain America: The Winter Soldier (2014)",
        "category": "MCU Phase 2 Movie",
        "raw_start_text": "Captain america the winter soldiar start",
        "start_msg_id": 380,
        "start_time_str": "13/09/2026, 4:12 pm",
        "raw_end_text": "Completed",
        "end_msg_id": 381,
        "end_time_str": "14/09/2026, 1:37 am",
        "status": "✅ Completed",
        "notes": "MCU Marathon Movie #8; Completed in 9h 25m (Reply Msg 381)"
    },
    {
        "id": 84,
        "clean_title": "Avengers: Age of Ultron (2015)",
        "category": "MCU Phase 2 Movie",
        "raw_start_text": "Avengers age of ultron start",
        "start_msg_id": 384,
        "start_time_str": "14/09/2026, 8:51 pm",
        "raw_end_text": "Completed",
        "end_msg_id": 385,
        "end_time_str": "16/09/2026, 8:51 pm",
        "status": "✅ Completed",
        "notes": "MCU Marathon Movie #9; Completed in 2d 0h 0m (Reply Msg 385)"
    },
    {
        "id": 85,
        "clean_title": "Ant-Man (2015)",
        "category": "MCU Phase 2 Movie",
        "raw_start_text": "Ant man 2015 start",
        "start_msg_id": 386,
        "start_time_str": "16/09/2026, 9:02 pm",
        "raw_end_text": "Completed",
        "end_msg_id": 387,
        "end_time_str": "17/09/2026, 1:15 am",
        "status": "✅ Completed",
        "notes": "MCU Phase 2 Finale; Completed in 4h 13m (Reply Msg 387)"
    },
    {
        "id": 86,
        "clean_title": "Captain America: Civil War (2016)",
        "category": "MCU Phase 3 Movie",
        "raw_start_text": "Captain america civil war started",
        "start_msg_id": 388,
        "start_time_str": "17/09/2026, 6:03 pm",
        "raw_end_text": "Completed",
        "end_msg_id": 389,
        "end_time_str": "18/09/2026, 5:16 pm",
        "status": "✅ Completed",
        "notes": "MCU Phase 3 Kickoff; Completed in 23h 13m (Reply Msg 389)"
    },
    {
        "id": 87,
        "clean_title": "Doctor Strange (2016)",
        "category": "MCU Phase 3 Movie",
        "raw_start_text": "Doctor strange start",
        "start_msg_id": 390,
        "start_time_str": "18/09/2026, 6:12 pm",
        "raw_end_text": "Completed",
        "end_msg_id": 391,
        "end_time_str": "19/09/2026, 12:52 pm",
        "status": "✅ Completed",
        "notes": "MCU Marathon Movie #12; Completed in 18h 40m (Reply Msg 391)"
    },
    {
        "id": 88,
        "clean_title": "Monsters / Lizzie Borden",
        "category": "Netflix Series (True Crime)",
        "raw_start_text": "Monstwr lozzie bordans s5art netflix serie",
        "start_msg_id": 393,
        "start_time_str": "19/09/2026, 2:44 pm",
        "raw_end_text": "Watched 6 epi , abandoened",
        "end_msg_id": 395,
        "end_time_str": "19/09/2026, 6:04 pm",
        "status": "❌ Abandoned (6 Episodes Watched)",
        "notes": "Watched 6 episodes and dropped in 3h 20m (Reply Msg 395)"
    },
    {
        "id": 89,
        "clean_title": "Guardians of the Galaxy Vol. 2 (2017)",
        "category": "MCU Phase 3 Movie",
        "raw_start_text": "Guardians of galazy vol 2 start \nStarted now",
        "start_msg_id": 392,
        "start_time_str": "19/09/2026, 7:35 pm",
        "raw_end_text": "Completed",
        "end_msg_id": 397,
        "end_time_str": "20/09/2026, 12:44 am",
        "status": "✅ Completed",
        "notes": "MCU Marathon Movie #13; Completed in 5h 9m (Reply Msg 397)"
    },
    {
        "id": 90,
        "clean_title": "Thor: Ragnarok (2017)",
        "category": "MCU Phase 3 Movie",
        "raw_start_text": "Thor Ragnarok starr",
        "start_msg_id": 398,
        "start_time_str": "20/09/2026, 10:39 am",
        "raw_end_text": "Completed",
        "end_msg_id": 399,
        "end_time_str": "20/09/2026, 2:18 pm",
        "status": "✅ Completed",
        "notes": "MCU Marathon Movie #14; Completed in 3h 39m (Reply Msg 399)"
    },
    {
        "id": 91,
        "clean_title": "Black Panther (2018)",
        "category": "MCU Phase 3 Movie",
        "raw_start_text": "Black panther 2018 stat",
        "start_msg_id": 400,
        "start_time_str": "20/09/2026, 2:29 pm",
        "raw_end_text": "Competed",
        "end_msg_id": 401,
        "end_time_str": "20/09/2026, 6:48 pm",
        "status": "✅ Completed",
        "notes": "MCU Marathon Movie #15; Completed in 4h 19m (Reply Msg 401)"
    },
    {
        "id": 92,
        "clean_title": "Avengers: Infinity War (2018)",
        "category": "MCU Phase 3 Movie",
        "raw_start_text": "Avengers infinity war started",
        "start_msg_id": 402,
        "start_time_str": "20/09/2026, 7:16 pm",
        "raw_end_text": "Completed",
        "end_msg_id": 404,
        "end_time_str": "21/09/2026, 12:23 am",
        "status": "✅ Completed",
        "notes": "MCU Marathon Movie #16; Completed in 5h 7m (Reply Msg 404)"
    },
    {
        "id": 93,
        "clean_title": "Ant-Man and the Wasp (2018)",
        "category": "MCU Phase 3 Movie",
        "raw_start_text": "Ant man and the wasp \nStarted",
        "start_msg_id": 405,
        "start_time_str": "21/09/2026, 12:41 am",
        "raw_end_text": "Completed",
        "end_msg_id": 408,
        "end_time_str": "21/09/2026, 12:20 pm",
        "status": "✅ Completed",
        "notes": "MCU Marathon Movie #17; Completed in 11h 39m (Reply Msg 408)"
    },
    {
        "id": 94,
        "clean_title": "Captain Marvel (2019)",
        "category": "MCU Phase 3 Movie",
        "raw_start_text": "Captain marvel 2019 startd \nStared now",
        "start_msg_id": 409,
        "start_time_str": "21/09/2026, 12:32 pm",
        "raw_end_text": "Completed",
        "end_msg_id": 411,
        "end_time_str": "21/09/2026, 4:52 pm",
        "status": "✅ Completed",
        "notes": "MCU Marathon Movie #18; Completed in 4h 20m (Reply Msg 411)"
    },
    {
        "id": 95,
        "clean_title": "Avengers: Endgame (2019)",
        "category": "MCU Phase 3 Movie",
        "raw_start_text": "End game started",
        "start_msg_id": 412,
        "start_time_str": "21/09/2026, 4:54 pm",
        "raw_end_text": "Completed",
        "end_msg_id": 413,
        "end_time_str": "21/09/2026, 10:12 pm",
        "status": "✅ Completed",
        "notes": "MCU Infinity Saga Climax; Completed in 5h 18m (Reply Msg 413)"
    },
    {
        "id": 96,
        "clean_title": "The Guardians of the Galaxy Holiday Special (2022)",
        "category": "MCU Phase 4 Special",
        "raw_start_text": "Guardians of galaxy hpldiay version start",
        "start_msg_id": 414,
        "start_time_str": "22/09/2026, 1:24 am",
        "raw_end_text": "Completed",
        "end_msg_id": 415,
        "end_time_str": "22/09/2026, 11:11 am",
        "status": "✅ Completed",
        "notes": "Holiday special; Completed in 9h 47m (Reply Msg 415)"
    },
    {
        "id": 97,
        "clean_title": "Ant-Man and the Wasp: Quantumania (2023)",
        "category": "MCU Phase 5 Movie",
        "raw_start_text": "Ant man quantumania started",
        "start_msg_id": 416,
        "start_time_str": "22/09/2026, 11:23 am",
        "raw_end_text": "Completed",
        "end_msg_id": 417,
        "end_time_str": "22/09/2026, 4:27 pm",
        "status": "✅ Completed",
        "notes": "MCU Phase 5 Opener; Completed in 5h 4m (Reply Msg 417)"
    },
    {
        "id": 98,
        "clean_title": "Guardians of the Galaxy Vol. 3 (2023)",
        "category": "MCU Phase 5 Movie",
        "raw_start_text": "Guardians of the galaxy vol 3 started",
        "start_msg_id": 418,
        "start_time_str": "22/09/2026, 6:01 pm",
        "raw_end_text": "Completed",
        "end_msg_id": 419,
        "end_time_str": "22/09/2026, 11:26 pm",
        "status": "✅ Completed",
        "notes": "MCU Trilogy Finale; Completed in 5h 25m (Reply Msg 419)"
    }
]

# Write the master MEDIA_WATCH_LOG.md with complete start-to-end pairing table
with open('MEDIA_WATCH_LOG.md', 'w', encoding='utf-8') as f:
    f.write("# 🎬 Lore Archive — Master Media & Watch History\n\n")
    f.write("> **Source**: WhatsApp Personal Chat Export (+92 310 4515488)\n")
    f.write("> **Total Verified Entries**: {}\n\n".format(len(entries)))
    
    # Metrics
    completed = [e for e in entries if 'Completed' in e['status'] or 'Watched' in e['status']]
    in_progress = [e for e in entries if 'Started' in e['status'] or 'In Progress' in e['status'] or 'Resumed' in e['status']]
    abandoned = [e for e in entries if 'Abandoned' in e['status']]
    listed = [e for e in entries if 'Listed' in e['status'] or 'Planned' in e['status']]
    
    f.write("## 📊 Summary Statistics\n\n")
    f.write(f"- ✅ **Completed Titles / Sessions**: {len(completed)}\n")
    f.write(f"- ⏳ **Started / In Progress**: {len(in_progress)}\n")
    f.write(f"- ❌ **Abandoned / Dropped**: {len(abandoned)}\n")
    f.write(f"- 📌 **Listed / Watchlist**: {len(listed)}\n\n")
    
    f.write("---\n\n")
    f.write("## 📋 Comprehensive Media Watch Matrix\n\n")
    f.write("This table resolves all reply-style completion messages (`'Completed'`, `'Comp'`, `'Comple'`, `'Abandon'`, `'Competed'`), handles spelling variations, and pairs start timestamps with end timestamps.\n\n")
    f.write("| # | Clean Title | Type / Category | Start Log (Timestamp & Raw Text) | End Log (Timestamp & Reply Text) | Duration / Turnaround | Status | Resolution & Context Notes |\n")
    f.write("|---|-------------|-----------------|----------------------------------|----------------------------------|-----------------------|--------|----------------------------|\n")
    
    for e in entries:
        start_dt = parse_dt(e['start_time_str']) if e['start_time_str'] != '-' and 'approx' not in e['start_time_str'] and 'Pre-' not in e['start_time_str'] else None
        end_dt = parse_dt(e['end_time_str']) if e['end_time_str'] != '-' and 'approx' not in e['end_time_str'] else None
        duration = format_duration(start_dt, end_dt) if (start_dt and end_dt) else "—"
        
        start_cell = f"`{e['start_time_str']}`<br>*\"{e['raw_start_text'].replace(chr(10), ' ')}\"*" if e['start_msg_id'] else f"`{e['start_time_str']}`"
        end_cell = f"`{e['end_time_str']}`<br>*\"{e['raw_end_text']}\"*" if e['end_msg_id'] else f"`{e['end_time_str']}`"
        
        f.write(f"| {e['id']} | **{e['clean_title']}** | {e['category']} | {start_cell} | {end_cell} | {duration} | {e['status']} | {e['notes']} |\n")
        
    f.write("\n---\n\n")
    f.write("## 🦸 Marvel Cinematic Universe (MCU) Marathon Detailed Timeline (Sept 2026)\n\n")
    f.write("| Film / Special | Start Timestamp | Completion Timestamp | Elapsed Time | Status |\n")
    f.write("|----------------|-----------------|----------------------|--------------|--------|\n")
    
    mcu_list = [e for e in entries if 'MCU' in e['category']]
    for m in mcu_list:
        s_dt = parse_dt(m['start_time_str'])
        e_dt = parse_dt(m['end_time_str'])
        dur = format_duration(s_dt, e_dt) if (s_dt and e_dt) else "—"
        f.write(f"| **{m['clean_title']}** | `{m['start_time_str']}` | `{m['end_time_str']}` | **{dur}** | {m['status']} |\n")

print("Updated MEDIA_WATCH_LOG.md with comprehensive linked matrix table.")
