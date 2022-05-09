import requests
import bs4
import json

contents = []
contents.append("char|pinyin|definition|strokes|freqrank")

jsoncontents = []

for pagenum in range(1, 101):

    API  = "http://hanzidb.org/character-list/by-frequency?page={pagenum}".format(pagenum = pagenum)
    r    = requests.get(API)
    soup = bs4.BeautifulSoup(r.content)

    table = soup.find("table")
    rows  = table.find_all("tr")
    
    for row in rows:
        cols = row.find_all("td")
        
        try:
            char, pinyin, definition, stroke_count, freq_rank = cols[0].text, cols[1].text, cols[2].text, cols[4].text, cols[7].text
            contents.append("{}|{}|{}|{}|{}".format(char, pinyin, definition, stroke_count, freq_rank))
            jsoncontents.append({
                "char"      : char,  
                "pinyin"    : pinyin,
                "definition": definition,
                "strokes"   : stroke_count,
                "freqrank"  : freq_rank
            })
        except:
            pass
            
with open("mapping.txt", "w", encoding="utf-8") as f:
    for line in contents:
        f.write(line)
        f.write("\n")

with open("mapping.json", "w", encoding="utf-8") as f:
    json.dump(jsoncontents, f, ensure_ascii = False)