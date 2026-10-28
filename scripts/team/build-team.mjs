// Builds the agent grid on the Meet Our Team pages (EN + ES) from data/team.json.
//
//   node scripts/team/build-team.mjs          rewrite both pages
//   node scripts/team/build-team.mjs --check  exit 1 if the pages are out of date
//
// Everything between <!-- TEAM:START --> and <!-- TEAM:END --> (cards + filter chips) and between
// <!-- TEAM-SCHEMA:START --> and <!-- TEAM-SCHEMA:END --> (Person schema) is generated. Edit
// data/team.json, never the generated HTML. The card styles and the filter script live in the pages.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const TEAM_FILE = path.join(ROOT, 'data/team.json');
const SITE = 'https://healthplanmoms.com';

const PAGES = {
  en: { file: 'meet-our-team/index.html', url: SITE + '/meet-our-team/' },
  es: { file: 'es/equipo/index.html', url: SITE + '/es/equipo/' }
};

const T = {
  en: { call: 'Call', email: 'Email', story: f => `Read ${f}'s story`, callAria: f => `Call ${f}`, mailAria: f => `Email ${f}`,
        chips: { all: 'All agents', es: 'Habla español', med: 'Medicare', aca: 'ACA / Marketplace', ut: 'Utah', az: 'Arizona', tx: 'Texas' },
        showAll: 'Showing all {n} agents', showSome: 'Showing {n} of {t} agents', filter: 'Filter agents',
        none: 'No agents match that filter yet.', jobTitle: 'Licensed Insurance Agent' },
  es: { call: 'Llamar', email: 'Correo', story: f => `Conoce a ${f}`, callAria: f => `Llamar a ${f}`, mailAria: f => `Escribir a ${f}`,
        chips: { all: 'Todas', es: 'Habla español', med: 'Medicare', aca: 'ACA / Mercado', ut: 'Utah', az: 'Arizona', tx: 'Texas' },
        showAll: 'Mostrando las {n} agentes', showSome: 'Mostrando {n} de {t} agentes', filter: 'Filtrar agentes',
        none: 'Ninguna agente coincide con ese filtro.', jobTitle: 'Agente de Seguros Licenciada' }
};

// Badge on the photo: the first language other than English.
const BADGE = { Spanish: 'Habla español', Japanese: '日本語 OK', German: 'Spricht Deutsch', 'American Sign Language': 'ASL' };
const LANG_KEY = { Spanish: 'es', Japanese: 'ja', German: 'de', 'American Sign Language': 'asl' };
const LINES_ES = { Life: 'Vida', Group: 'Grupal', LTC: 'Cuidado a largo plazo', 'Dental & Vision': 'Dental y visión' };
const STATE_KEY = { UT: 'ut', AZ: 'az', TX: 'tx' };

const ICON = {
  pin: '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
  globe: '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
  phone: '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.58 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
  mail: '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>'
};

const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// Bios may carry simple inline HTML from the old pages; anything else is escaped.
const safeBio = s => esc(s).replace(/&lt;(\/?)(em|strong|br)&gt;/g, '<$1$2>');
const telHref = p => '+1' + String(p || '').replace(/\D/g, '').replace(/^1(?=\d{10}$)/, '');
const stateOf = city => (String(city || '').match(/,\s*([A-Z]{2})$/) || [])[1];
const initials = n => n.split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();
const first = n => n.split(/\s+/)[0];

export function filterKeys(a) {
  const keys = [];
  for (const l of a.languages || []) if (LANG_KEY[l]) keys.push(LANG_KEY[l]);
  const lines = a.lines || [];
  if (lines.some(l => /medicare|medigap/i.test(l))) keys.push('med');
  if (lines.some(l => /^aca/i.test(l))) keys.push('aca');
  const st = stateOf(a.city);
  if (STATE_KEY[st]) keys.push(STATE_KEY[st]);
  if (/puerto rico/i.test(a.city || '')) keys.push('pr');
  return [...new Set(keys)];
}

