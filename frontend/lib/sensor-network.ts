// Animația de fundal de pe pagina de start: o rețea de stații de monitorizare.
// - stațiile sunt puncte albastre legate între ele prin linii subțiri;
// - din când în când, o stație emite o undă (cerc care crește și se estompează);
// - pe legături alunecă puncte mici (pachete de date) de la o stație la alta;
// - lângă cursor, stațiile au un efect de glow.
// Fișierul nu folosește React: doar calcule și desen pe <canvas>.

// ===== Setări (se pot regla de aici) =====
const COLOR = "52, 120, 246"; // albastrul aplicației #3478F6, ca valori R, G, B pentru rgba()

const AREA_PER_STATION = 22000; // px² de ecran pentru fiecare stație (ecran mai mic → mai puține stații)
const MIN_STATIONS = 10;
const MAX_STATIONS = 48;
const MIN_DISTANCE = 70; // distanța minimă dintre două stații (px)
const NEIGHBORS = 2; // fiecare stație se leagă de cele mai apropiate 2 stații
const MAX_LINK_LENGTH = 260; // legături mai lungi de atât nu se desenează (px)

const PULSE_DURATION = 2500; // cât trăiește o undă (ms)
const PULSE_MAX_RADIUS = 90; // raza maximă a undei (px)
const PULSE_EVERY_MIN = 900; // o undă nouă apare la fiecare 0,9–2 secunde
const PULSE_EVERY_MAX = 2000;

const PACKET_SPEED = 0.07; // viteza pachetelor (px pe ms ≈ 70 px pe secundă)
const PACKET_EVERY_MIN = 350; // un pachet nou la fiecare 0,35–0,9 secunde
const PACKET_EVERY_MAX = 900;
const MAX_PACKETS = 14; // câte pachete pot fi în același timp

const HOVER_RADIUS = 120; // de la ce distanță față de cursor apare glow-ul (px)

// ===== Tipuri =====
type Point = { x: number; y: number };
type Link = { from: number; to: number; length: number }; // indicii celor două stații
type Pulse = { station: number; age: number }; // vârsta în ms
type Packet = { link: number; progress: number; forward: boolean }; // progress: 0 → 1 pe legătură

export type Network = {
  stations: Point[];
  links: Link[];
  pulses: Pulse[];
  packets: Packet[];
  nextPulseIn: number; // ms până la următoarea undă
  nextPacketIn: number; // ms până la următorul pachet
  mouse: Point | null; // poziția cursorului (null = în afara paginii)
};

