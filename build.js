const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, 'wedding-data.json');
const htmlPath = path.join(__dirname, 'index.html');

try {
    const weddingData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    let html = fs.readFileSync(htmlPath, 'utf8');

    // === Helpers ===
    const escapeHtml = (str) => {
        if (!str) return '';
        return str.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    };

    // Extract Data
    const groomName = weddingData.couple.groom.name;
    const brideName = weddingData.couple.bride.name;
    const groomFirst = groomName.split(' ')[0];
    const brideFirst = brideName.split(' ')[0];
    const date = weddingData.wedding.displayDate;
    const inviteText = weddingData.messages.inviteText;
    const websiteUrl = weddingData.websiteUrl || '#';

    // Format Parents Names
    const gParents = `${weddingData.couple.groom.parents.father}<br>&<br>${weddingData.couple.groom.parents.mother}`;
    const bParents = `${weddingData.couple.bride.parents.father}<br>&<br>${weddingData.couple.bride.parents.mother}`;

    // === 1. Meta Tags ===
    const title = `${groomFirst} Weds ${brideFirst} | A Royal Wedding Invite`;
    const desc = `${inviteText} Join us on ${date}.`;
    const imageAlt = `${groomFirst} & ${brideFirst} Wedding Invitation`;

    html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
    html = html.replace(/<meta\s+name="description"\s+content="[^"]*">/i, `<meta name="description" content="${escapeHtml(desc)}">`);
    html = html.replace(/<meta\s+name="keywords"\s+content="[^"]*">/i, `<meta name="keywords" content="wedding invitation, ${groomFirst}, ${brideFirst}, royal wedding, wedding celebration">`);
    html = html.replace(/<meta\s+name="author"\s+content="[^"]*">/i, `<meta name="author" content="${groomFirst} & ${brideFirst}">`);

    const metaMap = {
        'og:title': title,
        'og:url': websiteUrl,
        'og:description': desc,
        'og:site_name': `${groomFirst} & ${brideFirst} Wedding`,
        'og:image:alt': imageAlt,
        'twitter:title': title,
        'twitter:url': websiteUrl,
        'twitter:description': desc,
        'twitter:image:alt': imageAlt
    };

    Object.keys(metaMap).forEach(key => {
        const val = escapeHtml(metaMap[key]);
        const attr = key.startsWith('og:') ? 'property' : 'name';
        const regex = new RegExp(`<meta\\s+[^>]*${attr}="${key}"[^>]*>`, 'gi');
        const newTag = `<meta ${attr}="${key}" content="${val}">`;
        if (regex.test(html)) {
            html = html.replace(regex, newTag);
        }
    });

    const imageUrl = `${websiteUrl.replace(/\/$/, '')}/assets/images/social-share.jpg`;
    html = html.replace(/<meta\s+property="og:image"\s+content="[^"]*">/i, `<meta property="og:image" content="${imageUrl}">`);
    html = html.replace(/<meta\s+name="twitter:image"\s+content="[^"]*">/i, `<meta name="twitter:image" content="${imageUrl}">`);

    // === 2. Content Injection ===
    const replaceText = (cls, text) => {
        const regex = new RegExp(`(<[^>]+class=["'](?:[^"']*\\s+)?${cls}(?:\\s+[^"']*)?["'][^>]*>)[\\s\\S]*?(<\\/[^>]+>)`, 'i');
        if (regex.test(html)) {
            html = html.replace(regex, `$1${text}$2`);
        }
    };

    replaceText('groom-name', groomName);
    replaceText('bride-name', brideName);
    replaceText('date-text', date);
    replaceText('invite-text', inviteText);
    replaceText('grooms-parents-name', gParents);
    replaceText('brides-parents-name', bParents);
    replaceText('bride-groom-title', `${groomName}<br>&<br>${brideName}`);
    replaceText('couple-quote', weddingData.messages.coupleQuote);
    replaceText('end-title', `${groomFirst} & ${brideFirst}`);
    replaceText('footer-thank-you', weddingData.messages.thankYou);
    replaceText('footer-hashtag', weddingData.couple.hashtag);

    // === 3. Links ===
    // === 3. Links & Route ===
    // Re-generate the entire Route section to support multiple locations side-by-side
    const routeItemsHtml = weddingData.celebrations
        .filter(c => c.googleMapsUrl && c.showLocation)
        .map(c => `
                        <div class="route-item" style="flex: 1; min-width: 280px; max-width: 400px; display: flex; flex-direction: column; align-items: center; gap: 1rem;">
                            <div class="map-visual-wrapper" style="width: 100%; padding: 0.5rem; background: #fff3db; border-radius: 18px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
                                <img src="${c.mapImage}" alt="${c.name} Map" style="width: 100%; height: auto; border-radius: 12px; display: block;">
                            </div>
                            <a href="${c.googleMapsUrl}" class="btn-primary" target="_blank">
                                <span class="btn-text">Get Directions</span>
                            </a>
                        </div>`).join('\n');

    const newRouteSection = `<section id="route" class="pathway-section fade-in">
                <div class="container">
                    <h2 class="section-title">See The Route</h2>
                    <div class="route-grid" style="display: flex; flex-wrap: wrap; justify-content: center; gap: 4rem; margin-top: 2rem; width: 100%;">
${routeItemsHtml}
                    </div>
                </div>
            </section>`;

    const routeRegex = /<section id="route"[\s\S]*?<\/section>/i;
    html = html.replace(routeRegex, newRouteSection);

    if (weddingData.contact.instagram) {
        html = html.replace(
            /(<a\s+href=")[^"]*("\s+class="footer-link"\s+target="_blank">Instagram<\/a>)/i,
            `$1${weddingData.contact.instagram}$2`
        );
    }

    // === 4. Events Section ===
    const cardsHtml = weddingData.celebrations.map(event => `
                        <div class="event-card${event.highlight ? ' highlight-card' : ''}">
                            <div class="card-inner">
                                <h3>${event.name}</h3>
                                <p class="date">${event.date}</p>
                                <p class="time">${event.time}</p>
                                <p class="venue">${event.venue}</p>
                            </div>
                        </div>`).join('\n');

    const newEventsSection = `<section id="events" class="pathway-section fade-in">
                <div class="container">
                    <h2 class="section-title" style="margin-top: 5rem;">The Celebrations</h2>
                    <div class="cards-grid">
${cardsHtml}
                    </div>
                </div>
            </section>`;
    const eventsRegex = /<section id="events"[\s\S]*?<\/section>/i;
    html = html.replace(eventsRegex, newEventsSection);

    // === 5. Scripts Cleaning & Data Injection ===
    // Remove data-loader.js reference if it exists
    // html = html.replace(/<script src="data-loader.js"><\/script>\s*/, '');

    // Inject window.weddingData JSON
    // We look for where to insert it. A good place is before the main scripts at the bottom.
    // Use a unique ID to allow replacing it in future builds
    const dataScript = `<script id="wedding-data-script">window.weddingData = ${JSON.stringify(weddingData)};</script>`;

    if (html.includes('id="wedding-data-script"')) {
        // Replace existing script tag - use [\s\S] and handle potential attributes/newlines
        html = html.replace(/<script[^>]*id="wedding-data-script"[^>]*>[\s\S]*?<\/script>/i, dataScript);
    } else {
        // Insert before script.js for the first time
        html = html.replace(/(<script src="script.js"><\/script>)/, `${dataScript}\n    $1`);
    }

    // Clean up accumulated whitespace around the events section if any
    // This regex looks for multiple newlines before the section tag and collapses them
    // html = html.replace(/(\n\s*){2,}<section id="events"/g, '\n            <section id="events"');

    // Write back
    fs.writeFileSync(htmlPath, html);
    console.log('Build complete: index.html fully populated.');

} catch (e) {
    console.error('Build Failed:', e);
    process.exit(1);
}
