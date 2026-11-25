// Example content. Everything here can be edited in the admin screen (⚙ bottom-right).
// NB: the colleagues' teams, projects, hobbies, fun facts and answers are placeholders. Verify the ANWB quiz facts before real use.

export const SEED_VERSION = 2; // bump to replace stored data with this seed

export const PALETTE = [
  { name: 'Donkerblauw', value: '#003D86' },
  { name: 'Blauw', value: '#0069B4' },
  { name: 'Lichtblauw', value: '#009FE3' },
  { name: 'Geel', value: '#FFCC00' },
  { name: 'Oranje', value: '#F39200' },
  { name: 'Groenblauw', value: '#00857C' },
];

const categories = [
  { id: 'cat-buiten', name: 'Privé', title: "Ontdek wie je collega's zijn buiten werk", icon: '🏡', color: '#009FE3', enabled: true },
  { id: 'cat-werk', name: 'Werk', title: "Ontdek waar je collega's aan werken en waar ze trots op zijn", icon: '💻', color: '#003D86', enabled: true },
  { id: 'cat-anwb', name: 'ANWB', title: 'Ontdek hoe de ANWB werkt en waar het voor staat', icon: '🚗', color: '#FFCC00', enabled: true },
  { id: 'cat-samen', name: 'Samen', title: "Ontdek de waarde van samenwerken met je collega's", icon: '🤝', color: '#0069B4', enabled: true },
  { id: 'cat-standpunt', name: 'Visie', title: "Ontdek hoe je collega's denken en wat hun standpunten zijn", icon: '💬', color: '#F39200', enabled: true },
];

const profileQuestions = [
  { id: 'pq-wandel', a: 'Wandelen', emojiA: '🥾', b: 'Fietsen', emojiB: '🚲' },
  { id: 'pq-koffie', a: 'Koffie', emojiA: '☕', b: 'Thee', emojiB: '🍵' },
  { id: 'pq-strand', a: 'Strand', emojiA: '🏖️', b: 'Bergen', emojiB: '🏔️' },
  { id: 'pq-ochtend', a: 'Ochtendmens', emojiA: '🌅', b: 'Avondmens', emojiB: '🌙' },
  { id: 'pq-dier', a: 'Hond', emojiA: '🐶', b: 'Kat', emojiB: '🐱' },
  { id: 'pq-zoet', a: 'Zoet', emojiA: '🍰', b: 'Hartig', emojiB: '🧀' },
  { id: 'pq-boek', a: 'Boek', emojiA: '📚', b: 'Serie', emojiB: '📺' },
  { id: 'pq-thuis', a: 'Thuiswerken', emojiA: '🏠', b: 'Op kantoor', emojiB: '🏢' },
  { id: 'pq-zomer', a: 'Zomer', emojiA: '☀️', b: 'Winter', emojiB: '❄️' },
  { id: 'pq-camping', a: 'Camping', emojiA: '⛺', b: 'Hotel', emojiB: '🏨' },
  { id: 'pq-auto', a: 'Auto', emojiA: '🚗', b: 'Trein', emojiB: '🚆' },
  { id: 'pq-pizza', a: 'Pizza', emojiA: '🍕', b: 'Sushi', emojiB: '🍣' },
];

/** 'abba…' -> { 'pq-wandel': 'a', 'pq-koffie': 'b', … } in the order of profileQuestions. */
function answers(pattern) {
  const out = {};
  profileQuestions.forEach((q, i) => {
    const c = pattern[i];
    if (c === 'a' || c === 'b') out[q.id] = c;
  });
  return out;
}

const person = (id, name, team, role, project, hobbies, funFact, pattern) => ({
  id, name, team, role, project, hobbies, funFact, photo: null, answers: answers(pattern),
});

