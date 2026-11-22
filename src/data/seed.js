import {
  KEYS, getItem, setItem,
  setHouseholds, setRequests, setComplaints, setRoutes, setWorkers, setSchedules, setBlackspots
} from './storage';

export const LOCALITIES = {
  whitefield: {
    id: 'whitefield',
    name: 'Whitefield',
    zone: 'East',
    ward: 'Ward 83',
    streets: [
      'ITPL Main Road', 'Varthur Main Road', 'Kadugodi Main Road',
      'Hope Farm Junction', 'Channasandra Road', 'Thubarahalli Road',
      'Whitefield Main Road', 'Harlur Road'
    ],
  },
  indiranagar: {
    id: 'indiranagar',
    name: 'Indiranagar',
    zone: 'Central-East',
    ward: 'Ward 75',
    streets: [
      '100 Feet Road', 'CMH Road', 'HAL 2nd Stage',
      'Defence Colony', '12th Main Road', 'Domlur Layout',
      'Indiranagar 1st Stage', 'Kalyan Nagar Road'
    ],
  },
  koramangala: {
    id: 'koramangala',
    name: 'Koramangala',
    zone: 'South',
    ward: 'Ward 68',
    streets: [
      '1st Block', '5th Block', '7th Block',
      '80 Feet Road', 'Sony Signal Road', 'Jyoti Nivas College Road',
      'Intermediate Ring Road', 'Sarjapur Road'
    ],
  },
};

export const COLLECTION_DAYS = {
  whitefield: ['Monday', 'Thursday'],
  indiranagar: ['Tuesday', 'Friday'],
  koramangala: ['Wednesday', 'Saturday'],
};

// Day offset helper: returns next upcoming day-of-week
function nextDate(dayName) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const target = days.indexOf(dayName);
  const now = new Date();
  const diff = (target - now.getDay() + 7) % 7 || 7;
  const d = new Date(now);
  d.setDate(now.getDate() + diff);
  d.setHours(7 + Math.floor(Math.random() * 4), 0, 0, 0);
  return d.toISOString();
}

function pastDate(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(8 + Math.floor(Math.random() * 3), 30, 0, 0);
  return d.toISOString();
}

// Bump this version string to force a re-seed for users with stale data
const SEED_VERSION = 'v2';

