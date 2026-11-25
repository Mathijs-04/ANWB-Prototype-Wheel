import Conversation from './Conversation';
import Describe from './Describe';
import Dilemma from './Dilemma';
import GuessColleague from './GuessColleague';
import Memory from './Memory';
import Quiz from './Quiz';
import Sync from './Sync';
import WhoIsIt, { canPlayWhoIsIt } from './WhoIsIt';
import { getStats } from '../data/stats';
import { pick } from '../lib/utils';

/**
 * All activity types. To add a new one: build a component that receives
 * { activity, players, onComplete({ headline, lines, badge }) }, register it here,
 * and add an editor in admin/ActivityEditors.jsx.
 */
export const ACTIVITY_TYPES = {
  quiz: {
    label: 'Quiz',
    icon: '❓',
    description: 'Meerkeuze- en schatvragen in Kahoot-stijl.',
    component: Quiz,
    feasible: (a) => (a.questions || []).length > 0,
    create: () => ({ count: 5, questions: [] }),
  },
  dilemma: {
    label: "Dilemma's & stellingen",
    icon: '⚖️',
    description: 'A/B-keuzes of eens/oneens. Vergelijk jullie keuzes en praat erover.',
    component: Dilemma,
    feasible: (a) => (a.items || []).length > 0,
    create: () => ({ count: 5, items: [] }),
  },
  conversation: {
    label: 'Gespreksvragen',
    icon: '💬',
    description: 'Open vragen om samen over te praten, eventueel met timer.',
    component: Conversation,
    feasible: (a) => (a.cards || []).filter(Boolean).length > 0,
    create: () => ({ count: 4, random: true, timer: 0, cards: [] }),
  },
  guess: {
    label: 'Hoe goed ken je elkaar?',
    icon: '🔮',
    description: 'Raad wat je collega kiest. Gebruikt de profielen (dit-of-dat en hobby’s).',
    component: GuessColleague,
    feasible: (a, ctx) => (ctx.data.profileQuestions || []).length > 0,
    create: () => ({ rounds: 6 }),
  },
  whoisit: {
    label: 'Wie is het?',
    icon: '🕵️',
    description: 'Raad bij welke collega een hobby, weetje, project of foto hoort.',
    component: WhoIsIt,
    feasible: canPlayWhoIsIt,
    create: () => ({ count: 5, clueTypes: ['hobby', 'funFact', 'project', 'photo'] }),
  },
  describe: {
    label: 'Beschrijf het!',
    icon: '🗣️',
    description: 'Minigame: de één beschrijft, de ander raadt, tegen de klok.',
    component: Describe,
    feasible: (a) => (a.words || []).filter(Boolean).length >= 5,
    create: () => ({ rounds: 2, seconds: 60, words: [] }),
  },
  memory: {
    label: 'Duo-memory',
    icon: '🧠',
    description: 'Minigame: zoek samen alle paren binnen een doel-aantal beurten.',
    component: Memory,
    feasible: (a) => (a.icons || []).filter(Boolean).length >= 2,
    create: () => ({ pairs: 8, targetMoves: 16, icons: [] }),
  },
  sync: {
    label: 'Op één lijn',
    icon: '🎯',
    description: 'Minigame: noem tegelijk een antwoord en kijk of jullie hetzelfde denken.',
    component: Sync,
    feasible: (a) => (a.prompts || []).filter(Boolean).length > 0,
    create: () => ({ count: 6, prompts: [] }),
  },
};


/** Categories on the wheel: enabled and with at least one enabled activity. Repeated to ~10 slices. */
export function buildSegments(data) {
  const cats = data.categories.filter((c) => c.enabled && data.activities.some((a) => a.enabled && a.categoryId === c.id));
  if (!cats.length) return [];
  const reps = Math.max(1, Math.round(10 / cats.length));
  const segments = [];
  for (let r = 0; r < reps; r++) cats.forEach((c) => segments.push({ key: `${c.id}-${r}`, category: c }));
  return segments;
}

/** Picks a playable activity for this category, avoiding ones played very recently. */
export function chooseActivity(data, categoryId, players) {
  const ctx = { data, players };
  const pool = data.activities.filter(
    (a) => a.enabled && a.categoryId === categoryId && ACTIVITY_TYPES[a.type] && ACTIVITY_TYPES[a.type].feasible(a, ctx),
  );
  if (!pool.length) return null;
  const recent = getStats().history.slice(-4);
  const fresh = pool.filter((a) => !recent.includes(a.id));
  return pick(fresh.length ? fresh : pool);
}
