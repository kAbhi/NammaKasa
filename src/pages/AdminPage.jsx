import React, { useState, useMemo } from 'react';
import {
  BarChart2, AlertTriangle, CheckCircle, Clock, Truck, Users,
  MapPin, Shield, LogOut, Package, FileText, ChevronRight, TrendingUp,
  Activity, Trash2, Flag
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Logo, StatusBadge, formatDate, StatCard, MiniBar, Modal, EmptyState, formatFullDate } from '../components/shared';
import { LOCALITIES } from '../data/seed';

function LocalityPerformanceCard({ localityId, requests, routes, households }) {
  const info = LOCALITIES[localityId];
  const locRequests = requests.filter(r => r.locality === localityId);
  const collected = locRequests.filter(r => r.status === 'collected').length;
  const missed = locRequests.filter(r => r.status === 'missed').length;
  const route = routes.find(r => r.locality === localityId);
  const total = locRequests.length;
  const rate = total > 0 ? Math.round((collected / total) * 100) : 0;

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-bold text-gray-900">{info?.name}</p>
          <p className="text-xs text-gray-500">{info?.ward} · {info?.zone} Zone</p>
        </div>
        <StatusBadge status={route?.status || 'not_started'} />
      </div>
      <div className="mb-2">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-500">Collection rate</span>
          <span className="font-semibold text-gray-800">{rate}%</span>
        </div>
        <MiniBar value={collected} max={total || 1} color={rate > 75 ? 'bg-green-500' : rate > 50 ? 'bg-yellow-400' : 'bg-red-400'} />
      </div>
      <div className="flex gap-3 text-xs text-gray-500 mt-2">
        <span className="text-green-600 font-semibold">{collected} collected</span>
        <span>·</span>
        <span className={missed > 0 ? 'text-red-500 font-semibold' : ''}>{missed} missed</span>
        <span>·</span>
        <span>{total - collected - missed} in queue</span>
      </div>
      {route?.delayMinutes > 0 && (
        <div className="mt-2 text-xs text-orange-600 flex items-center gap-1">
          <AlertTriangle size={11} /> Delayed {route.delayMinutes} min
        </div>
      )}
    </div>
  );
}

