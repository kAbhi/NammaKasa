import React, { useState, useMemo } from 'react';
import {
  Map, CheckCircle, AlertTriangle, Clock, Truck, Package,
  LogOut, ChevronDown, ChevronUp, User, Phone, MapPin, RefreshCw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Logo, StatusBadge, formatDate, Modal, EmptyState } from '../components/shared';
import { LOCALITIES } from '../data/seed';

function DelayReportModal({ route, onClose, onSubmit }) {
  const [minutes, setMinutes] = useState(15);
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    onSubmit(route.id, minutes, reason);
    onClose();
  };

  return (
    <Modal title="Report Delay" onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Delay Duration</label>
          <div className="flex gap-2 flex-wrap">
            {[10, 15, 20, 30, 45, 60].map(m => (
              <button
                key={m}
                onClick={() => setMinutes(m)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                  minutes === m ? 'bg-green-600 text-white border-green-600' : 'border-gray-200 text-gray-600 hover:border-green-400'
                }`}
              >
                {m} min
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Reason (optional)</label>
          <textarea
            className="input resize-none"
            rows={2}
            placeholder="e.g. Vehicle breakdown, heavy traffic..."
            value={reason}
            onChange={e => setReason(e.target.value)}
          />
        </div>
        <button onClick={handleSubmit} className="btn-primary w-full">Report Delay</button>
      </div>
    </Modal>
  );
}

function HouseholdStopCard({ request, household, onCollect, isWorking }) {
  const [expanded, setExpanded] = useState(false);
  const collected = request.status === 'collected';

  return (
    <div className={`card transition-all ${collected ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-xl flex-shrink-0 mt-0.5 ${
          request.status === 'ready' ? 'bg-green-100' :
          collected ? 'bg-gray-100' : 'bg-yellow-100'
        }`}>
          {collected
            ? <CheckCircle size={18} className="text-gray-500" />
            : request.status === 'ready'
            ? <Package size={18} className="text-green-600" />
            : <Clock size={18} className="text-yellow-600" />
          }
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-gray-900 text-sm">{household?.name || request.residentName}</p>
              <p className="text-xs text-gray-500 truncate">{request.address}</p>
            </div>
            <StatusBadge status={request.status} />
          </div>

          {request.status === 'ready' && (
            <p className="text-xs text-green-600 mt-1 font-medium">
              ✓ Garbage placed outside – ready for collection
            </p>
          )}
          {request.status === 'pending' && (
            <p className="text-xs text-yellow-600 mt-1">
              Waiting for resident to mark ready
            </p>
          )}
          {collected && (
            <p className="text-xs text-gray-400 mt-1">Collected {formatDate(request.collectedAt)}</p>
          )}

          <div className="flex items-center gap-2 mt-2">
            {!collected && (
              <button
                onClick={() => onCollect(request.id)}
                disabled={isWorking}
                className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-green-700 transition-colors active:scale-95 disabled:opacity-50"
              >
                Mark Collected
              </button>
            )}
            <button
              onClick={() => setExpanded(e => !e)}
              className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-0.5"
            >
              {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {expanded ? 'Less' : 'More'}
            </button>
          </div>

          {expanded && household && (
            <div className="mt-2 pt-2 border-t border-gray-100 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <MapPin size={11} />
                <span>{household.street}, {LOCALITIES[household.locality]?.name}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Phone size={11} />
                <span>{household.phone}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Clock size={11} />
                <span>Marked ready: {formatDate(request.markedAt)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RouteProgressBar({ requests }) {
  const total = requests.length;
  const done = requests.filter(r => r.status === 'collected').length;
  const ready = requests.filter(r => r.status === 'ready').length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="card">
      <div className="flex justify-between text-sm mb-2">
        <span className="font-bold text-gray-900">Route Progress</span>
        <span className="font-bold text-green-600">{done}/{total} collected</span>
      </div>
      <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
        <div
          className="bg-green-500 h-3 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex gap-4 mt-2 text-xs text-gray-500">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />{done} collected</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />{ready} ready</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-300 inline-block" />{total - done - ready} waiting</span>
      </div>
    </div>
  );
}

export default function WorkerPage() {
  const { currentUser, logout, households, requests, routes, markCollected, reportDelay, updateRouteStatus, refresh } = useApp();

  const [showDelay, setShowDelay] = useState(false);
  const [toast, setToast] = useState(null);

  const worker = {
    id: currentUser?.workerId,
    name: currentUser?.name,
    locality: currentUser?.locality,
    routeId: currentUser?.routeId,
  };

  const route = routes().find(r => r.id === worker.routeId);
  const allHouseholds = households();

  const routeRequests = useMemo(() => {
    return requests().filter(r => r.routeId === worker.routeId);
  }, [requests, worker.routeId]);

  // also include houses in route.stops that don't have a request yet
  const allStops = useMemo(() => {
    if (!route) return [];
    const reqHouseIds = new Set(routeRequests.map(r => r.householdId));
    const extraStops = (route.stops || [])
      .filter(hid => !reqHouseIds.has(hid))
      .map(hid => {
        const h = allHouseholds.find(hh => hh.id === hid);
        return h ? {
          id: `stub_${hid}`,
          householdId: hid,
          status: 'pending',
          address: h.address,
          street: h.street,
          residentName: h.name,
          markedAt: null,
          collectedAt: null,
        } : null;
      })
      .filter(Boolean);

    return [
      ...routeRequests,
      ...extraStops,
    ].sort((a, b) => {
      const order = { ready: 0, in_progress: 1, pending: 2, collected: 3, missed: 4 };
      return (order[a.status] ?? 5) - (order[b.status] ?? 5);
    });
  }, [routeRequests, route, allHouseholds]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleCollect = (reqId) => {
    markCollected(reqId, worker.id);
    showToast('✓ Marked as collected!');
  };

  const handleDelay = (routeId, mins, reason) => {
    reportDelay(routeId, mins, reason);
    showToast(`⚠ Delay of ${mins}min reported to residents.`);
  };

  const handleStartRoute = () => {
    updateRouteStatus(route.id, 'in_progress');
    showToast('Route started!');
  };

  const handleCompleteRoute = () => {
    updateRouteStatus(route.id, 'completed');
    showToast('✓ Route marked as complete!');
  };

  const readyCount = allStops.filter(r => r.status === 'ready').length;
  const collectedCount = allStops.filter(r => r.status === 'collected').length;
  const localityInfo = LOCALITIES[worker.locality];

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-xs font-semibold text-gray-800">{worker.name}</p>
              <p className="text-xs text-gray-400">{localityInfo?.name}</p>
            </div>
            <button onClick={logout} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
        {/* Route header card */}
        <div className="card bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-blue-100 text-xs font-semibold uppercase tracking-wide">Your Route</p>
              <p className="text-xl font-bold mt-1">{route?.name || 'No route assigned'}</p>
              <p className="text-blue-100 text-sm">{localityInfo?.name} · {localityInfo?.ward}</p>
            </div>
            <div className={`px-2.5 py-1 rounded-full text-xs font-bold ${
              route?.status === 'completed' ? 'bg-green-400 text-white' :
              route?.status === 'in_progress' ? 'bg-white text-blue-700' :
              'bg-white/30 text-white'
            }`}>
              {route?.status === 'completed' ? '✓ Done' :
               route?.status === 'in_progress' ? '● Active' : 'Pending'}
            </div>
          </div>

          {route?.delayMinutes > 0 && (
            <div className="mt-3 bg-white/20 rounded-xl p-2.5 flex items-center gap-2">
              <AlertTriangle size={14} />
              <span className="text-sm">Delay reported: {route.delayMinutes} min</span>
            </div>
          )}

          <div className="flex gap-2 mt-3">
            {route?.status === 'not_started' && (
              <button onClick={handleStartRoute} className="flex-1 bg-white text-blue-700 font-semibold py-2 rounded-xl text-sm active:scale-95 transition-all hover:bg-blue-50">
                Start Route
              </button>
            )}
            {route?.status === 'in_progress' && (
              <>
                <button onClick={handleCompleteRoute} className="flex-1 bg-white text-blue-700 font-semibold py-2 rounded-xl text-sm active:scale-95 transition-all">
                  Complete Route
                </button>
                <button onClick={() => setShowDelay(true)} className="flex-1 bg-white/20 text-white font-semibold py-2 rounded-xl text-sm active:scale-95 transition-all border border-white/30">
                  Report Delay
                </button>
              </>
            )}
            {route?.status === 'completed' && (
              <button onClick={() => updateRouteStatus(route.id, 'in_progress')} className="flex-1 bg-white/20 text-white font-semibold py-2 rounded-xl text-sm border border-white/30">
                Reopen Route
              </button>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="card text-center">
            <p className="text-2xl font-bold text-green-600">{readyCount}</p>
            <p className="text-xs text-gray-500 mt-0.5">Ready Now</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-bold text-gray-700">{collectedCount}</p>
            <p className="text-xs text-gray-500 mt-0.5">Collected</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-bold text-gray-400">{allStops.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Total Stops</p>
          </div>
        </div>

        {/* Progress bar */}
        {allStops.length > 0 && <RouteProgressBar requests={allStops} />}

        {/* Stops list */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="font-bold text-gray-900">Household Stops</p>
            {readyCount > 0 && (
              <span className="badge badge-green">{readyCount} ready</span>
            )}
          </div>

          {allStops.length === 0 ? (
            <EmptyState icon={Map} title="No stops assigned" description="Your route stops will appear here." />
          ) : (
            <div className="space-y-3">
              {allStops.map(req => {
                const h = allHouseholds.find(hh => hh.id === req.householdId);
                return (
                  <HouseholdStopCard
                    key={req.id}
                    request={req}
                    household={h}
                    onCollect={handleCollect}
                    isWorking={false}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Arrival times reference */}
        {route?.estimatedArrival && Object.keys(route.estimatedArrival).length > 0 && (
          <div className="card">
            <p className="font-bold text-gray-900 mb-3">Street-wise Schedule</p>
            <div className="space-y-2">
              {Object.entries(route.estimatedArrival).map(([street, time]) => (
                <div key={street} className="flex justify-between text-sm">
                  <span className="text-gray-600 flex items-center gap-1.5">
                    <MapPin size={12} className="text-gray-400" /> {street}
                  </span>
                  <span className="font-semibold text-gray-800">{time}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showDelay && route && (
        <DelayReportModal
          route={route}
          onClose={() => setShowDelay(false)}
          onSubmit={handleDelay}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-full shadow-lg z-50 whitespace-nowrap">
          {toast}
        </div>
      )}
    </div>
  );
}
