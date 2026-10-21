#!/usr/bin/env node
/**
 * Refreshes public/holidays/vn.json from the public Google Calendar
 * "Holidays in Vietnam" feeds (vi + en). Google publishes each year's actual
 * holiday plan (incl. Tết, bridge/compensation days and new holidays such as
 * 24/11 Culture Day), which static libraries and Nager.Date lack.
 * Browsers cannot read these feeds directly (no CORS), so run this on a machine/CI and commit
 * only the JSON file: the app downloads it when the user taps "Sync holiday plan" (no rebuild).
 *   npm run holidays:update
 */
import { writeFileSync } from 'node:fs';

const FEED = (lang) =>
  `https://calendar.google.com/calendar/ical/${lang}.vietnamese%23holiday%40group.v.calendar.google.com/public/basic.ics`;

async function fetchEvents(lang) {
  const res = await fetch(FEED(lang));
  if (!res.ok) throw new Error(`Feed ${lang} failed: HTTP ${res.status}`);
  const text = (await res.text()).replace(/\r?\n[ \t]/g, ''); // unfold long lines
  const events = [];
  for (const block of text.split('BEGIN:VEVENT').slice(1)) {
    const date = block.match(/DTSTART;VALUE=DATE:(\d{4})(\d{2})(\d{2})/);
    const summary = block.match(/SUMMARY:(.*)/);
    const desc = block.match(/DESCRIPTION:(.*)/);
    if (!date || !summary) continue;
    events.push({
      date: `${date[1]}-${date[2]}-${date[3]}`,
      name: summary[1].trim().replace(/\\,/g, ','),
      // Public holidays are "Ngày lễ" / "Public holiday"; the rest are observances/working-day swaps.
      isPublic: /^(Ngày lễ(\\n|$)|Public holiday)/.test(desc?.[1]?.trim() ?? '') &&
        !/kỷ niệm|Observance/i.test(desc?.[1] ?? ''),
    });
  }
  return events.filter((e) => e.isPublic);
}

const [vi, en] = await Promise.all([fetchEvents('vi'), fetchEvents('en')]);
const enByDate = new Map(en.map((e) => [e.date, e.name]));
const holidays = vi
  .map((e) => ({ date: e.date, nameVi: e.name, nameEn: enByDate.get(e.date) ?? e.name }))
  .sort((a, b) => a.date.localeCompare(b.date));

if (holidays.length < 20) throw new Error(`Suspiciously few holidays (${holidays.length}); aborting`);

const years = [...new Set(holidays.map((h) => Number(h.date.slice(0, 4))))];
writeFileSync(
  new URL('../public/holidays/vn.json', import.meta.url),
  JSON.stringify({ source: 'Google Calendar: Holidays in Vietnam', years, holidays }, null, 2) + '\n'
);
console.log(`Wrote ${holidays.length} holidays for ${years.join(', ')}`);