const people = [
  person('p-mathijs', 'Mathijs van der Meijde', 'IT Projecten', 'Project Manager', 'Draai & Verbind, het verbindingsrad', ['padel', 'reizen'], 'Lost een Rubik’s Cube op in minder dan twee minuten', 'baabaabaabab'),
  person('p-jim', 'Jim Lagendijk', 'UX', 'UX Researcher', 'Gebruikersonderzoek voor de ANWB-app', ['fotografie', 'bordspellen'], 'Deed ooit mee aan een tv-quiz', 'abbbabbaabba'),
  person('p-declan', 'Declan Versloot', 'Development', 'Developer', 'De nieuwe pechmelding in de app', ['gamen', 'mountainbiken'], 'Bouwde op twaalfjarige leeftijd de eerste eigen website', 'bbabbbbaabaa'),
  person('p-muhammed', 'Muhammed Aktas', 'Development', 'Developer', 'Een snellere checkout in de webwinkel', ['voetbal', 'koken'], 'Is op de afdeling nog ongeslagen bij tafelvoetbal', 'aaabaabbbbaa'),
  person('p-paul', 'Paul Bentvelzen', 'IT Management', 'IT Lead', 'De migratie naar de cloud', ['zeilen', 'wielrennen'], 'Fietste ooit de Mont Ventoux op', 'baaaaaaabaaa'),
  person('p-thamar', 'Thamar Kiemel', 'UX', 'UX Lead', 'Het nieuwe designsysteem', ['tekenen', 'yoga'], 'Heeft thuis meer dan honderd planten', 'aabbbaabaaba'),
];