export function seedData() {
  if (getItem('nk_seeded') === SEED_VERSION) return; // already seeded at this version

  // ── Workers ──────────────────────────────────────────────────────────────
  const workers = [
    { id: 'w1', name: 'Raju K.', phone: '9876543210', locality: 'whitefield', routeId: 'r1', status: 'active', pin: '1111' },
    { id: 'w2', name: 'Suresh B.', phone: '9845123456', locality: 'indiranagar', routeId: 'r2', status: 'active', pin: '2222' },
    { id: 'w3', name: 'Krishnamurthy V.', phone: '9741234567', locality: 'koramangala', routeId: 'r3', status: 'active', pin: '3333' },
  ];
  setWorkers(workers);

  // ── Households ───────────────────────────────────────────────────────────
  const households = [];
  const hData = [
    // Whitefield
    { id: 'h1', locality: 'whitefield', street: 'ITPL Main Road', address: '#12, Sai Residency', name: 'Priya Sharma', phone: '9980123456', pin: '1234' },
    { id: 'h2', locality: 'whitefield', street: 'ITPL Main Road', address: '#45, Green Apartments', name: 'Arun Nair', phone: '9845678901', pin: '2345' },
    { id: 'h3', locality: 'whitefield', street: 'Varthur Main Road', address: '#7, Sunrise Villa', name: 'Deepa Reddy', phone: '9741567890', pin: '3456' },
    { id: 'h4', locality: 'whitefield', street: 'Kadugodi Main Road', address: '#23, Kaveri Flats', name: 'Mohan Kumar', phone: '9632456789', pin: '4567' },
    { id: 'h5', locality: 'whitefield', street: 'Hope Farm Junction', address: '#3, Prestige Towers A', name: 'Ananya Patel', phone: '9523345678', pin: '5678' },
    // Indiranagar
    { id: 'h6', locality: 'indiranagar', street: '100 Feet Road', address: '#88, Landmark Building', name: 'Vikram Singh', phone: '9414234567', pin: '6789' },
    { id: 'h7', locality: 'indiranagar', street: 'CMH Road', address: '#15, Trinity Apartments', name: 'Meera Iyer', phone: '9305123456', pin: '7890' },
    { id: 'h8', locality: 'indiranagar', street: 'HAL 2nd Stage', address: '#62, HAL Colony', name: 'Rahul Gupta', phone: '9196012345', pin: '8901' },
    { id: 'h9', locality: 'indiranagar', street: '12th Main Road', address: '#5, Olive Residency', name: 'Sunita Rao', phone: '9087901234', pin: '9012' },
    // Koramangala
    { id: 'h10', locality: 'koramangala', street: '5th Block', address: '#1A, Forum Residency', name: 'Kiran Kumar', phone: '8978890123', pin: '0123' },
    { id: 'h11', locality: 'koramangala', street: '7th Block', address: '#34, Tech Park Layout', name: 'Divya Krishnan', phone: '8869789012', pin: '1230' },
    { id: 'h12', locality: 'koramangala', street: '80 Feet Road', address: '#90, Imperial Heights', name: 'Sanjay Mehta', phone: '8760678901', pin: '2301' },
    { id: 'h13', locality: 'koramangala', street: 'Sarjapur Road', address: '#56, Lotus Pond Apt', name: 'Pooja Nambiar', phone: '8651567890', pin: '3012' },
  ];
  hData.forEach(h => households.push({ ...h, garbageReady: false, lastCollected: pastDate(3), createdAt: pastDate(90) }));
  setHouseholds(households);

  // ── Schedules ────────────────────────────────────────────────────────────
  const schedules = [
    { id: 's1', locality: 'whitefield', days: COLLECTION_DAYS.whitefield, timeWindow: '7:00 AM – 11:00 AM', workerIds: ['w1'] },
    { id: 's2', locality: 'indiranagar', days: COLLECTION_DAYS.indiranagar, timeWindow: '7:30 AM – 11:30 AM', workerIds: ['w2'] },
    { id: 's3', locality: 'koramangala', days: COLLECTION_DAYS.koramangala, timeWindow: '8:00 AM – 12:00 PM', workerIds: ['w3'] },
  ];
  setSchedules(schedules);

  // ── Routes ────────────────────────────────────────────────────────────────
  const routes = [
    {
      id: 'r1', workerId: 'w1', locality: 'whitefield', name: 'Whitefield Route A',
      status: 'in_progress',
      estimatedArrival: { 'ITPL Main Road': '8:30 AM', 'Varthur Main Road': '9:15 AM', 'Kadugodi Main Road': '10:00 AM', 'Hope Farm Junction': '10:45 AM' },
      stops: ['h1', 'h2', 'h3', 'h4', 'h5'],
      delayMinutes: 0,
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 'r2', workerId: 'w2', locality: 'indiranagar', name: 'Indiranagar Route B',
      status: 'not_started',
      estimatedArrival: { '100 Feet Road': '7:30 AM', 'CMH Road': '8:20 AM', 'HAL 2nd Stage': '9:10 AM', '12th Main Road': '9:50 AM' },
      stops: ['h6', 'h7', 'h8', 'h9'],
      delayMinutes: 0,
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 'r3', workerId: 'w3', locality: 'koramangala', name: 'Koramangala Route C',
      status: 'completed',
      estimatedArrival: { '5th Block': '8:00 AM', '7th Block': '8:50 AM', '80 Feet Road': '9:40 AM', 'Sarjapur Road': '10:30 AM' },
      stops: ['h10', 'h11', 'h12', 'h13'],
      delayMinutes: 15,
      lastUpdated: pastDate(0),
    },
  ];
  setRoutes(routes);

  // ── Collection Requests ───────────────────────────────────────────────────
  const requests = [
    // Whitefield (r1) — h1 ready, h2 ready, h3 collected, h4 pending, h5 ready
    { id: 'req1', householdId: 'h1', locality: 'whitefield', street: 'ITPL Main Road', address: '#12, Sai Residency', residentName: 'Priya Sharma', status: 'ready', markedAt: pastDate(0), collectedAt: null, workerId: 'w1', routeId: 'r1' },
    { id: 'req2', householdId: 'h2', locality: 'whitefield', street: 'ITPL Main Road', address: '#45, Green Apartments', residentName: 'Arun Nair', status: 'ready', markedAt: pastDate(0), collectedAt: null, workerId: 'w1', routeId: 'r1' },
    { id: 'req3', householdId: 'h3', locality: 'whitefield', street: 'Varthur Main Road', address: '#7, Sunrise Villa', residentName: 'Deepa Reddy', status: 'collected', markedAt: pastDate(1), collectedAt: pastDate(0), workerId: 'w1', routeId: 'r1' },
    { id: 'req4', householdId: 'h4', locality: 'whitefield', street: 'Kadugodi Main Road', address: '#23, Kaveri Flats', residentName: 'Mohan Kumar', status: 'pending', markedAt: null, collectedAt: null, workerId: 'w1', routeId: 'r1' },
    { id: 'req5', householdId: 'h5', locality: 'whitefield', street: 'Hope Farm Junction', address: '#3, Prestige Towers A', residentName: 'Ananya Patel', status: 'ready', markedAt: pastDate(0), collectedAt: null, workerId: 'w1', routeId: 'r1' },
    // Indiranagar (r2) — h6 pending, h7 pending, h8 pending, h9 ready
    { id: 'req6', householdId: 'h6', locality: 'indiranagar', street: '100 Feet Road', address: '#88, Landmark Building', residentName: 'Vikram Singh', status: 'pending', markedAt: null, collectedAt: null, workerId: 'w2', routeId: 'r2' },
    { id: 'req7', householdId: 'h7', locality: 'indiranagar', street: 'CMH Road', address: '#15, Trinity Apartments', residentName: 'Meera Iyer', status: 'pending', markedAt: null, collectedAt: null, workerId: 'w2', routeId: 'r2' },
    { id: 'req8', householdId: 'h8', locality: 'indiranagar', street: 'HAL 2nd Stage', address: '#62, HAL Colony', residentName: 'Rahul Gupta', status: 'pending', markedAt: null, collectedAt: null, workerId: 'w2', routeId: 'r2' },
    { id: 'req9', householdId: 'h9', locality: 'indiranagar', street: '12th Main Road', address: '#5, Olive Residency', residentName: 'Sunita Rao', status: 'ready', markedAt: pastDate(0), collectedAt: null, workerId: 'w2', routeId: 'r2' },
    // Koramangala (r3) — h10 collected, h11 collected, h12 missed, h13 collected
    { id: 'req10', householdId: 'h10', locality: 'koramangala', street: '5th Block', address: '#1A, Forum Residency', residentName: 'Kiran Kumar', status: 'collected', markedAt: pastDate(2), collectedAt: pastDate(1), workerId: 'w3', routeId: 'r3' },
    { id: 'req11', householdId: 'h11', locality: 'koramangala', street: '7th Block', address: '#34, Tech Park Layout', residentName: 'Divya Krishnan', status: 'collected', markedAt: pastDate(2), collectedAt: pastDate(1), workerId: 'w3', routeId: 'r3' },
    { id: 'req12', householdId: 'h12', locality: 'koramangala', street: '80 Feet Road', address: '#90, Imperial Heights', residentName: 'Sanjay Mehta', status: 'missed', markedAt: pastDate(4), collectedAt: null, workerId: 'w3', routeId: 'r3' },
    { id: 'req13', householdId: 'h13', locality: 'koramangala', street: 'Sarjapur Road', address: '#56, Lotus Pond Apt', residentName: 'Pooja Nambiar', status: 'collected', markedAt: pastDate(2), collectedAt: pastDate(1), workerId: 'w3', routeId: 'r3' },
  ];
  setRequests(requests);

  // Sync household garbageReady flags and lastCollected with the request states above
  const updatedH = [...hData.map(h => ({ ...h, garbageReady: false, lastCollected: pastDate(3), createdAt: pastDate(90) }))];
  // mark ready
  ['h1', 'h2', 'h5', 'h9'].forEach(id => {
    updatedH.find(h => h.id === id).garbageReady = true;
  });
  // mark recently collected
  ['h3', 'h10', 'h11', 'h13'].forEach(id => {
    updatedH.find(h => h.id === id).lastCollected = pastDate(1);
  });
  setHouseholds(updatedH);

  // ── Complaints ────────────────────────────────────────────────────────────
  const complaints = [
    { id: 'c1', householdId: 'h12', residentName: 'Sanjay Mehta', locality: 'koramangala', street: '80 Feet Road', address: '#90, Imperial Heights', type: 'missed_collection', description: 'Garbage truck did not come on Wednesday. Garbage has been lying outside for 4 days now.', photoUrl: null, status: 'open', createdAt: pastDate(3), resolvedAt: null },
    { id: 'c2', householdId: 'h4', residentName: 'Mohan Kumar', locality: 'whitefield', street: 'Kadugodi Main Road', address: '#23, Kaveri Flats', type: 'blackspot', description: 'Illegal dumping near the main gate. Multiple bags from construction site dumped illegally.', photoUrl: null, status: 'in_review', createdAt: pastDate(5), resolvedAt: null },
    { id: 'c3', householdId: 'h8', residentName: 'Rahul Gupta', locality: 'indiranagar', street: 'HAL 2nd Stage', address: '#62, HAL Colony', type: 'missed_collection', description: 'Worker came but said he didn\'t have space in truck. Promised to return but didn\'t.', photoUrl: null, status: 'resolved', createdAt: pastDate(7), resolvedAt: pastDate(5) },
  ];
  setComplaints(complaints);

  // ── Blackspots ────────────────────────────────────────────────────────────
  const blackspots = [
    { id: 'b1', locality: 'whitefield', street: 'Kadugodi Main Road', description: 'Illegal construction waste dumping near Kaveri Flats gate', severity: 'high', reportedBy: 'h4', reportedAt: pastDate(5), status: 'open' },
    { id: 'b2', locality: 'koramangala', street: 'Sarjapur Road', description: 'Open garbage pile near bus stop – overflows on rainy days', severity: 'medium', reportedBy: 'h13', reportedAt: pastDate(10), status: 'in_review' },
    { id: 'b3', locality: 'indiranagar', street: 'Domlur Layout', description: 'Stray animals tearing bags – needs covered bins', severity: 'low', reportedBy: null, reportedAt: pastDate(14), status: 'resolved' },
  ];
  setBlackspots(blackspots);

  setItem('nk_seeded', SEED_VERSION);
}
