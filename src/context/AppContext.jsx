import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  getHouseholds, getRequests, getComplaints, getRoutes, getWorkers, getSchedules, getBlackspots,
  getCurrentUser, setCurrentUser,
  updateHousehold, addRequest, updateRequest, addComplaint, updateComplaint, updateRoute, addBlackspot,
  setBlackspots, genId
} from '../data/storage';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [currentUser, setCurrentUserState] = useState(() => getCurrentUser());
  const [refreshTick, setRefreshTick] = useState(0);

  const refresh = useCallback(() => setRefreshTick(t => t + 1), []);

  // ── Auth ──────────────────────────────────────────────────────────────────
  const login = useCallback((user) => {
    setCurrentUser(user);
    setCurrentUserState(user);
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setCurrentUserState(null);
  }, []);

  // ── Data accessors (always fresh from localStorage) ───────────────────────
  const households = useCallback(() => getHouseholds(), [refreshTick]);
  const requests = useCallback(() => getRequests(), [refreshTick]);
  const complaints = useCallback(() => getComplaints(), [refreshTick]);
  const routes = useCallback(() => getRoutes(), [refreshTick]);
  const workers = useCallback(() => getWorkers(), [refreshTick]);
  const schedules = useCallback(() => getSchedules(), [refreshTick]);
  const blackspots = useCallback(() => getBlackspots(), [refreshTick]);

  // ── Resident actions ──────────────────────────────────────────────────────
  const markGarbageReady = useCallback((householdId) => {
    const h = updateHousehold(householdId, { garbageReady: true, readyAt: new Date().toISOString() });
    // create a request if none pending/ready
    const existing = getRequests().find(r =>
      r.householdId === householdId && ['pending', 'ready'].includes(r.status)
    );
    if (!existing && h) {
      addRequest({
        id: genId('req'),
        householdId,
        locality: h.locality,
        street: h.street,
        address: h.address,
        residentName: h.name,
        status: 'ready',
        markedAt: new Date().toISOString(),
        collectedAt: null,
        workerId: null,
        routeId: null,
      });
    } else if (existing) {
      updateRequest(existing.id, { status: 'ready', markedAt: new Date().toISOString() });
    }
    refresh();
  }, [refresh]);

  const unmarkGarbageReady = useCallback((householdId) => {
    updateHousehold(householdId, { garbageReady: false, readyAt: null });
    const existing = getRequests().find(r =>
      r.householdId === householdId && r.status === 'ready'
    );
    if (existing) updateRequest(existing.id, { status: 'cancelled' });
    refresh();
  }, [refresh]);

  const confirmCollection = useCallback((householdId) => {
    updateHousehold(householdId, { garbageReady: false, lastCollected: new Date().toISOString() });
    const req = getRequests().find(r =>
      r.householdId === householdId && ['ready', 'in_progress'].includes(r.status)
    );
    if (req) updateRequest(req.id, { status: 'collected', collectedAt: new Date().toISOString() });
    refresh();
  }, [refresh]);

  const reportMissedCollection = useCallback((householdId, description, photoUrl) => {
    const h = getHouseholds().find(h => h.id === householdId);
    if (!h) return;
    const req = getRequests().find(r =>
      r.householdId === householdId && ['ready', 'pending'].includes(r.status)
    );
    if (req) updateRequest(req.id, { status: 'missed' });

    addComplaint({
      id: genId('c'),
      householdId,
      residentName: h.name,
      locality: h.locality,
      street: h.street,
      address: h.address,
      type: 'missed_collection',
      description,
      photoUrl: photoUrl || null,
      status: 'open',
      createdAt: new Date().toISOString(),
      resolvedAt: null,
    });
    refresh();
  }, [refresh]);

  const reportBlackspot = useCallback((householdId, street, locality, description) => {
    addBlackspot({
      id: genId('b'),
      locality,
      street,
      description,
      severity: 'medium',
      reportedBy: householdId,
      reportedAt: new Date().toISOString(),
      status: 'open',
    });
    addComplaint({
      id: genId('c'),
      householdId,
      residentName: null,
      locality,
      street,
      address: null,
      type: 'blackspot',
      description,
      photoUrl: null,
      status: 'open',
      createdAt: new Date().toISOString(),
      resolvedAt: null,
    });
    refresh();
  }, [refresh]);

  // ── Worker actions ────────────────────────────────────────────────────────
  const markCollected = useCallback((requestId, workerId) => {
    const req = updateRequest(requestId, {
      status: 'collected',
      collectedAt: new Date().toISOString(),
      workerId,
    });
    if (req) {
      updateHousehold(req.householdId, {
        garbageReady: false,
        lastCollected: new Date().toISOString(),
      });
    }
    refresh();
  }, [refresh]);

  const reportDelay = useCallback((routeId, delayMinutes, reason) => {
    updateRoute(routeId, {
      delayMinutes,
      delayReason: reason,
      lastUpdated: new Date().toISOString(),
    });
    refresh();
  }, [refresh]);

  const updateRouteStatus = useCallback((routeId, status) => {
    updateRoute(routeId, { status, lastUpdated: new Date().toISOString() });
    refresh();
  }, [refresh]);

  // ── Admin actions ─────────────────────────────────────────────────────────
  const resolveComplaint = useCallback((complaintId) => {
    updateComplaint(complaintId, { status: 'resolved', resolvedAt: new Date().toISOString() });
    refresh();
  }, [refresh]);

  const updateBlackspot = useCallback((id, patch) => {
    const list = getBlackspots();
    const idx = list.findIndex(b => b.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...patch };
      setBlackspots(list);
    }
    refresh();
  }, [refresh]);

  return (
    <AppContext.Provider value={{
      currentUser,
      login, logout,
      households, requests, complaints, routes, workers, schedules, blackspots,
      markGarbageReady, unmarkGarbageReady, confirmCollection, reportMissedCollection, reportBlackspot,
      markCollected, reportDelay, updateRouteStatus,
      resolveComplaint, updateBlackspot,
      refresh,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