export function createSeed() {
  const year = new Date().getFullYear();

  const activities = [
    // ── Buiten werk ─────────────────────────────────────────────
    {
      id: 'act-gesprek-buiten', type: 'conversation', categoryId: 'cat-buiten', enabled: true,
      title: 'Open gesprek', intro: 'Trek een kaart en praat erover. Er zijn geen foute antwoorden!',
      count: 4, random: true, timer: 0,
      cards: [
        'Wat is jouw grote droom?',
        'Wat doe je het liefst op een vrije zondag?',
        'Welke plek ter wereld moet de ander echt een keer zien?',
        "Wat weten je collega's waarschijnlijk nog niet over jou?",
        'Welk talent zou je meteen willen hebben?',
        'Wat was je eerste bijbaantje, en wat heb je daarvan geleerd?',
        'Waar kun jij enorm van genieten, hoe klein ook?',
        'Welke vakantie ga je nooit vergeten, en waarom?',
        'Als je een jaar vrij kreeg, wat zou je dan doen?',
        'Welk boek, welke serie of podcast moet de ander echt eens proberen?',
        'Waar was je als kind helemaal fan van?',
        'Wat staat er nog op jouw bucketlist?',
      ],
    },
    {
      id: 'act-kennen', type: 'guess', categoryId: 'cat-buiten', enabled: true,
      title: 'Hoe goed ken je elkaar?', intro: 'Raad om de beurt wat je collega kiest. Klopt het?',
      rounds: 6,
    },
    {
      id: 'act-wie-buiten', type: 'whoisit', categoryId: 'cat-buiten', enabled: true,
      title: 'Wie is het?', intro: "Hobby's, weetjes en foto's van collega's. Raden jullie samen bij wie ze horen?",
      count: 5, clueTypes: ['hobby', 'funFact', 'photo'],
    },

    // ── Ons werk ────────────────────────────────────────────────
    {
      id: 'act-trots', type: 'conversation', categoryId: 'cat-werk', enabled: true,
      title: 'Waar ben je trots op?', intro: 'Vertel elkaar over je werk: waar je aan bouwt, wat je leert en waar je trots op bent.',
      count: 4, random: true, timer: 0,
      cards: [
        'Aan welk project werk jij nu, en waar ben je trots op?',
        'Wat is het mooiste wat je dit jaar hebt opgeleverd?',
        'Welke bug of storing ga je nooit meer vergeten?',
        'Welke tool, shortcut of truc zou iedereen moeten kennen?',
        "Waarvoor kunnen collega's jou altijd bellen?",
        'Wat wil je dit jaar nog leren?',
        'Wie heeft jou onlangs goed geholpen, en hoe?',
        'Welk probleem zou je oplossen als je er alle tijd voor had?',
        'Hoe merkt een ANWB-lid iets van jouw werk?',
        'Wat maakt een werkdag voor jou echt geslaagd?',
      ],
    },
    {
      id: 'act-pitch', type: 'conversation', categoryId: 'cat-werk', enabled: true,
      title: 'Elevator pitch', intro: 'Ieder krijgt één minuut om uit te leggen waar je aan werkt. Luister goed: de ander vat het samen!',
      count: 3, random: false, timer: 60,
      cards: [
        '{A}, vertel in één minuut waar je nu aan werkt. {B}, vat het daarna samen in één zin!',
        '{B}, nu jij: vertel in één minuut waar je nu aan werkt. {A}, vat het samen in één zin!',
        'Bedenk samen: waar kunnen jullie teams elkaar helpen of van elkaar leren?',
      ],
    },
    {
      id: 'act-wie-werk', type: 'whoisit', categoryId: 'cat-werk', enabled: true,
      title: 'Wie werkt waaraan?', intro: 'Bij welke collega hoort welk project? Overleg en kies samen.',
      count: 5, clueTypes: ['project'],
    },

    // ── De ANWB ─────────────────────────────────────────────────
    {
      id: 'act-quiz-anwb', type: 'quiz', categoryId: 'cat-anwb', enabled: true,
      title: 'ANWB-quiz', intro: 'Hoe goed kennen jullie de ANWB? Overleg en kies samen. Bij schatvragen speelt ieder voor zich!',
      count: 6,
      questions: [
        { kind: 'choice', q: 'Waar stond de afkorting ANWB oorspronkelijk voor?', options: ['Algemene Nederlandse Wielrijders-Bond', 'Algemene Nederlandse Wegen-Bond', 'Automobiel Nederland Wegenwacht Bond', 'Algemene Nationale Weggebruikers-Bond'], answer: 0, info: 'De ANWB begon als bond voor fietsers, toen nog "wielrijders" genoemd.' },
        { kind: 'number', q: 'Hoeveel jaar bestaat de ANWB?', answer: year - 1883, unit: 'jaar', info: 'De ANWB werd op 4 juli 1883 opgericht.' },
        { kind: 'choice', q: 'Voor wie werd de ANWB oorspronkelijk opgericht?', options: ['Automobilisten', 'Fietsers', 'Wandelaars', 'Schippers'], answer: 1, info: 'Auto’s bestonden in 1883 nog nauwelijks. Het begon met fietsers.' },
        { kind: 'choice', q: 'Welke kleur hebben de auto’s van de Wegenwacht?', options: ['Blauw', 'Wit', 'Geel', 'Oranje'], answer: 2, info: 'Het Wegenwacht-geel is in heel Nederland herkenbaar.' },
        { kind: 'number', q: 'In welk jaar ging de Wegenwacht van start?', answer: 1946, unit: '', info: 'De eerste wegenwachters reden op motoren met zijspan.' },
        { kind: 'choice', q: 'Hoe heet het ledenblad van de ANWB?', options: ['Kampioen', 'De Wegwijzer', 'Onderweg', 'Het Stuur'], answer: 0, info: 'De Kampioen verschijnt al sinds de 19e eeuw.' },
        { kind: 'choice', q: 'In welke stad staat het hoofdkantoor van de ANWB?', options: ['Amsterdam', 'Utrecht', 'Den Haag', 'Rotterdam'], answer: 2 },
        { kind: 'choice', q: 'Hoe heten de traumahelikopters van ANWB MAA?', options: ['Medicopter', 'Lifeliner', 'Skyhelper', 'Rescue One'], answer: 1 },
        { kind: 'choice', q: 'Wat voor organisatie is de ANWB?', options: ['Een staatsbedrijf', 'Een beursgenoteerd bedrijf', 'Een vereniging van leden', 'Een stichting van de overheid'], answer: 2, info: 'Als vereniging hebben de leden via de ledenraad inspraak.' },
        { kind: 'choice', q: 'Hoeveel leden heeft de ANWB ongeveer?', options: ['Ongeveer 1 miljoen', 'Ongeveer 2,5 miljoen', 'Ongeveer 5 miljoen', 'Ongeveer 9 miljoen'], answer: 2 },
      ],
    },
    {
      id: 'act-anwb-gesprek', type: 'conversation', categoryId: 'cat-anwb', enabled: true,
      title: 'Wat betekent de ANWB voor jou?', intro: 'Waar staan we voor, en wat betekent dat voor jullie?',
      count: 4, random: true, timer: 0,
      cards: [
        'Wat is jouw mooiste of grappigste ANWB-herinnering?',
        'Waarom werk jij bij de ANWB?',
        'Waar staat de ANWB volgens jou voor, in drie woorden?',
        'Hoe helpt jouw werk een lid dat met pech langs de weg staat?',
        'Als je één ding aan de ANWB mocht veranderen, wat zou dat zijn?',
        'Welke ANWB-dienst gebruik je zelf het meest?',
        'Hoe ziet de ANWB er over tien jaar uit, denk je?',
        'Wat zou je een nieuwe collega vertellen over werken bij de ANWB?',
      ],
    },

    // ── Samenwerken ─────────────────────────────────────────────
    {
      id: 'act-beschrijf', type: 'describe', categoryId: 'cat-samen', enabled: true,
      title: 'Beschrijf het!', intro: 'De één beschrijft, de ander raadt. Hoeveel woorden halen jullie samen?',
      rounds: 2, seconds: 60,
      words: [
        'Wegenwacht', 'Caravan', 'Fietspad', 'File', 'Tankstation', 'Laadpaal', 'Rotonde', 'Pechhulp', 'Snelweg', 'Vakantie',
        'Camping', 'Routeplanner', 'Verkeersbord', 'Lekke band', 'Helikopter', 'Reisverzekering', 'Tunnel', 'Flitspaal', 'Wegenkaart', 'Startkabels',
        'Sprint', 'Bug', 'Deployment', 'Database', 'Wachtwoord', 'Cloud', 'Stand-up', 'Koffieautomaat', 'Laptop', 'Retrospective',
        'Firewall', 'Toetsenbord', 'Code review', 'Hackathon', 'Backlog', 'Server', 'Inloggen', 'Update', 'Wifi', 'Spreadsheet',
        'Product owner', 'Videocall', 'Prullenbak', 'Screenshot', 'Kantine', 'Lift', 'Vergaderzaal', 'Post-it', 'Whiteboard', 'Koptelefoon',
      ],
    },
    {
      id: 'act-memory', type: 'memory', categoryId: 'cat-samen', enabled: true,
      title: 'Duo-memory', intro: 'Zoek samen alle paren. Draai om de beurt kaarten om en help elkaar onthouden!',
      pairs: 8, targetMoves: 16,
      icons: ['🚗 Auto', '🚲 Fiets', '⛺ Tent', '🧭 Kompas', '💻 Laptop', '☕ Koffie', '🛠️ Gereedschap', '🚁 Helikopter', '🗺️ Kaart', '🔋 Accu', '🚦 Stoplicht', '🐞 Bug'],
    },
    {
      id: 'act-sync', type: 'sync', categoryId: 'cat-samen', enabled: true,
      title: 'Op één lijn', intro: 'Tel samen af en noem tegelijk een antwoord. Zeggen jullie hetzelfde?',
      count: 6,
      prompts: [
        'Een automerk', 'Een vakantieland', 'Een programmeertaal', 'Iets geels', 'Iets wat in je kofferbak ligt',
        'Een Nederlandse stad', 'Een ijssmaak', 'Iets uit de kantine', 'Een superheld', 'Een sport',
        'Een dier in de dierentuin', 'Een app op je telefoon', 'Iets wat je meeneemt op vakantie', 'Een groente', 'Een feestdag',
        'Een muziekinstrument', 'Een Hollandse snack', 'Een IT-woord', 'Een vervoermiddel', 'Iets wat je op een camping vindt',
      ],
    },

    // ── Standpunten ─────────────────────────────────────────────
    {
      id: 'act-dilemma-weg', type: 'dilemma', categoryId: 'cat-standpunt', enabled: true,
      title: "Dilemma's onderweg", intro: 'Wat kies jij liever? Kies allebei en ontdek hoe de ander denkt.',
      count: 5,
      items: [
        { a: 'Nooit meer in de file staan', emojiA: '🛣️', b: 'Voor altijd gratis tanken of laden', emojiB: '⛽' },
        { a: 'Altijd een parkeerplek voor de deur', emojiA: '🅿️', b: 'Altijd groen licht', emojiB: '🚦' },
        { a: 'Elke vakantie met de caravan', emojiA: '🚐', b: 'Elke vakantie met het vliegtuig', emojiB: '✈️' },
        { a: 'Elk jaar een weekendje weg in eigen land', emojiA: '🇳🇱', b: 'Eens in de vijf jaar een verre reis', emojiB: '🌏' },
        { a: 'Een navigatie die altijd gelijk heeft', emojiA: '🧭', b: 'Een auto die zichzelf parkeert', emojiB: '🚗' },
        { a: 'Fietsen in de regen', emojiA: '🌧️', b: 'Een uur in de file met airco', emojiB: '🚙' },
        { a: 'Een roadtrip zonder plan', emojiA: '🎲', b: 'Een reis die tot op de minuut gepland is', emojiB: '📋' },
        { a: 'Nooit meer een lekke band', emojiA: '🛞', b: 'Nooit meer een lege accu', emojiB: '🔋' },
      ],
    },
    {
      id: 'act-dilemma-tech', type: 'dilemma', categoryId: 'cat-standpunt', enabled: true,
      title: "Tech-dilemma's", intro: 'De eeuwige discussies van de IT-afdeling. Waar staan jullie?',
      count: 5,
      items: [
        { a: 'Tabs', emojiA: '⇥', b: 'Spaties', emojiB: '␣' },
        { a: 'Dark mode', emojiA: '🌙', b: 'Light mode', emojiB: '☀️' },
        { a: 'Elke dag een stand-up', emojiA: '🧍', b: 'Nooit meer meetings, alleen chat', emojiB: '💬' },
        { a: 'Code zonder bugs, maar zonder documentatie', emojiA: '🐞', b: 'Perfecte documentatie, maar af en toe een bug', emojiB: '📖' },
        { a: 'Altijd de nieuwste technologie', emojiA: '✨', b: 'Bewezen technologie die nooit stuk gaat', emojiB: '🧱' },
        { a: 'Pair programming', emojiA: '👯', b: 'Alleen in de flow', emojiB: '🎧' },
        { a: 'Op vrijdag deployen', emojiA: '🎉', b: 'Op maandagochtend deployen', emojiB: '☕' },
        { a: 'Eén groot scherm', emojiA: '🖥️', b: 'Drie kleinere schermen', emojiB: '🧮' },
      ],
    },
    {
      id: 'act-stellingen', type: 'dilemma', categoryId: 'cat-standpunt', enabled: true,
      title: 'Stellingen', intro: 'Eens of oneens? Kies allebei en praat over de verschillen.',
      count: 5,
      items: [
        { q: 'Thuiswerken is productiever dan op kantoor werken.', a: 'Eens', emojiA: '👍', b: 'Oneens', emojiB: '👎' },
        { q: 'AI gaat ons werk leuker maken.', a: 'Eens', emojiA: '👍', b: 'Oneens', emojiB: '👎' },
        { q: 'Een fijne collega is belangrijker dan een hoger salaris.', a: 'Eens', emojiA: '👍', b: 'Oneens', emojiB: '👎' },
        { q: 'Geen enkele vergadering hoeft langer dan 30 minuten te duren.', a: 'Eens', emojiA: '👍', b: 'Oneens', emojiB: '👎' },
        { q: 'Over twintig jaar heeft bijna niemand nog een eigen auto.', a: 'Eens', emojiA: '👍', b: 'Oneens', emojiB: '👎' },
        { q: 'Fouten maken hoort bij goed werk.', a: 'Eens', emojiA: '👍', b: 'Oneens', emojiB: '👎' },
        { q: "Je moet je collega's ook buiten het werk een beetje kennen.", a: 'Eens', emojiA: '👍', b: 'Oneens', emojiB: '👎' },
        { q: 'Een ANWB-lid merkt direct iets van de code die wij schrijven.', a: 'Eens', emojiA: '👍', b: 'Oneens', emojiB: '👎' },
      ],
    },
  ];

  return {
    version: SEED_VERSION,
    settings: { sound: true, idleSeconds: 240, autoReturnSeconds: 45 },
    categories: structuredClone(categories),
    profileQuestions: structuredClone(profileQuestions),
    people: structuredClone(people),
    activities,
  };
}
