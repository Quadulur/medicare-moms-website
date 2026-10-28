// Pulls the HealthPlan Moms agents from CrestPoint's agent API (which reads TBW) into data/team.json,
// then rebuilds the Meet Our Team pages.
//
//   node scripts/team/sync-team.mjs            sync + rebuild
//   node scripts/team/sync-team.mjs --dry-run  show what would change, write nothing
//   node scripts/team/sync-team.mjs --file x.json  use a saved API response instead of the network
//
// Who is on the team: the "health-plan-moms" funnel in CrestPoint (tools/funnels.json in the
// crestpoint-website repo). Add or remove a mom there, by TBW agent id.
//
// What comes from TBW (via CrestPoint) and what stays in data/team.json:
//   from TBW, whenever TBW actually has a value: photo, city, languages, English bio
//   site only (TBW has no field for these yet): Spanish bio and taglines, lines of coverage,
//     @healthplanmoms.com email, direct phone, photo framing, order on the page
// A blank in TBW never wipes what the site already shows.
//
// Safety: if the API is down, answers oddly, or returns far fewer agents than before, nothing changes.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { buildPage, validate } from './build-team.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const TEAM_FILE = path.join(ROOT, 'data/team.json');
const API = process.env.HPM_AGENTS_API || 'https://crestpointinsurance.com/api/agents?funnel=health-plan-moms';
const PAGES = { en: 'meet-our-team/index.html', es: 'es/equipo/index.html' };

const args = process.argv.slice(2);
const dry = args.includes('--dry-run');
const fileArg = args.includes('--file') ? args[args.indexOf('--file') + 1] : null;

const norm = s => String(s || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z ]/g, '').trim();
const slug = s => norm(s).replace(/\s+/g, '-');
// "Aidyl Semidey Williams" in TBW is "Aidyl Semidey" on the site: match on first name + any shared last name.
function sameName(a, b) {
  const x = norm(a).split(/\s+/), y = norm(b).split(/\s+/);
  return x[0] === y[0] && x.slice(1).some(w => y.slice(1).includes(w));
}
// CrestPoint fills empty languages with ["English"], so English alone means "TBW has nothing".
const realLanguages = l => Array.isArray(l) && l.length && !(l.length === 1 && /^english$/i.test(l[0]));
const LANG_FIX = { asl: 'American Sign Language', 'sign language': 'American Sign Language' };

async function fetchApi() {
  if (fileArg) return JSON.parse(readFileSync(fileArg, 'utf8'));
  const res = await fetch(API, { headers: { Accept: 'application/json', 'User-Agent': 'healthplanmoms-team-sync' } });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

async function main() {
  const team = JSON.parse(readFileSync(TEAM_FILE, 'utf8'));
  let body;
  try { body = await fetchApi(); }
  catch (e) { console.log(`No changes: could not read the agent API (${e.message}).`); return; }

  const agents = Array.isArray(body?.agents) ? body.agents : null;
  if (!agents || !String(body.source || '').startsWith('tbw') || !body.funnel) {
    console.log(`No changes: unexpected API answer (source ${body?.source}, funnel ${!!body?.funnel}).`);
    return;
  }
  const linkedBefore = team.filter(a => a.tbwId && !a.hidden).length;
  if (linkedBefore >= 3 && agents.length < linkedBefore / 2) {
    console.log(`No changes: API returned ${agents.length} agents, ${linkedBefore} were linked. Looks like an outage.`);
    return;
  }

  const log = [];
  const missing = new Set((body.funnel.missing || []).map(String)); // in the funnel but not in TBW's feed right now
  const seen = new Set();

  for (const api of agents) {
    const id = String(api.id);
    seen.add(id);
    let a = team.find(t => String(t.tbwId) === id);
    if (!a) {
      a = team.find(t => !t.tbwId && sameName(t.name, api.displayName));
      if (a) { a.tbwId = id; log.push(`linked ${a.name} to TBW agent ${id} (${api.displayName})`); }
    }
    if (!a) {
      a = { id: slug(api.firstName || api.displayName.split(' ')[0]) || 'agent-' + id, tbwId: id, name: api.displayName,
            languages: ['English'], lines: [], en: {}, es: {}, orderEn: 900, orderEs: 900,
            hidden: true, needsSetup: true };
      if (team.some(t => t.id === a.id)) a.id += '-' + id;
      team.push(a);
      log.push(`new: ${a.name} (TBW ${id}) joined the funnel. Hidden until their email or phone, lines and bios are filled in data/team.json and "needsSetup" is removed`);
    }
    if (a.hidden && !a.needsSetup) { delete a.hidden; log.push(`${a.name} is back in the funnel, showing again`); }

    const set = (key, val, label) => {
      if (val == null || val === '' || JSON.stringify(a[key]) === JSON.stringify(val)) return;
      log.push(`${a.name}: ${label} ${JSON.stringify(a[key] ?? null)} -> ${JSON.stringify(val)}`);
      a[key] = val;
    };
    if (api.photoUrl) set('photo', api.photoUrl, 'photo');
    if (api.city && api.homeState) set('city', `${api.city}, ${api.homeState}`, 'city');
    if (realLanguages(api.languages)) set('languages', api.languages.map(l => LANG_FIX[l.toLowerCase()] || l), 'languages');
    if (api.bio && api.bio !== a.en?.bio) {
      log.push(`${a.name}: English bio updated from TBW (check the Spanish bio still matches)`);
      a.en = { ...(a.en || {}), bio: api.bio };
    }
    if (!a.email && api.email) set('email', api.email, 'email');
    if (!a.phone && api.phone) set('phone', api.phone, 'phone');
  }

  // Linked agents that are no longer in the funnel at all were taken off the team in CrestPoint: hide them.
  // (In the funnel but missing from TBW's feed is treated as temporary; they keep showing.)
  for (const a of team) {
    if (!a.tbwId || a.hidden) continue;
    const id = String(a.tbwId);
    if (seen.has(id)) continue;
    if (missing.has(id)) { log.push(`warning: ${a.name} (TBW ${id}) is in the funnel but missing from TBW's feed; still showing`); continue; }
    a.hidden = true;
    log.push(`${a.name} (TBW ${id}) was removed from the funnel: hidden on the site`);
  }

  const unlinked = team.filter(a => !a.tbwId && !a.hidden).map(a => a.name);
  if (unlinked.length) log.push(`not linked to TBW yet (site data only): ${unlinked.join(', ')}`);

  const errs = validate(team);
  if (errs.length) { console.log('No changes: data/team.json would be invalid:\n  ' + errs.join('\n  ')); process.exitCode = 1; return; }

  console.log(log.length ? log.join('\n') : 'Nothing to change.');
  if (dry) { console.log('(dry run, nothing written)'); return; }

  const json = JSON.stringify(team, null, 2) + '\n';
  if (json !== readFileSync(TEAM_FILE, 'utf8')) writeFileSync(TEAM_FILE, json);
  for (const [lang, file] of Object.entries(PAGES)) {
    const p = path.join(ROOT, file), before = readFileSync(p, 'utf8');
    const after = buildPage(before, team, lang, file);
    if (after !== before) { writeFileSync(p, after); console.log(`rebuilt ${file}`); }
  }
}

main().catch(e => { console.error(e); process.exitCode = 1; });