function ComplaintCard({ complaint, onResolve }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`card transition-all ${complaint.status === 'resolved' ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-xl flex-shrink-0 ${
          complaint.type === 'blackspot' ? 'bg-red-100' : 'bg-orange-100'
        }`}>
          {complaint.type === 'blackspot'
            ? <MapPin size={16} className="text-red-600" />
            : <AlertTriangle size={16} className="text-orange-600" />
          }
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-gray-900 capitalize">
                {complaint.type.replace('_', ' ')}
              </p>
              <p className="text-xs text-gray-500">
                {complaint.locality ? LOCALITIES[complaint.locality]?.name : ''} · {complaint.street}
              </p>
            </div>
            <StatusBadge status={complaint.status} />
          </div>
          {complaint.residentName && (
            <p className="text-xs text-gray-400 mt-0.5">By: {complaint.residentName}</p>
          )}

          <button onClick={() => setExpanded(e => !e)} className="text-xs text-gray-400 hover:text-gray-600 mt-1">
            {expanded ? '▲ Less' : '▼ More'}
          </button>

          {expanded && (
            <div className="mt-2 pt-2 border-t border-gray-100 space-y-2">
              <p className="text-sm text-gray-700">{complaint.description}</p>
              <p className="text-xs text-gray-400">Filed: {formatFullDate(complaint.createdAt)}</p>
              {complaint.resolvedAt && (
                <p className="text-xs text-green-600">Resolved: {formatFullDate(complaint.resolvedAt)}</p>
              )}
            </div>
          )}

          {complaint.status !== 'resolved' && (
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => onResolve(complaint.id)}
                className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Mark Resolved
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BlackspotCard({ spot, onUpdate }) {
  return (
    <div className="card">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-red-100 rounded-xl flex-shrink-0">
          <Flag size={16} className="text-red-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-gray-900">{spot.street}</p>
              <p className="text-xs text-gray-500">{LOCALITIES[spot.locality]?.name}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <StatusBadge status={spot.severity} />
              <StatusBadge status={spot.status} />
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-1">{spot.description}</p>
          <p className="text-xs text-gray-400 mt-1">{formatDate(spot.reportedAt)}</p>
          {spot.status !== 'resolved' && (
            <button
              onClick={() => onUpdate(spot.id, { status: 'resolved', resolvedAt: new Date().toISOString() })}
              className="mt-2 text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Mark Cleared
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function WorkersTab({ workers, routes, requests }) {
  return (
    <div className="space-y-3">
      {workers.map(w => {
        const route = routes.find(r => r.workerId === w.id);
        const workerRequests = requests.filter(r => r.routeId === route?.id);
        const collected = workerRequests.filter(r => r.status === 'collected').length;
        return (
          <div key={w.id} className="card">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-xl">
                <Users size={18} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{w.name}</p>
                    <p className="text-xs text-gray-500">{LOCALITIES[w.locality]?.name} · {w.phone}</p>
                  </div>
                  <StatusBadge status={w.status} />
                </div>
                {route && (
                  <div className="mt-2 text-xs text-gray-500 space-y-0.5">
                    <div className="flex justify-between">
                      <span>Route: {route.name}</span>
                      <StatusBadge status={route.status} />
                    </div>
                    <div>Collected today: <span className="text-green-600 font-semibold">{collected}</span> stops</div>
                    {route.delayMinutes > 0 && (
                      <div className="text-orange-500">Delayed: {route.delayMinutes} min</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AdminPage() {
  const { currentUser, logout, households, requests, complaints, routes, workers, blackspots, resolveComplaint, updateBlackspot } = useApp();

  const [activeTab, setActiveTab] = useState('overview');
  const [toast, setToast] = useState(null);

  const allRequests = requests();
  const allComplaints = complaints();
  const allRoutes = routes();
  const allWorkers = workers();
  const allHouseholds = households();
  const allBlackspots = blackspots();

  const stats = useMemo(() => {
    const total = allRequests.length;
    const collected = allRequests.filter(r => r.status === 'collected').length;
    const pending = allRequests.filter(r => ['pending', 'ready', 'in_progress'].includes(r.status)).length;
    const missed = allRequests.filter(r => r.status === 'missed').length;
    const openComplaints = allComplaints.filter(c => c.status === 'open').length;
    const openBlackspots = allBlackspots.filter(b => b.status !== 'resolved').length;
    return { total, collected, pending, missed, openComplaints, openBlackspots };
  }, [allRequests, allComplaints, allBlackspots]);

  const localities = ['whitefield', 'indiranagar', 'koramangala'];

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleResolve = (id) => {
    resolveComplaint(id);
    showToast('✓ Complaint resolved.');
  };

  const handleUpdateBlackspot = (id, patch) => {
    updateBlackspot(id, patch);
    showToast('✓ Blackspot updated.');
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart2 },
    { id: 'complaints', label: 'Complaints', icon: AlertTriangle },
    { id: 'blackspots', label: 'Blackspots', icon: Flag },
    { id: 'workers', label: 'Workers', icon: Truck },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo size="sm" />
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-gray-800">{currentUser?.name}</p>
              <p className="text-xs text-gray-400">BBMP SWM Division</p>
            </div>
            <button onClick={logout} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5">
        {activeTab === 'overview' && (
          <div className="space-y-5">
            {/* Summary stats */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Total Requests" value={stats.total} icon={Package} color="blue" sub="All localities" />
              <StatCard label="Completed" value={stats.collected} icon={CheckCircle} color="green" sub={`${stats.total > 0 ? Math.round(stats.collected/stats.total*100) : 0}% completion`} />
              <StatCard label="Pending" value={stats.pending} icon={Clock} color="yellow" sub="In queue" />
              <StatCard label="Open Complaints" value={stats.openComplaints} icon={AlertTriangle} color="red" sub={`${stats.openBlackspots} blackspots`} />
            </div>

            {/* Missed collections alert */}
            {stats.missed > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
                <AlertTriangle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-red-800">{stats.missed} missed collection{stats.missed > 1 ? 's' : ''}</p>
                  <p className="text-xs text-red-600 mt-0.5">Requires attention. Go to Complaints to resolve.</p>
                </div>
              </div>
            )}

            {/* Locality performance */}
            <div>
              <p className="font-bold text-gray-900 mb-3">Locality Performance</p>
              <div className="space-y-3">
                {localities.map(loc => (
                  <LocalityPerformanceCard
                    key={loc}
                    localityId={loc}
                    requests={allRequests}
                    routes={allRoutes}
                    households={allHouseholds}
                  />
                ))}
              </div>
            </div>

            {/* Route status overview */}
            <div>
              <p className="font-bold text-gray-900 mb-3">Today's Routes</p>
              <div className="space-y-2">
                {allRoutes.map(route => {
                  const worker = allWorkers.find(w => w.id === route.workerId);
                  const routeReqs = allRequests.filter(r => r.routeId === route.id);
                  const done = routeReqs.filter(r => r.status === 'collected').length;
                  return (
                    <div key={route.id} className="card">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl ${
                            route.status === 'completed' ? 'bg-green-100' :
                            route.status === 'in_progress' ? 'bg-blue-100' : 'bg-gray-100'
                          }`}>
                            <Truck size={16} className={
                              route.status === 'completed' ? 'text-green-600' :
                              route.status === 'in_progress' ? 'text-blue-600' : 'text-gray-500'
                            } />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{route.name}</p>
                            <p className="text-xs text-gray-500">{worker?.name} · {done}/{routeReqs.length} stops</p>
                          </div>
                        </div>
                        <StatusBadge status={route.status} />
                      </div>
                      {route.delayMinutes > 0 && (
                        <div className="mt-2 text-xs text-orange-500 flex items-center gap-1">
                          <AlertTriangle size={11} /> Delay: {route.delayMinutes} min
                          {route.delayReason && ` – ${route.delayReason}`}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'complaints' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-1">
              <p className="font-bold text-gray-900">All Complaints</p>
              <span className="badge badge-red">{allComplaints.filter(c => c.status === 'open').length} open</span>
            </div>
            {allComplaints.length === 0 ? (
              <EmptyState icon={FileText} title="No complaints filed" description="All clear!" />
            ) : (
              allComplaints.map(c => (
                <ComplaintCard key={c.id} complaint={c} onResolve={handleResolve} />
              ))
            )}
          </div>
        )}

        {activeTab === 'blackspots' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-1">
              <p className="font-bold text-gray-900">Garbage Blackspots</p>
              <span className="badge badge-red">{allBlackspots.filter(b => b.status !== 'resolved').length} active</span>
            </div>
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl text-xs text-orange-800">
              Blackspots are recurring illegal dumping locations reported by residents.
            </div>
            {allBlackspots.length === 0 ? (
              <EmptyState icon={Flag} title="No blackspots reported" />
            ) : (
              allBlackspots.map(b => (
                <BlackspotCard key={b.id} spot={b} onUpdate={handleUpdateBlackspot} />
              ))
            )}
          </div>
        )}

        {activeTab === 'workers' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-1">
              <p className="font-bold text-gray-900">Collection Workers</p>
              <span className="badge badge-green">{allWorkers.filter(w => w.status === 'active').length} active</span>
            </div>
            <WorkersTab workers={allWorkers} routes={allRoutes} requests={allRequests} />
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-40">
        <div className="max-w-2xl mx-auto flex">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${active ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Icon size={20} />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-full shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
