import json
import re
import os

with open('extracted_chat/parsed_messages.json', 'r', encoding='utf-8') as f:
    messages = json.load(f)

# 1. PROCESS MEDIA WATCH LOGS
# We will create a structured, beautifully formatted Markdown file for all Media Logs.
# Let's write MEDIA_WATCH_LOG.md

media_entries = [
    {
        "title": "Death Note",
        "type": "Anime / Series",
        "start_time": "12/08/2025, 4:21 pm",
        "end_time": "Open-ended / Listed",
        "status": "Listed / Planned",
        "notes": "Logged alongside Attack on Titan",
        "raw_msg": "deathnote\nattack on titans",
        "msg_num": 11
    },
    {
        "title": "Attack on Titan",
        "type": "Anime / Series",
        "start_time": "12/08/2025, 4:21 pm",
        "end_time": "Open-ended / Listed",
        "status": "Listed / Planned",
        "notes": "Logged alongside Death Note",
        "raw_msg": "deathnote\nattack on titans",
        "msg_num": 11
    },
    {
        "title": "Doll",
        "type": "Media",
        "start_time": "15/08/2025, 12:57 am",
        "end_time": "Open-ended / Logged",
        "status": "Saved / Downloaded",
        "notes": "Logged with MEGA folder",
        "raw_msg": "https://mega.nz/folder/uYFVzT4K#C4_pqC2Ff1CLuwLmb62UeQ/folder/WZFBGDyS\n\ndoll",
        "msg_num": 13
    },
    {
        "title": "Blue Streak (1999)",
        "type": "Movie",
        "start_time": "14/12/2025, 1:26 am",
        "end_time": "14/12/2025, 11:55 am",
        "status": "Completed",
        "notes": "Logged start at 1:26 am, completed at 11:55 am",
        "raw_msg": "Start: Blue streak movie Start 1:26 | End: Completed 11:55 am",
        "msg_num": "83, 84"
    },
    {
        "title": "Halloween (1978)",
        "type": "Movie",
        "start_time": "20/12/2025, 2:31 pm",
        "end_time": "Open-ended",
        "status": "Started / In Progress",
        "notes": "Logged time: 2:31 pm",
        "raw_msg": "Hallowen 1978 :2 31",
        "msg_num": 93
    },
    {
        "title": "Chernobyl (2019)",
        "type": "Miniseries",
        "start_time": "28/12/2025, 2:17 pm",
        "end_time": "Open-ended",
        "status": "Started",
        "notes": "HBO Miniseries start",
        "raw_msg": "Chernobyl start",
        "msg_num": 107
    },
    {
        "title": "True Detective",
        "type": "Series",
        "start_time": "17/01/2026, 2:55 pm",
        "end_time": "Open-ended",
        "status": "Listed / In Progress",
        "notes": "HBO Series",
        "raw_msg": "True detective",
        "msg_num": 120
    },
    {
        "title": "Ice Age",
        "type": "Movie / Franchise",
        "start_time": "20/01/2026, 9:19 pm",
        "end_time": "Open-ended",
        "status": "Planned / To Start",
        "notes": "To start ice age",
        "raw_msg": "To start ice age",
        "msg_num": 123
    },
    {
        "title": "Contagion (2011)",
        "type": "Movie",
        "start_time": "23/01/2026, 2:28 pm",
        "end_time": "Open-ended",
        "status": "Watchlist / To Watch",
        "notes": "IMDb: tt1798709 ('to watch this weekend')",
        "raw_msg": "https://www.imdb.com/title/tt1798709/\nto watch this weekend",
        "msg_num": 126
    },
    {
        "title": "Interstellar (2014)",
        "type": "Movie",
        "start_time": "24/01/2026, 2:08 pm",
        "end_time": "Open-ended",
        "status": "Started (2nd Watch)",
        "notes": "Re-watch",
        "raw_msg": "Interstellar start 2nd tim",
        "msg_num": 128
    },
    {
        "title": "Seven Years in Tibet (1997)",
        "type": "Movie",
        "start_time": "24/01/2026, 4:31 pm",
        "end_time": "Open-ended",
        "status": "Listed / Started",
        "notes": "Starring Brad Pitt",
        "raw_msg": "Seven years in tibet",
        "msg_num": 130
    },
    {
        "title": "Ranjha Ranjha Kardi",
        "type": "Pakistani Drama / Series",
        "start_time": "14/02/2026, 4:51 pm",
        "end_time": "Open-ended",
        "status": "Started (2nd Watch)",
        "notes": "Re-watch",
        "raw_msg": "Ranjha ranjha start second watch",
        "msg_num": 141
    },
    {
        "title": "Breaking Bad — Season 1",
        "type": "Series",
        "start_time": "21/04/2026 (~1 day before 22 Apr)",
        "end_time": "25/04/2026, 1:55 am",
        "status": "Completed",
        "notes": "Finished Season 1 on 25 Apr 1:55 am",
        "raw_msg": "Breaking bad s1 started 22 april(one day before today)\nS1 ended just know and started s2",
        "msg_num": 184
    },
    {
        "title": "Breaking Bad — Season 2",
        "type": "Series",
        "start_time": "25/04/2026, 1:55 am",
        "end_time": "29/04/2026 (~night)",
        "status": "Completed",
        "notes": "Followed directly by Season 3",
        "raw_msg": "started s2",
        "msg_num": 184
    },
    {
        "title": "Donnie Darko (2001)",
        "type": "Movie",
        "start_time": "26/04/2026, 5:27 pm",
        "end_time": "Open-ended",
        "status": "Listed / Started",
        "notes": "Cult classic film",
        "raw_msg": "Donnie darko",
        "msg_num": 185
    },
    {
        "title": "The Brave Little Toaster (Toaster Movie)",
        "type": "Movie",
        "start_time": "26/04/2026, 6:23 pm",
        "end_time": "Open-ended",
        "status": "Listed / Started",
        "notes": "Animated film",
        "raw_msg": "Toaster movie",
        "msg_num": 186
    },
    {
        "title": "Breaking Bad — Season 3",
        "type": "Series",
        "start_time": "29/04/2026 (~10:00-11:00 pm)",
        "end_time": "03/05/2026",
        "status": "Completed",
        "notes": "Started night of 29 Apr",
        "raw_msg": "S3 started yesterday night around 10-11",
        "msg_num": 188
    },
    {
        "title": "Breaking Bad — Season 4",
        "type": "Series",
        "start_time": "03/05/2026, 7:02 pm (from Ep 3)",
        "end_time": "06/05/2026, 11:35 pm",
        "status": "Completed",
        "notes": "Resumed from Episode 3; ended 6 May",
        "raw_msg": "From season 4 from ep3 resume -> S4 ended s5 stardd",
        "msg_num": "192, 196"
    },
    {
        "title": "Breaking Bad — Season 5",
        "type": "Series",
        "start_time": "06/05/2026, 11:35 pm",
        "end_time": "11/05/2026, 12:01 am",
        "status": "Completed",
        "notes": "Full series completion",
        "raw_msg": "S4 ended s5 stardd -> Breaking bead seaosn 5 ended",
        "msg_num": "196, 198"
    },
    {
        "title": "El Camino: A Breaking Bad Movie",
        "type": "Movie",
        "start_time": "11/05/2026, 8:58 pm",
        "end_time": "13/05/2026, 10:22 pm",
        "status": "Completed",
        "notes": "Jesse Pinkman sequel movie",
        "raw_msg": "El.camino start -> Complete",
        "msg_num": "199, 203"
    },
    {
        "title": "From — Season 4 Episode 4",
        "type": "Series Episode",
        "start_time": "11/05/2026, 10:10 pm",
        "end_time": "11/05/2026",
        "status": "Watched / In Progress",
        "notes": "MGM+ sci-fi mystery series",
        "raw_msg": "From s4 ep4",
        "msg_num": 200
    },
    {
        "title": "Better Call Saul — Season 1",
        "type": "Series",
        "start_time": "13/05/2026, 10:43 pm",
        "end_time": "Open-ended",
        "status": "Started",
        "notes": "Breaking Bad spinoff start",
        "raw_msg": "Bwtter call saul s1 start",
        "msg_num": 204
    },
    {
        "title": "Lost — Season 1",
        "type": "Series",
        "start_time": "16/05/2026, 1:37 pm",
        "end_time": "17/05/2026, 1:25 pm",
        "status": "Abandoned (Dropped)",
        "notes": "Explicitly abandoned: 'Abandonesd, didnt likes'",
        "raw_msg": "Lost s1 start -> Abandonesd, didnt likes",
        "msg_num": "207, 209"
    },
    {
        "title": "From — Season 4 Episode 5",
        "type": "Series Episode",
        "start_time": "17/05/2026, 1:28 pm",
        "end_time": "17/05/2026",
        "status": "Started",
        "notes": "From s4 e5",
        "raw_msg": "From s4 e5 start",
        "msg_num": 210
    },
    {
        "title": "Dark",
        "type": "Series",
        "start_time": "17/05/2026, 4:09 pm",
        "end_time": "Open-ended",
        "status": "Started",
        "notes": "German sci-fi mystery series",
        "raw_msg": "Dark atarted",
        "msg_num": 211
    },
    {
        "title": "Europa Report (2013)",
        "type": "Movie",
        "start_time": "20/05/2026, 11:00 pm",
        "end_time": "21/05/2026, 1:51 am",
        "status": "Completed",
        "notes": "Sci-Fi thriller",
        "raw_msg": "Europa report -> Completed",
        "msg_num": "212, 213"
    },
    {
        "title": "Sunshine (2007)",
        "type": "Movie",
        "start_time": "22/05/2026, 12:04 am",
        "end_time": "22/05/2026, 11:16 pm",
        "status": "Abandoned (Dropped)",
        "notes": "Danny Boyle sci-fi film abandoned",
        "raw_msg": "Sunshine start -> Abandones",
        "msg_num": "214, 215"
    },
    {
        "title": "Vikings — Season 1 Episode 1",
        "type": "Series",
        "start_time": "22/05/2026, 11:16 pm",
        "end_time": "Open-ended",
        "status": "Resumed",
        "notes": "Historical drama series",
        "raw_msg": "Resumed vikings ep 1s1",
        "msg_num": 216
    },
    {
        "title": "The Mist (2007)",
        "type": "Movie",
        "start_time": "24/05/2026, 3:41 pm",
        "end_time": "25/05/2026, 5:22 pm",
        "status": "Completed",
        "notes": "Stephen King adaptation",
        "raw_msg": "The mist movie Star -> Complete",
        "msg_num": "222, 224"
    },
    {
        "title": "Game of Thrones — Season 2",
        "type": "Series",
        "start_time": "Pre-28/05/2026",
        "end_time": "28/05/2026, 4:29 pm",
        "status": "Completed",
        "notes": "Season 2 completed",
        "raw_msg": "Got season 2 compl",
        "msg_num": 227
    },
    {
        "title": "Game of Thrones — Season 3",
        "type": "Series",
        "start_time": "28/05/2026, 5:05 pm",
        "end_time": "Open-ended",
        "status": "Started",
        "notes": "Season 3 started",
        "raw_msg": "S3 started now",
        "msg_num": 228
    },
    {
        "title": "Lee Cronin's Mummy (Movie)",
        "type": "Movie",
        "start_time": "30/05/2026, 2:30 pm",
        "end_time": "Open-ended",
        "status": "Started",
        "notes": "Horror film",
        "raw_msg": "Lee cronins mumy start",
        "msg_num": 230
    },
    {
        "title": "From — Season 4 Episode 6",
        "type": "Series Episode",
        "start_time": "31/05/2026, 5:29 pm",
        "end_time": "31/05/2026 (~6:30-7:30 pm)",
        "status": "Completed",
        "notes": "Logged completion an hour or two before 8:23 pm",
        "raw_msg": "From s4 ep6 start -> Compl an hour or two before",
        "msg_num": "231, 232"
    },
    {
        "title": "Bhoot Bangla",
        "type": "Movie",
        "start_time": "13/06/2026, 2:14 pm",
        "end_time": "13/06/2026, 8:42 pm",
        "status": "Completed",
        "notes": "Akshay Kumar horror comedy / classic",
        "raw_msg": "Bhoot bangla start -> Completed",
        "msg_num": "249, 251"
    },
    {
        "title": "The Railway Men (2023)",
        "type": "Miniseries",
        "start_time": "13/06/2026, 9:27 pm",
        "end_time": "14/06/2026, 2:34 pm",
        "status": "Completed",
        "notes": "Bhopal disaster drama series",
        "raw_msg": "Railway men stat -> Comp",
        "msg_num": "252, 254"
    },
    {
        "title": "From — Season 4 Episode 8",
        "type": "Series Episode",
        "start_time": "14/06/2026, 3:09 pm",
        "end_time": "14/06/2026",
        "status": "Started",
        "notes": "Episode 8 start",
        "raw_msg": "From s4 e8 start",
        "msg_num": 255
    },
    {
        "title": "Aşk-ı Memnu (Ishq-e-Mamnoo)",
        "type": "Turkish Drama Series",
        "start_time": "18/06/2026, 11:35 pm",
        "end_time": "Open-ended",
        "status": "Started",
        "notes": "Classic Turkish drama",
        "raw_msg": "Ishq e mamnu start",
        "msg_num": 262
    },
    {
        "title": "From — Season 4 Episode 9",
        "type": "Series Episode",
        "start_time": "21/06/2026, 12:59 pm",
        "end_time": "21/06/2026",
        "status": "Started",
        "notes": "Episode 9 start",
        "raw_msg": "Ep9 start",
        "msg_num": 264
    },
    {
        "title": "Mandala Murders",
        "type": "Series",
        "start_time": "26/06/2026, 2:30 pm",
        "end_time": "27/06/2026, 1:09 am",
        "status": "Completed",
        "notes": "Crime thriller series",
        "raw_msg": "Mandala murders start -> Comp",
        "msg_num": "269, 270"
    },
    {
        "title": "Kohrra",
        "type": "Series",
        "start_time": "27/06/2026, 12:02 pm",
        "end_time": "27/06/2026, 1:07 pm",
        "status": "Abandoned (Dropped)",
        "notes": "Abandoned due to being in Punjabi language",
        "raw_msg": "Kohrrq statt -> Abandoned due to being in punjabi",
        "msg_num": "272, 273"
    },
    {
        "title": "Aranyak",
        "type": "Series",
        "start_time": "27/06/2026, 1:07 pm",
        "end_time": "Open-ended",
        "status": "Started",
        "notes": "Raveena Tandon mystery series",
        "raw_msg": "Aranyak statt",
        "msg_num": 274
    },
    {
        "title": "From — Season 4 Episode 10 (Finale)",
        "type": "Series Episode",
        "start_time": "28/06/2026, 12:26 pm",
        "end_time": "28/06/2026, 1:39 pm / 9:00 pm",
        "status": "Completed",
        "notes": "Season 4 finale completed",
        "raw_msg": "Ep 10 start finale -> Comol -> Compeleted",
        "msg_num": "277, 278, 279"
    },
    {
        "title": "Dahaad (2023)",
        "type": "Series",
        "start_time": "03/07/2026, 10:31 pm",
        "end_time": "Open-ended",
        "status": "Started",
        "notes": "Sonakshi Sinha / Vijay Varma crime series",
        "raw_msg": "Dahaad start",
        "msg_num": 282
    },
    {
        "title": "Testament: The Story of Moses (2024)",
        "type": "Docuseries",
        "start_time": "11/07/2026, 1:13 pm",
        "end_time": "12/07/2026, 1:00 am",
        "status": "Completed",
        "notes": "Netflix docuseries",
        "raw_msg": "Testament the story of moses Start -> Compeleted",
        "msg_num": "288, 289, 290"
    },
    {
        "title": "Raakh (Prime Video)",
        "type": "Series",
        "start_time": "12/07/2026, 11:35 am",
        "end_time": "12/07/2026, 9:41 pm",
        "status": "Completed",
        "notes": "Prime Video series",
        "raw_msg": "Raakh seeies on prime video start -> Compeleted",
        "msg_num": "291, 292"
    },
    {
        "title": "Journey to the Center of the Earth",
        "type": "Movie",
        "start_time": "13/07/2026, 12:01 am",
        "end_time": "Open-ended",
        "status": "Started on Prime Video",
        "notes": "Prime Video",
        "raw_msg": "Journey to the center of earth Start on prime",
        "msg_num": 293
    },
    {
        "title": "Pati Patni Aur Woh (Netflix)",
        "type": "Movie",
        "start_time": "14/07/2026, 9:33 pm",
        "end_time": "15/07/2026, 2:33 pm",
        "status": "Abandoned (Dropped)",
        "notes": "Dropped next afternoon",
        "raw_msg": "Patinpatni aur wo do Movie start on netdlix -> Abandon",
        "msg_num": "296, 297"
    },
    {
        "title": "Delhi Crime",
        "type": "Series",
        "start_time": "15/07/2026, 2:33 pm",
        "end_time": "Open-ended",
        "status": "Started",
        "notes": "Netflix police procedural series",
        "raw_msg": "Delhi crim. Start",
        "msg_num": 298
    },
    {
        "title": "Panchayat",
        "type": "Series",
        "start_time": "15/07/2026, 8:00 pm",
        "end_time": "Open-ended",
        "status": "Started",
        "notes": "TVF / Prime Video comedy-drama",
        "raw_msg": "Panchayat series statt",
        "msg_num": 299
    },
    {
        "title": "Mardaani / Mardaani 3",
        "type": "Movie",
        "start_time": "15/07/2026, 10:03 pm",
        "end_time": "Open-ended",
        "status": "Listed / Watched",
        "notes": "Rani Mukerji crime action film",
        "raw_msg": "Mardanin 3",
        "msg_num": 301
    },
    {
        "title": "Drishyam 2",
        "type": "Movie",
        "start_time": "17/07/2026, 10:38 pm",
        "end_time": "Open-ended",
        "status": "Listed / Watched",
        "notes": "Ajay Devgn thriller",
        "raw_msg": "Drishyam 2",
        "msg_num": 305
    },
    {
        "title": "Friends",
        "type": "Sitcom Series",
        "start_time": "19/07/2026, 12:54 pm",
        "end_time": "Open-ended",
        "status": "Started",
        "notes": "Classic sitcom",
        "raw_msg": "Freinds sstar",
        "msg_num": 308
    },
    {
        "title": "Cocktail (2012)",
        "type": "Movie",
        "start_time": "22/07/2026, 7:59 pm",
        "end_time": "24/07/2026, 12:54 am",
        "status": "Completed",
        "notes": "Saif Ali Khan / Deepika Padukone",
        "raw_msg": "Cocktail movie start -> Comple",
        "msg_num": "315, 316"
    },
    {
        "title": "Musafir Cafe",
        "type": "Book / Audio / Media",
        "start_time": "24/07/2026, 10:55 pm",
        "end_time": "Open-ended",
        "status": "Started",
        "notes": "Divya Prakash Dubey story",
        "raw_msg": "Musafir cafe atart",
        "msg_num": 318
    },
    {
        "title": "Raat Akeli Hai (2020)",
        "type": "Movie",
        "start_time": "25/07/2026, 7:37 pm",
        "end_time": "Open-ended",
        "status": "Started",
        "notes": "Nawazuddin Siddiqui mystery thriller",
        "raw_msg": "Rat akeli he Fstart",
        "msg_num": "319, 320"
    },
    {
        "title": "The Walking Dead: Dead City — Season 3 Episode 1",
        "type": "Series Episode",
        "start_time": "26/07/2026, 1:39 pm",
        "end_time": "26/07/2026, 3:29 pm",
        "status": "Completed",
        "notes": "Zombie spinoff episode",
        "raw_msg": "The walking dead dead city s3 ep 1 -> Compel",
        "msg_num": "322, 324"
    },
    {
        "title": "Kartavya",
        "type": "Series / Media",
        "start_time": "26/07/2026, 9:05 pm",
        "end_time": "27/07/2026, 2:09 am",
        "status": "Completed",
        "notes": "Resumed & finished",
        "raw_msg": "Kartavya reusme -> Comple",
        "msg_num": "325, 326"
    },
    {
        "title": "I Will Find You",
        "type": "Book / Media",
        "start_time": "31/07/2026, 1:13 pm",
        "end_time": "Open-ended",
        "status": "Listed",
        "notes": "Harlan Coben title",
        "raw_msg": "I will find you",
        "msg_num": 330
    },
    {
        "title": "Shehr-e-Zaat",
        "type": "Pakistani Drama",
        "start_time": "01/08/2026, 12:30 am",
        "end_time": "Open-ended",
        "status": "Started",
        "notes": "Mahira Khan spiritual drama",
        "raw_msg": "Sheher e zaat start Dram",
        "msg_num": "331, 332"
    },
    {
        "title": "Spider-Man (2002)",
        "type": "Movie",
        "start_time": "08/08/2026, 1:18 pm",
        "end_time": "09/08/2026, 4:58 pm",
        "status": "Completed",
        "notes": "Tobey Maguire / Sam Raimi",
        "raw_msg": "Spiderman 2002 start -> Completed",
        "msg_num": "333, 334"
    },
    {
        "title": "Spider-Man 2 (2004)",
        "type": "Movie",
        "start_time": "09/08/2026, 8:07 pm",
        "end_time": "13/08/2026, 1:45 am",
        "status": "Completed",
        "notes": "Tobey Maguire / Sam Raimi sequel",
        "raw_msg": "Spiderman 2 start -> Compeleted",
        "msg_num": "335, 339"
    },
    {
        "title": "O Rangreza",
        "type": "Pakistani Drama",
        "start_time": "13/08/2026, 11:01 pm",
        "end_time": "Open-ended",
        "status": "Started",
        "notes": "Sajal Aly / Bilal Abbas drama",
        "raw_msg": "O rangreza start",
        "msg_num": 340
    },
    {
        "title": "The Last House on the Left",
        "type": "Movie",
        "start_time": "14/08/2026, 12:25 am",
        "end_time": "14/08/2026, 12:50 pm",
        "status": "Completed",
        "notes": "Horror thriller",
        "raw_msg": "The last house atart -> Comp",
        "msg_num": "341, 342"
    },
    {
        "title": "Main Wapis Aaunga",
        "type": "Movie / Drama",
        "start_time": "14/08/2026, 7:58 pm",
        "end_time": "15/08/2026, 2:19 pm",
        "status": "Completed",
        "notes": "Drama / film",
        "raw_msg": "Mein wapis aunga statt -> Compeleted",
        "msg_num": "343, 344"
    },
    {
        "title": "Ikka (2024)",
        "type": "Movie",
        "start_time": "15/08/2026, 3:46 pm",
        "end_time": "15/08/2026, 7:31 pm",
        "status": "Completed",
        "notes": "Film completed in same evening",
        "raw_msg": "Ikka movie start -> Completed",
        "msg_num": "345, 346"
    },
    {
        "title": "Kafeel",
        "type": "Drama / Media",
        "start_time": "Pre-21/08/2026",
        "end_time": "21/08/2026, 8:22 pm",
        "status": "Completed",
        "notes": "Completed",
        "raw_msg": "Kafeel completed",
        "msg_num": 348
    },
    {
        "title": "Sang-e-Mar Mar",
        "type": "Pakistani Drama",
        "start_time": "22/08/2026, 12:28 pm",
        "end_time": "Open-ended",
        "status": "Started",
        "notes": "Tribal family drama",
        "raw_msg": "Sang e mar mar start",
        "msg_num": 349
    },
    {
        "title": "Ishq Murshid",
        "type": "Pakistani Drama",
        "start_time": "23/08/2026, 12:51 am",
        "end_time": "23/08/2026, 2:28 pm",
        "status": "Abandoned (Dropped)",
        "notes": "Dropped: 'Left these'",
        "raw_msg": "Ishq murshad statt -> Left these",
        "msg_num": "350, 351"
    },
    {
        "title": "Yakeen Ka Safar",
        "type": "Pakistani Drama",
        "start_time": "23/08/2026, 2:28 pm",
        "end_time": "Open-ended",
        "status": "Started",
        "notes": "Ahad Raza Mir / Sajal Aly drama",
        "raw_msg": "Started yakeen jansafar",
        "msg_num": 352
    },
    {
        "title": "Bin Roye",
        "type": "Pakistani Drama",
        "start_time": "23/08/2026, 5:00 pm",
        "end_time": "Open-ended",
        "status": "Started",
        "notes": "Humayun Saeed / Mahira Khan drama",
        "raw_msg": "Bin roye start",
        "msg_num": 353
    },
    {
        "title": "Supernatural",
        "type": "Series",
        "start_time": "23/08/2026, 11:50 pm",
        "end_time": "27/08/2026, 12:15 am",
        "status": "Completed (Season/Session)",
        "notes": "Sci-fi horror series session",
        "raw_msg": "Supernatural start -> Completed",
        "msg_num": "354, 356"
    },
    {
        "title": "Hum Kahan Ke Sachay Thay",
        "type": "Pakistani Drama",
        "start_time": "31/08/2026, 9:58 pm",
        "end_time": "Open-ended",
        "status": "Started (2nd Watch)",
        "notes": "Second watch logged",
        "raw_msg": "Hum kahan kay saxhy thay Started . Sexond watch",
        "msg_num": 357
    },
    {
        "title": "Iron Man (2008)",
        "type": "MCU Movie (Phase 1)",
        "start_time": "02/09/2026, 2:45 pm",
        "end_time": "04/09/2026, 12:21 pm",
        "status": "Completed",
        "notes": "MCU Marathon start",
        "raw_msg": "Ironnman start 2008 -> Completed",
        "msg_num": "358, 359"
    },
    {
        "title": "Iron Man 2 (2010)",
        "type": "MCU Movie (Phase 1)",
        "start_time": "04/09/2026, 1:31 pm",
        "end_time": "05/09/2026, 1:20 am",
        "status": "Completed",
        "notes": "MCU Phase 1",
        "raw_msg": "IRon man 2 Start -> Completed",
        "msg_num": "360, 361, 362"
    },
    {
        "title": "Thor (2011)",
        "type": "MCU Movie (Phase 1)",
        "start_time": "05/09/2026, 11:12 am",
        "end_time": "05/09/2026, 5:57 pm",
        "status": "Completed",
        "notes": "MCU Phase 1",
        "raw_msg": "Thor 2011 start -> Competed",
        "msg_num": "363, 364"
    },
    {
        "title": "Captain America: The First Avenger (2011)",
        "type": "MCU Movie (Phase 1)",
        "start_time": "05/09/2026, 6:23 pm",
        "end_time": "06/09/2026, 3:03 pm",
        "status": "Completed",
        "notes": "MCU Phase 1",
        "raw_msg": "Captain america , the firs tavenger start -> Completed",
        "msg_num": "365, 366"
    },
    {
        "title": "The Avengers (2012)",
        "type": "MCU Movie (Phase 1)",
        "start_time": "06/09/2026, 3:15 pm",
        "end_time": "06/09/2026, 6:30 pm",
        "status": "Paused ('Took break from marvel')",
        "notes": "Switched temporarily to YOU series",
        "raw_msg": "Thw avengers started -> Took break from marvel",
        "msg_num": "367, 368"
    },
    {
        "title": "YOU — Season 1 (Netflix)",
        "type": "Series",
        "start_time": "06/09/2026, 6:31 pm",
        "end_time": "11/09/2026, 6:32 pm",
        "status": "Completed",
        "notes": "Full Season 1 watched during Marvel break",
        "raw_msg": "You series started season 1 -> Seaosn 1 complete",
        "msg_num": "369, 372"
    },
    {
        "title": "Godzilla (2014)",
        "type": "Movie",
        "start_time": "10/09/2026, 12:33 am",
        "end_time": "12/09/2026, 2:50 am",
        "status": "Completed",
        "notes": "MonsterVerse film",
        "raw_msg": "Godzilla 2014 start -> Completed",
        "msg_num": "371, 373"
    },
    {
        "title": "Iron Man 3 (2013)",
        "type": "MCU Movie (Phase 2)",
        "start_time": "12/09/2026, 11:12 am",
        "end_time": "12/09/2026, 3:49 pm",
        "status": "Completed",
        "notes": "MCU Phase 2 start",
        "raw_msg": "Iron man 3 starat -> Completed",
        "msg_num": "374, 375"
    },
    {
        "title": "Thor: The Dark World (2013)",
        "type": "MCU Movie (Phase 2)",
        "start_time": "12/09/2026, 4:15 pm",
        "end_time": "13/09/2026, 12:28 am",
        "status": "Completed",
        "notes": "MCU Phase 2",
        "raw_msg": "Thor the dark world statte -> Completed",
        "msg_num": "376, 377"
    },
    {
        "title": "Guardians of the Galaxy (2014)",
        "type": "MCU Movie (Phase 2)",
        "start_time": "13/09/2026, 12:40 am",
        "end_time": "13/09/2026, 3:39 pm",
        "status": "Completed",
        "notes": "MCU Phase 2",
        "raw_msg": "Guardians of galaxy 2014 start -> Completed",
        "msg_num": "378, 379"
    },
    {
        "title": "Captain America: The Winter Soldier (2014)",
        "type": "MCU Movie (Phase 2)",
        "start_time": "13/09/2026, 4:12 pm",
        "end_time": "14/09/2026, 1:37 am",
        "status": "Completed",
        "notes": "MCU Phase 2",
        "raw_msg": "Captain america the winter soldiar start -> Completed",
        "msg_num": "380, 381"
    },
    {
        "title": "Avengers: Age of Ultron (2015)",
        "type": "MCU Movie (Phase 2)",
        "start_time": "14/09/2026, 8:51 pm",
        "end_time": "16/09/2026, 8:51 pm",
        "status": "Completed",
        "notes": "MCU Phase 2",
        "raw_msg": "Avengers age of ultron start -> Completed",
        "msg_num": "384, 385"
    },
    {
        "title": "Ant-Man (2015)",
        "type": "MCU Movie (Phase 2)",
        "start_time": "16/09/2026, 9:02 pm",
        "end_time": "17/09/2026, 1:15 am",
        "status": "Completed",
        "notes": "MCU Phase 2 finale",
        "raw_msg": "Ant man 2015 start -> Completed",
        "msg_num": "386, 387"
    },
    {
        "title": "Captain America: Civil War (2016)",
        "type": "MCU Movie (Phase 3)",
        "start_time": "17/09/2026, 6:03 pm",
        "end_time": "18/09/2026, 5:16 pm",
        "status": "Completed",
        "notes": "MCU Phase 3 start",
        "raw_msg": "Captain america civil war started -> Completed",
        "msg_num": "388, 389"
    },
    {
        "title": "Doctor Strange (2016)",
        "type": "MCU Movie (Phase 3)",
        "start_time": "18/09/2026, 6:12 pm",
        "end_time": "19/09/2026, 12:52 pm",
        "status": "Completed",
        "notes": "MCU Phase 3",
        "raw_msg": "Doctor strange start -> Completed",
        "msg_num": "390, 391"
    },
    {
        "title": "Monsters / Lizzie Borden (Netflix)",
        "type": "Netflix Series",
        "start_time": "19/09/2026, 2:44 pm",
        "end_time": "19/09/2026, 6:04 pm",
        "status": "Abandoned (Dropped)",
        "notes": "Watched 6 episodes and abandoned",
        "raw_msg": "Monstwr lozzie bordans s5art netflix serie -> Watched 6 epi , abandoened",
        "msg_num": "393, 395"
    },
    {
        "title": "Guardians of the Galaxy Vol. 2 (2017)",
        "type": "MCU Movie (Phase 3)",
        "start_time": "19/09/2026, 7:35 pm (re-started)",
        "end_time": "20/09/2026, 12:44 am",
        "status": "Completed",
        "notes": "MCU Phase 3",
        "raw_msg": "Guardians of galazy vol 2 start -> Started now -> Completed",
        "msg_num": "392, 396, 397"
    },
    {
        "title": "Thor: Ragnarok (2017)",
        "type": "MCU Movie (Phase 3)",
        "start_time": "20/09/2026, 10:39 am",
        "end_time": "20/09/2026, 2:18 pm",
        "status": "Completed",
        "notes": "MCU Phase 3",
        "raw_msg": "Thor Ragnarok starr -> Completed",
        "msg_num": "398, 399"
    },
    {
        "title": "Black Panther (2018)",
        "type": "MCU Movie (Phase 3)",
        "start_time": "20/09/2026, 2:29 pm",
        "end_time": "20/09/2026, 6:48 pm",
        "status": "Completed",
        "notes": "MCU Phase 3",
        "raw_msg": "Black panther 2018 stat -> Competed",
        "msg_num": "400, 401"
    },
    {
        "title": "Avengers: Infinity War (2018)",
        "type": "MCU Movie (Phase 3)",
        "start_time": "20/09/2026, 7:16 pm",
        "end_time": "21/09/2026, 12:23 am",
        "status": "Completed",
        "notes": "MCU Phase 3 blockbuster",
        "raw_msg": "Avengers infinity war started -> Completed",
        "msg_num": "402, 404"
    },
    {
        "title": "Ant-Man and the Wasp (2018)",
        "type": "MCU Movie (Phase 3)",
        "start_time": "21/09/2026, 12:41 am",
        "end_time": "21/09/2026, 12:20 pm",
        "status": "Completed",
        "notes": "MCU Phase 3",
        "raw_msg": "Ant man and the wasp Started -> Completed",
        "msg_num": "405, 406, 408"
    },
    {
        "title": "Captain Marvel (2019)",
        "type": "MCU Movie (Phase 3)",
        "start_time": "21/09/2026, 12:32 pm",
        "end_time": "21/09/2026, 4:52 pm",
        "status": "Completed",
        "notes": "MCU Phase 3",
        "raw_msg": "Captain marvel 2019 startd -> Stared now -> Completed",
        "msg_num": "409, 410, 411"
    },
    {
        "title": "Avengers: Endgame (2019)",
        "type": "MCU Movie (Phase 3)",
        "start_time": "21/09/2026, 4:54 pm",
        "end_time": "21/09/2026, 10:12 pm",
        "status": "Completed",
        "notes": "MCU Infinity Saga Climax",
        "raw_msg": "End game started -> Completed",
        "msg_num": "412, 413"
    },
    {
        "title": "The Guardians of the Galaxy Holiday Special (2022)",
        "type": "MCU Special (Phase 4)",
        "start_time": "22/09/2026, 1:24 am",
        "end_time": "22/09/2026, 11:11 am",
        "status": "Completed",
        "notes": "MCU Holiday Special",
        "raw_msg": "Guardians of galaxy hpldiay version start -> Completed",
        "msg_num": "414, 415"
    },
    {
        "title": "Ant-Man and the Wasp: Quantumania (2023)",
        "type": "MCU Movie (Phase 5)",
        "start_time": "22/09/2026, 11:23 am",
        "end_time": "22/09/2026, 4:27 pm",
        "status": "Completed",
        "notes": "MCU Phase 5 start",
        "raw_msg": "Ant man quantumania started -> Completed",
        "msg_num": "416, 417"
    },
    {
        "title": "Guardians of the Galaxy Vol. 3 (2023)",
        "type": "MCU Movie (Phase 5)",
        "start_time": "22/09/2026, 6:01 pm",
        "end_time": "22/09/2026, 11:26 pm",
        "status": "Completed",
        "notes": "James Gunn MCU trilogy finale",
        "raw_msg": "Guardians of the galaxy vol 3 started -> Completed",
        "msg_num": "418, 419"
    }
]