function card(a, lang) {
  const t = T[lang], loc = a[lang] || {}, f = first(a.name);
  const lines = lang === 'es' ? (loc.lines || (a.lines || []).map(l => LINES_ES[l] || l)) : (a.lines || []);
  const badgeLang = (a.languages || []).find(l => BADGE[l]);
  const o = [];
  o.push(`            <!-- ${esc(a.name)} -->`);
  o.push(`            <article class="agent-card" data-filter="${filterKeys(a).join(' ')}" data-agent="${esc(a.id)}">`);
  o.push('                <div class="agent-photo">');
  if (a.photo) o.push(`                    <img src="${esc(a.photo)}" width="400" height="500" loading="lazy" decoding="async" alt="${esc(a.name)}" style="object-position:${esc(a.photoPosition || 'center 25%')};">`);
  else o.push(`                    <span class="agent-initials" aria-hidden="true">${esc(initials(a.name))}</span>`);
  if (badgeLang) o.push(`                    <span class="agent-badge">${ICON.globe}${esc(BADGE[badgeLang])}</span>`);
  o.push('                </div>');
  o.push('                <div class="agent-body">');
  o.push(`                    <h3 class="agent-name">${esc(a.name)}</h3>`);
  if (loc.tagline) o.push(`                    <p class="agent-tagline">${esc(loc.tagline)}</p>`);
  if (a.city) o.push(`                    <p class="agent-place">${ICON.pin}${esc(a.city)}</p>`);
  if (lines.length) o.push(`                    <p class="agent-specs">${lines.map(esc).join(' · ')}</p>`);
  o.push('                    <div class="agent-actions">');
  if (a.phone) o.push(`                        <a class="agent-btn agent-btn--call" href="tel:${telHref(a.phone)}" aria-label="${esc(t.callAria(f))}, ${esc(a.phone)}">${ICON.phone}<span>${t.call}</span></a>`);
  if (a.email) o.push(`                        <a class="agent-btn agent-btn--mail" href="mailto:${esc(a.email)}" aria-label="${esc(t.mailAria(f))}">${ICON.mail}<span>${t.email}</span></a>`);
  o.push('                    </div>');
  if (loc.bio) {
    o.push('                    <details class="agent-story">');
    o.push(`                        <summary>${esc(t.story(f))}</summary>`);
    o.push(`                        <p>${safeBio(loc.bio)}</p>`);
    o.push('                    </details>');
  }
  o.push('                </div>');
  o.push('            </article>');
  return o.join('\n');
}

export function renderGrid(team, lang) {
  const t = T[lang];
  const shown = visible(team, lang);
  const keys = new Set(shown.flatMap(filterKeys));
  const chips = Object.entries(t.chips)
    .filter(([k]) => k === 'all' || keys.has(k))
    .map(([k, label]) => `            <button type="button" class="agent-chip" data-key="${k}" aria-pressed="${k === 'all'}">${esc(label)}</button>`);
  return [
    '<!-- TEAM:START (generated from data/team.json by scripts/team/build-team.mjs; edit the JSON, not this block) -->',
    `        <div class="agent-filters" role="group" aria-label="${esc(t.filter)}" hidden>`,
    ...chips,
    '        </div>',
    `        <p class="agent-count" aria-live="polite" hidden data-all="${esc(t.showAll)}" data-some="${esc(t.showSome)}"></p>`,
    '        <div class="agent-grid">',
    ...shown.map(a => card(a, lang)),
    '        </div>',
    `        <p class="agent-empty" hidden>${esc(t.none)}</p>`,
    '        <!-- TEAM:END -->'
  ].join('\n');
}

