import { supabase } from '../config/supabase.js';

// Report days run midnight to midnight India time (UTC+5:30, no daylight saving).
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export async function recordVisit({ visitorId, path }) {
  const { error } = await supabase.from('site_visits').insert({ visitor_id: visitorId, path });
  if (error) throw new Error(`Supabase: ${error.message}`);
}

async function stats(from, to) {
  const { data, error } = await supabase.rpc('visit_stats', {
    from_ts: from.toISOString(),
    to_ts: to.toISOString(),
  });
  if (error) throw new Error(`Supabase: ${error.message}`);
  return data;
}

// Stats for yesterday (India time) and the 7 and 30 days ending with it.
export async function getDailyReport(now = new Date()) {
  const istNow = now.getTime() + IST_OFFSET_MS;
  const todayStart = new Date(istNow - (istNow % DAY_MS) - IST_OFFSET_MS); // today 00:00 IST, as a UTC instant
  const yesterdayStart = new Date(todayStart.getTime() - DAY_MS);

  const [day, week, month] = await Promise.all([
    stats(yesterdayStart, todayStart),
    stats(new Date(todayStart.getTime() - 7 * DAY_MS), todayStart),
    stats(new Date(todayStart.getTime() - 30 * DAY_MS), todayStart),
  ]);

  const dateLabel = new Date(yesterdayStart.getTime() + IST_OFFSET_MS).toLocaleDateString('en-IN', {
    timeZone: 'UTC',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return { dateLabel, day, week, month };
}
