import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const res = await fetch("https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_squads", {
      next: { revalidate: 3600 }
    });
    const html = await res.text();
    const $ = cheerio.load(html);

    const players: any[] = [];

    $('.sortable').each((i, table) => {
      const h3 = $(table).prevAll('h3, .mw-heading3').first();
      if (h3.length > 0) {
        let teamName = h3.text().trim();
        if (teamName === 'References' || teamName === 'External links' || teamName === 'Player representation') return;
        
        teamName = teamName.replace(/\[.*?\]/g, '').trim();
        if (teamName === 'United States') teamName = 'USA';
        
        let teamId = teamName.substring(0, 3).toLowerCase();
        if (teamName === 'South Africa') teamId = 'rsa';
        else if (teamName === 'South Korea') teamId = 'kor';
        else if (teamName === 'Czech Republic') teamId = 'cze';
        else if (teamName === 'Ivory Coast') teamId = 'civ';
        else if (teamName === 'Costa Rica') teamId = 'crc';
        else if (teamName === 'Saudi Arabia') teamId = 'ksa';
        else if (teamName === 'Switzerland') teamId = 'sui';
        else if (teamName === 'Netherlands') teamId = 'ned';
        else if (teamName === 'Japan') teamId = 'jpn';
        else if (teamName === 'Iran') teamId = 'irn';
        else if (teamName === 'Cameroon') teamId = 'cmr';
        else if (teamName === 'New Zealand') teamId = 'nzl';
        else if (teamName === 'Cape Verde') teamId = 'cpv';
        else if (teamName === 'Equatorial Guinea') teamId = 'eqg';

        $(table).find('tr').each((j, tr) => {
          if (j === 0) return; // header row
          const tds = $(tr).find('td, th');
          if (tds.length >= 5) {
            const no = $(tds[0]).text().trim();
            const pos = $(tds[1]).text().trim();
            
            const playerTd = $(tds[2]);
            const playerAnchor = playerTd.find('a').first();
            let name = '';
            let url = '';
            if (playerAnchor.length > 0) {
              name = playerAnchor.text().trim();
              url = 'https://en.wikipedia.org' + playerAnchor.attr('href');
            } else {
              name = playerTd.text().trim().replace(/\[.*?\]/g, '');
            }
            
            // remove parenthetical info like "(captain)"
            name = name.replace(/\s*\(.*?\)\s*/g, '').trim();

            const dobAgeText = $(tds[3]).text().trim();
            const ageMatch = dobAgeText.match(/aged (\d+)/);
            const age = ageMatch ? parseInt(ageMatch[1]) : null;
            
            const capsText = $(tds[4]).text().trim();
            const caps = capsText ? parseInt(capsText) : null;
            
            const goalsText = $(tds[5]).text().trim();
            const goals = goalsText ? parseInt(goalsText) : null;
            
            const club = $(tds[tds.length - 1]).text().trim().replace(/\[.*?\]/g, '');
            
            if (name && no) {
              let positionFull = pos;
              if (pos === 'GK') positionFull = 'Goalkeeper';
              if (pos === 'DF') positionFull = 'Defender';
              if (pos === 'MF') positionFull = 'Midfielder';
              if (pos === 'FW') positionFull = 'Forward';
              
              players.push({
                id: 'p-' + name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''),
                teamId: teamId,
                name: name,
                position: positionFull,
                shirtNumber: parseInt(no) || null,
                club: club,
                age: age,
                nationality: teamName,
                isKeyPlayer: false,
                imageUrl: null,
                goals: goals,
                assists: null,
                yellowCards: null,
                redCards: null,
                appearances: caps,
                wikiUrl: url
              });
            }
          }
        });
      }
    });

    const CHUNK_SIZE = 50;
    for (let i = 0; i < players.length; i += CHUNK_SIZE) {
      const chunk = players.slice(i, i + CHUNK_SIZE);
      const titles = chunk.map((p: any) => {
        if (!p.wikiUrl) return null;
        const encoded = p.wikiUrl.split('/').pop();
        if (!encoded) return null;
        try { return decodeURIComponent(encoded); } catch(e) { return encoded; }
      }).filter(Boolean);

      if (titles.length === 0) continue;

      try {
        const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(titles.join('|'))}&prop=pageimages&format=json&pithumbsize=300`;
        const imgRes = await fetch(url);
        if (imgRes.ok) {
          const imgJson = await imgRes.json();
          if (imgJson.query && imgJson.query.pages) {
            const pages = Object.values(imgJson.query.pages) as any[];
            for (const page of pages) {
              if (page.thumbnail && page.thumbnail.source) {
                const player = chunk.find((p: any) => {
                  if (!p.wikiUrl) return false;
                  const encoded = p.wikiUrl.split('/').pop();
                  if (!encoded) return false;
                  let decoded = encoded;
                  try { decoded = decodeURIComponent(encoded); } catch(e) {}
                  return decoded.replace(/_/g, ' ') === page.title;
                });
                if (player) {
                  player.imageUrl = page.thumbnail.source;
                }
              }
            }
          }
        }
      } catch (e) {
        console.error("Failed to fetch images for chunk", e);
      }
    }

    return NextResponse.json(players);
  } catch (error) {
    console.error("Scraping failed:", error);
    return NextResponse.json({ error: "Failed to scrape Wikipedia squads" }, { status: 500 });
  }
}