const LANG_NAMES = { 'American Sign Language': 'American Sign Language' };
export function renderSchema(team, lang) {
  const items = visible(team, lang).map((a, i) => {
    const st = stateOf(a.city);
    const person = {
      '@type': 'Person', name: a.name, jobTitle: T[lang].jobTitle,
      worksFor: { '@type': 'InsuranceAgency', name: 'HealthPlan Moms', url: SITE },
      ...(a.phone ? { telephone: telHref(a.phone).replace(/^\+1(\d{3})(\d{3})(\d{4})$/, '+1-$1-$2-$3') } : {}),
      ...(a.email ? { email: a.email } : {}),
      ...(a.photo ? { image: a.photo.startsWith('http') ? a.photo : SITE + a.photo } : {}),
      knowsLanguage: (a.languages || ['English']).map(l => LANG_NAMES[l] || l),
      ...(a.city ? { address: st
        ? { '@type': 'PostalAddress', addressLocality: a.city.replace(/,\s*[A-Z]{2}$/, ''), addressRegion: st, addressCountry: 'US' }
        : { '@type': 'PostalAddress', addressLocality: a.city, addressCountry: 'US' } } : {})
    };
    return { '@type': 'ListItem', position: i + 1, item: person };
  });
  return '<!-- TEAM-SCHEMA:START (generated) -->\n    <script type="application/ld+json">\n'
    + JSON.stringify({ '@context': 'https://schema.org', '@type': 'ItemList', itemListElement: items }, null, 2).replace(/^/gm, '    ')
    + '\n    </script>\n    <!-- TEAM-SCHEMA:END -->';
}

function visible(team, lang) {
  const order = lang === 'es' ? 'orderEs' : 'orderEn';
  return team.filter(a => !a.hidden && !a.needsSetup).slice().sort((x, y) => (x[order] ?? 999) - (y[order] ?? 999) || x.name.localeCompare(y.name));
}

function replaceBlock(html, start, end, block, file) {
  const i = html.indexOf(start), j = html.indexOf(end);
  if (i < 0 || j < 0 || j < i) throw new Error(`${file}: markers ${start} ... ${end} not found`);
  const close = html.indexOf('-->', j) + 3;
  return html.slice(0, i) + block + html.slice(close);
}

export function buildPage(html, team, lang, file) {
  html = replaceBlock(html, '<!-- TEAM:START', '<!-- TEAM:END', renderGrid(team, lang), file);
  html = replaceBlock(html, '<!-- TEAM-SCHEMA:START', '<!-- TEAM-SCHEMA:END', renderSchema(team, lang), file);
  return html;
}

export function validate(team) {
  const errs = [], ids = new Set();
  for (const a of team) {
    if (!a.id || !a.name) errs.push(`agent without id or name: ${JSON.stringify(a).slice(0, 80)}`);
    if (ids.has(a.id)) errs.push(`duplicate id ${a.id}`);
    ids.add(a.id);
    if (!a.hidden && !a.email && !a.phone) errs.push(`${a.name}: needs an email or a phone`);
    for (const l of ['en', 'es']) for (const k of ['tagline', 'bio']) {
      const v = a[l]?.[k];
      if (v && /—/.test(v)) errs.push(`${a.name}: em dash in ${l}.${k}`);
    }
  }
  return errs;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const check = process.argv.includes('--check');
  const team = JSON.parse(readFileSync(TEAM_FILE, 'utf8'));
  const errs = validate(team);
  if (errs.length) { console.error('data/team.json problems:\n  ' + errs.join('\n  ')); process.exit(1); }
  let stale = 0;
  for (const [lang, p] of Object.entries(PAGES)) {
    const file = path.join(ROOT, p.file);
    const before = readFileSync(file, 'utf8');
    const after = buildPage(before, team, lang, p.file);
    if (before !== after) {
      stale++;
      if (!check) writeFileSync(file, after);
      console.log(`${check ? 'out of date' : 'updated'}: ${p.file}`);
    } else console.log(`unchanged: ${p.file}`);
  }
  if (check && stale) process.exit(1);
}
