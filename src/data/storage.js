// localStorage keys
export const KEYS = {
  HOUSEHOLDS: 'nk_households',
  COLLECTION_REQUESTS: 'nk_collection_requests',
  COMPLAINTS: 'nk_complaints',
  ROUTES: 'nk_routes',
  WORKERS: 'nk_workers',
  SCHEDULES: 'nk_schedules',
  BLACKSPOTS: 'nk_blackspots',
  COMMUNITY_DRIVES: 'nk_community_drives',
  CURRENT_USER: 'nk_current_user',
};

// Generic helpers
export function getItem(key) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : null;
  } catch {
    return null;
  }
}

export function setItem(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function updateItem(key, updater) {
  const current = getItem(key);
  const next = updater(current);
  setItem(key, next);
  return next;
}

// Domain helpers
export function getHouseholds() { return getItem(KEYS.HOUSEHOLDS) || []; }
export function setHouseholds(h) { setItem(KEYS.HOUSEHOLDS, h); }
export function updateHousehold(id, patch) {
  const list = getHouseholds();
  const idx = list.findIndex(h => h.id === id);
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...patch };
    setHouseholds(list);
    return list[idx];
  }
  return null;
}

export function getRequests() { return getItem(KEYS.COLLECTION_REQUESTS) || []; }
export function setRequests(r) { setItem(KEYS.COLLECTION_REQUESTS, r); }
export function addRequest(req) {
  const list = getRequests();
  list.unshift(req);
  setRequests(list);
  return req;
}
export function updateRequest(id, patch) {
  const list = getRequests();
  const idx = list.findIndex(r => r.id === id);
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...patch };
    setRequests(list);
    return list[idx];
  }
  return null;
}

export function getComplaints() { return getItem(KEYS.COMPLAINTS) || []; }
export function setComplaints(c) { setItem(KEYS.COMPLAINTS, c); }
export function addComplaint(c) {
  const list = getComplaints();
  list.unshift(c);
  setComplaints(list);
  return c;
}
export function updateComplaint(id, patch) {
  const list = getComplaints();
  const idx = list.findIndex(c => c.id === id);
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...patch };
    setComplaints(list);
  }
}

export function getRoutes() { return getItem(KEYS.ROUTES) || []; }
export function setRoutes(r) { setItem(KEYS.ROUTES, r); }
export function updateRoute(id, patch) {
  const list = getRoutes();
  const idx = list.findIndex(r => r.id === id);
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...patch };
    setRoutes(list);
    return list[idx];
  }
  return null;
}

export function getWorkers() { return getItem(KEYS.WORKERS) || []; }
export function setWorkers(w) { setItem(KEYS.WORKERS, w); }

export function getSchedules() { return getItem(KEYS.SCHEDULES) || []; }
export function setSchedules(s) { setItem(KEYS.SCHEDULES, s); }

export function getBlackspots() { return getItem(KEYS.BLACKSPOTS) || []; }
export function setBlackspots(b) { setItem(KEYS.BLACKSPOTS, b); }
export function addBlackspot(b) {
  const list = getBlackspots();
  list.unshift(b);
  setBlackspots(list);
  return b;
}

export function getCommunityDrives() { return getItem(KEYS.COMMUNITY_DRIVES) || []; }
export function setCommunityDrives(d) { setItem(KEYS.COMMUNITY_DRIVES, d); }
export function addCommunityDrive(drive) {
  const list = getCommunityDrives();
  list.unshift(drive);
  setCommunityDrives(list);
  return drive;
}
export function updateCommunityDrive(id, patch) {
  const list = getCommunityDrives();
  const idx = list.findIndex(d => d.id === id);
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...patch };
    setCommunityDrives(list);
    return list[idx];
  }
  return null;
}

export function getCurrentUser() { return getItem(KEYS.CURRENT_USER); }
export function setCurrentUser(u) { setItem(KEYS.CURRENT_USER, u); }

// ID generator
export function genId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}