// ===== Funcții ajutătoare =====
function random(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function distance(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

// ===== Crearea rețelei =====
export function createNetwork(width: number, height: number): Network {
  // 1. Câte stații: în funcție de suprafața ecranului, între MIN și MAX
  const count = Math.min(MAX_STATIONS, Math.max(MIN_STATIONS, Math.round((width * height) / AREA_PER_STATION)));

  // 2. Le punem aleator, dar nu prea aproape una de alta (încercăm de mai multe ori)
  const stations: Point[] = [];
  for (let attempt = 0; attempt < count * 40 && stations.length < count; attempt++) {
    const candidate = { x: random(20, width - 20), y: random(20, height - 20) };
    if (stations.every((s) => distance(s, candidate) >= MIN_DISTANCE)) {
      stations.push(candidate);
    }
  }

  // 3. Legăm fiecare stație de cele mai apropiate vecine (fără legături duble)
  const links: Link[] = [];
  const existing = new Set<string>();
  stations.forEach((station, i) => {
    const nearest = stations
      .map((other, j) => ({ j, d: distance(station, other) }))
      .filter(({ j, d }) => j !== i && d <= MAX_LINK_LENGTH)
      .sort((a, b) => a.d - b.d)
      .slice(0, NEIGHBORS);

    for (const { j, d } of nearest) {
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (!existing.has(key)) {
        existing.add(key);
        links.push({ from: i, to: j, length: d });
      }
    }
  });

  return {
    stations,
    links,
    pulses: [],
    packets: [],
    nextPulseIn: random(200, 800), // prima undă apare repede
    nextPacketIn: random(100, 400),
    mouse: null,
  };
}

// ===== Actualizarea la fiecare cadru =====
// dt = câte milisecunde au trecut de la cadrul anterior
export function updateNetwork(net: Network, dt: number) {
  // După o pauză lungă (ex. tab ascuns), nu sărim totul înainte dintr-o dată
  const step = Math.min(dt, 50);

  // 1. Undele îmbătrânesc; cele terminate dispar
  for (const pulse of net.pulses) pulse.age += step;
  net.pulses = net.pulses.filter((pulse) => pulse.age < PULSE_DURATION);

  // 2. Din când în când, o stație aleasă la întâmplare emite o undă nouă
  net.nextPulseIn -= step;
  if (net.nextPulseIn <= 0 && net.stations.length > 0) {
    net.pulses.push({ station: Math.floor(Math.random() * net.stations.length), age: 0 });
    net.nextPulseIn = random(PULSE_EVERY_MIN, PULSE_EVERY_MAX);
  }

  // 3. Pachetele înaintează pe legătura lor; cele ajunse la capăt dispar
  for (const packet of net.packets) {
    packet.progress += (PACKET_SPEED * step) / net.links[packet.link].length;
  }
  net.packets = net.packets.filter((packet) => packet.progress < 1);

  // 4. Din când în când pornește un pachet nou, pe o legătură aleasă la întâmplare
  net.nextPacketIn -= step;
  if (net.nextPacketIn <= 0 && net.links.length > 0 && net.packets.length < MAX_PACKETS) {
    net.packets.push({
      link: Math.floor(Math.random() * net.links.length),
      progress: 0,
      forward: Math.random() < 0.5, // sensul: de la `from` la `to` sau invers
    });
    net.nextPacketIn = random(PACKET_EVERY_MIN, PACKET_EVERY_MAX);
  }
}

// ===== Desenarea =====
export function drawNetwork(ctx: CanvasRenderingContext2D, net: Network, width: number, height: number) {
  ctx.clearRect(0, 0, width, height);

  // 1. Legăturile: linii albastre foarte transparente
  ctx.lineWidth = 1;
  ctx.strokeStyle = `rgba(${COLOR}, 0.14)`;
  ctx.beginPath();
  for (const link of net.links) {
    const a = net.stations[link.from];
    const b = net.stations[link.to];
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
  }
  ctx.stroke();

  // 2. Undele: cercul crește și se estompează în același timp
  ctx.lineWidth = 1.5;
  for (const pulse of net.pulses) {
    const progress = pulse.age / PULSE_DURATION; // 0 → 1
    const eased = 1 - (1 - progress) ** 3; // crește repede la început, apoi încetinește
    const station = net.stations[pulse.station];
    ctx.strokeStyle = `rgba(${COLOR}, ${0.55 * (1 - progress)})`;
    ctx.beginPath();
    ctx.arc(station.x, station.y, eased * PULSE_MAX_RADIUS, 0, Math.PI * 2);
    ctx.stroke();
  }

  // 3. Pachetele de date: puncte mici care alunecă pe legături
  ctx.fillStyle = `rgba(${COLOR}, 0.9)`;
  for (const packet of net.packets) {
    const link = net.links[packet.link];
    const start = net.stations[packet.forward ? link.from : link.to];
    const end = net.stations[packet.forward ? link.to : link.from];
    const x = start.x + (end.x - start.x) * packet.progress;
    const y = start.y + (end.y - start.y) * packet.progress;
    ctx.beginPath();
    ctx.arc(x, y, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  // 4. Stațiile, cu glow când cursorul e aproape
  for (const station of net.stations) {
    // intensitatea glow-ului: 1 lângă cursor, 0 la HOVER_RADIUS sau mai departe
    const near = net.mouse ? Math.max(0, 1 - distance(station, net.mouse) / HOVER_RADIUS) : 0;

    if (near > 0) {
      const glowRadius = 8 + 22 * near;
      const glow = ctx.createRadialGradient(station.x, station.y, 0, station.x, station.y, glowRadius);
      glow.addColorStop(0, `rgba(${COLOR}, ${0.55 * near})`);
      glow.addColorStop(1, `rgba(${COLOR}, 0)`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(station.x, station.y, glowRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    // punctul stației: puțin mai mare și mai luminos când cursorul e aproape
    ctx.fillStyle = `rgba(${COLOR}, ${0.7 + 0.3 * near})`;
    ctx.beginPath();
    ctx.arc(station.x, station.y, 2.5 + 1.5 * near, 0, Math.PI * 2);
    ctx.fill();
  }
}