# Write MEDIA_WATCH_LOG.md
with open('MEDIA_WATCH_LOG.md', 'w', encoding='utf-8') as f:
    f.write("# 🎬 Lore Archive — Media & Watch Log\n\n")
    f.write("> **Source**: WhatsApp Chat Export (+92 310 4515488)\n")
    f.write("> **Total Logged Entries**: {}\n\n".format(len(media_entries)))
    
    f.write("## 📊 Summary Overview\n\n")
    completed_count = sum(1 for e in media_entries if 'Completed' in e['status'])
    started_count = sum(1 for e in media_entries if 'Started' in e['status'] or 'Resumed' in e['status'])
    abandoned_count = sum(1 for e in media_entries if 'Abandoned' in e['status'])
    open_count = sum(1 for e in media_entries if 'Listed' in e['status'] or 'Planned' in e['status'] or 'Watchlist' in e['status'] or 'Open-ended' in e['status'])
    
    f.write(f"- **Completed**: {completed_count}\n")
    f.write(f"- **In Progress / Started**: {started_count}\n")
    f.write(f"- **Abandoned / Dropped**: {abandoned_count}\n")
    f.write(f"- **Listed / Watchlist**: {open_count}\n\n")
    
    f.write("---\n\n")
    f.write("## 🎞️ Chronological Watch History\n\n")
    f.write("| # | Title | Category | Start Timestamp | Completion Timestamp | Status | Notes / Context |\n")
    f.write("|---|-------|----------|-----------------|----------------------|--------|-----------------|\n")
    
    for i, e in enumerate(media_entries, 1):
        status_badge = e['status']
        if 'Completed' in e['status']:
            status_badge = f"✅ **{e['status']}**"
        elif 'Abandoned' in e['status']:
            status_badge = f"❌ *{e['status']}*"
        elif 'Started' in e['status'] or 'Resumed' in e['status']:
            status_badge = f"⏳ **{e['status']}**"
        else:
            status_badge = f"📌 {e['status']}"
            
        f.write(f"| {i} | **{e['title']}** | {e['type']} | {e['start_time']} | {e['end_time']} | {status_badge} | {e['notes']} (Msg {e['msg_num']}) |\n")
        
    f.write("\n---\n\n")
    f.write("## 🦸 Special Focus: Marvel Cinematic Universe (MCU) Marathon (Sept 2026)\n\n")
    f.write("| Film / Release | Start Timestamp | Completion Timestamp | Duration / Turnaround |\n")
    f.write("|----------------|-----------------|----------------------|-----------------------|\n")
    mcu_films = [e for e in media_entries if 'MCU' in e['type']]
    for m in mcu_films:
        f.write(f"| **{m['title']}** | {m['start_time']} | {m['end_time']} | {m['status']} |\n")

print(f"Generated MEDIA_WATCH_LOG.md with {len(media_entries)} entries.")
