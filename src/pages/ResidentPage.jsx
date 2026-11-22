import React, { useState, useMemo } from 'react';
import {
  Home, Calendar, AlertTriangle, CheckCircle, Camera,
  Clock, MapPin, Leaf, LogOut, Package
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Logo, StatusBadge, formatDate, Modal, EmptyState, formatFullDate } from '../components/shared';
import { LOCALITIES, COLLECTION_DAYS } from '../data/seed';
import WasteAssistant from './WasteAssistant';

function getNextCollectionDays(locality) {
  const days = COLLECTION_DAYS[locality] || [];
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const now = new Date();
  return days.map(day => {
    const target = dayNames.indexOf(day);
    const diff = (target - now.getDay() + 7) % 7 || 7;
    const d = new Date(now);
    d.setDate(now.getDate() + diff);
    return { day, date: d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' }), daysFromNow: diff };
  }).sort((a, b) => a.daysFromNow - b.daysFromNow);
}

function CollectionWindowCard({ locality, schedule }) {
  const nextDays = getNextCollectionDays(locality);
  const next = nextDays[0];
  return (
    <div className="card bg-gradient-to-br from-green-600 to-green-700 text-white border-0">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-green-100 text-xs font-semibold uppercase tracking-wide">Next Collection</p>
          <p className="text-2xl font-bold mt-1">{next?.day}</p>
          <p className="text-green-100 text-sm mt-0.5">{next?.date}</p>
        </div>
        <div className="bg-white/20 p-2.5 rounded-xl">
          <Calendar size={22} className="text-white" />
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-white/20 flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Clock size={14} className="text-green-100" />
          <span className="text-green-100 text-sm">{schedule?.timeWindow || '7:00 AM – 11:00 AM'}</span>
        </div>
        {nextDays[1] && (
          <div className="flex items-center gap-1.5 text-green-200 text-xs">
            <span>Also: {nextDays[1].day}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function TruckStatusCard({ route, schedule }) {
  if (!route) return null;
  const statusConfig = {
    not_started: { label: 'Not Started Yet', color: 'text-gray-600', bg: 'bg-gray-100', icon: Clock },
    in_progress: { label: 'On the Way!', color: 'text-blue-700', bg: 'bg-blue-50', icon: Truck },
    completed: { label: 'Route Completed', color: 'text-green-700', bg: 'bg-green-50', icon: CheckCircle },
  };
  const cfg = statusConfig[route.status] || statusConfig.not_started;
  const Icon = cfg.icon;
  return (
    <div className={`card ${cfg.bg} border-0`}>
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white rounded-xl shadow-sm">
          <Icon size={20} className={cfg.color} />
        </div>
        <div className="flex-1">
          <p className={`font-bold ${cfg.color}`}>{cfg.label}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {route.delayMinutes > 0
              ? `⚠ Delayed by ${route.delayMinutes} min${route.delayReason ? ` – ${route.delayReason}` : ''}`
              : 'Running on schedule'}
          </p>
        </div>
        {route.status === 'in_progress' && (
          <div className="text-right">
            <p className="text-xs text-gray-500">Updated</p>
            <p className="text-xs font-semibold text-gray-700">{formatDate(route.lastUpdated)}</p>
          </div>
        )}
      </div>
      {route.estimatedArrival && Object.keys(route.estimatedArrival).length > 0 && (
        <div className="mt-3 space-y-1.5">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Estimated Arrivals</p>
          {Object.entries(route.estimatedArrival).map(([street, time]) => (
            <div key={street} className="flex justify-between text-sm">
              <span className="text-gray-600">{street}</span>
              <span className="font-semibold text-gray-800">{time}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function GarbageReadyCard({ household, onMark, onUnmark, onConfirm }) {
  if (!household) return null;
  const { garbageReady, lastCollected } = household;

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-bold text-gray-900">Garbage Status</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Last collected: {lastCollected ? formatDate(lastCollected) : 'Unknown'}
          </p>
        </div>
        <StatusBadge status={garbageReady ? 'ready' : 'pending'} />
      </div>

      {!garbageReady ? (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">Place your garbage outside and tap the button below when ready.</p>
          <button onClick={onMark} className="btn-primary w-full flex items-center justify-center gap-2">
            <Package size={16} />
            Mark as Ready for Collection
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded-xl p-3">
            <CheckCircle size={16} />
            <p className="text-sm font-medium">Garbage placed outside & ready!</p>
          </div>
          <button onClick={onConfirm} className="btn-primary w-full flex items-center justify-center gap-2">
            <CheckCircle size={16} />
            Confirm Collection Done
          </button>
          <button onClick={onUnmark} className="btn-secondary w-full text-sm">
            Cancel – Not Ready Yet
          </button>
        </div>
      )}
    </div>
  );
}

function ReportMissedModal({ onClose, onSubmit }) {
  const [description, setDescription] = useState('');
  const [photoName, setPhotoName] = useState('');

  const handleSubmit = () => {
    if (!description.trim()) return;
    onSubmit(description, photoName || null);
    onClose();
  };

  return (
    <Modal title="Report Missed Collection" onClose={onClose}>
      <div className="space-y-4">
        <div className="p-3 bg-orange-50 rounded-xl border border-orange-200">
          <p className="text-sm text-orange-800">Our team will review and schedule a pick-up within 24 hours.</p>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">What happened?</label>
          <textarea
            className="input resize-none"
            rows={3}
            placeholder="e.g. Truck came but didn't collect from my address..."
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Photo (optional)</label>
          <div
            onClick={() => setPhotoName(`photo_${Date.now()}.jpg`)}
            className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-green-400 transition-colors"
          >
            {photoName ? (
              <div className="text-green-600 flex flex-col items-center gap-1">
                <Camera size={24} />
                <p className="text-sm font-medium">{photoName}</p>
                <p className="text-xs text-gray-400">Tap to change</p>
              </div>
            ) : (
              <div className="text-gray-400 flex flex-col items-center gap-1">
                <Camera size={24} />
                <p className="text-sm">Tap to add photo</p>
              </div>
            )}
          </div>
        </div>
        <button
          onClick={handleSubmit}
          disabled={!description.trim()}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Submit Report
        </button>
      </div>
    </Modal>
  );
}

function ReportBlackspotModal({ household, onClose, onSubmit }) {
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (!description.trim()) return;
    onSubmit(description);
    onClose();
  };

  return (
    <Modal title="Report Garbage Blackspot" onClose={onClose}>
      <div className="space-y-4">
        <div className="p-3 bg-red-50 rounded-xl border border-red-200">
          <p className="text-sm text-red-800">Report illegal dumping or persistent garbage pileups in public spaces.</p>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Street</label>
          <input className="input" value={household?.street || ''} readOnly />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
          <textarea
            className="input resize-none"
            rows={3}
            placeholder="Describe the location and issue..."
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={!description.trim()}
          className="btn-danger w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Report Blackspot
        </button>
      </div>
    </Modal>
  );
}

function MyHistoryTab({ requests, complaints }) {
  const myReqs = requests.slice(0, 10);
  const myComplaints = complaints.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-bold text-gray-900 mb-3">Collection History</h3>
        {myReqs.length === 0 ? (
          <div className="card text-center text-gray-500 text-sm py-6">No collection history yet</div>
        ) : (
          <div className="space-y-2">
            {myReqs.map(r => (
              <div key={r.id} className="card py-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{r.street}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{formatFullDate(r.markedAt || r.collectedAt)}</p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="font-bold text-gray-900 mb-3">My Complaints</h3>
        {myComplaints.length === 0 ? (
          <div className="card text-center text-gray-500 text-sm py-6">No complaints filed</div>
        ) : (
          <div className="space-y-2">
            {myComplaints.map(c => (
              <div key={c.id} className="card py-3">
                <div className="flex items-start justify-between mb-1">
                  <p className="text-sm font-semibold text-gray-800 capitalize">{c.type.replace('_', ' ')}</p>
                  <StatusBadge status={c.status} />
                </div>
                <p className="text-xs text-gray-600 line-clamp-2">{c.description}</p>
                <p className="text-xs text-gray-400 mt-1">{formatDate(c.createdAt)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResidentPage() {
  const { currentUser, logout, households, requests, complaints, schedules, routes,
    markGarbageReady, unmarkGarbageReady, confirmCollection, reportMissedCollection, reportBlackspot } = useApp();

  const [activeTab, setActiveTab] = useState('home');
  const [showMissed, setShowMissed] = useState(false);
  const [showBlackspot, setShowBlackspot] = useState(false);
  const [toast, setToast] = useState(null);

  const household = households().find(h => h.id === currentUser?.householdId);
  const locality = household?.locality;
  const schedule = schedules().find(s => s.locality === locality);
  const route = routes().find(r => r.locality === locality);

  const myRequests = useMemo(() => {
    return requests().filter(r => r.householdId === currentUser?.householdId);
  }, [requests, currentUser]);

  const myComplaints = useMemo(() => {
    return complaints().filter(c => c.householdId === currentUser?.householdId);
  }, [complaints, currentUser]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleMark = () => {
    markGarbageReady(household.id);
    showToast('✓ Garbage marked as ready for collection!');
  };

  const handleUnmark = () => {
    unmarkGarbageReady(household.id);
    showToast('Cancelled – garbage marked as not ready.');
  };

  const handleConfirm = () => {
    confirmCollection(household.id);
    showToast('✓ Collection confirmed. Thank you!');
  };

  const handleMissed = (desc, photo) => {
    reportMissedCollection(household.id, desc, photo);
    showToast('✓ Missed collection reported!');
  };

  const handleBlackspot = (desc) => {
    reportBlackspot(household.id, household.street, household.locality, desc);
    showToast('✓ Blackspot reported to BBMP!');
  };

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'history', label: 'History', icon: Clock },
    { id: 'assistant', label: 'AI Guide', icon: Leaf },
  ];

  if (!household) return <div className="p-8 text-center text-gray-500">Household not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-xs font-semibold text-gray-800">{household.name}</p>
              <p className="text-xs text-gray-400">{LOCALITIES[locality]?.name}</p>
            </div>
            <button onClick={logout} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-5">
        {activeTab === 'home' && (
          <div className="space-y-4">
            {/* Address pill */}
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <MapPin size={14} className="text-green-600" />
              <span>{household.address}, {household.street}</span>
            </div>

            <CollectionWindowCard locality={locality} schedule={schedule} />
            <TruckStatusCard route={route} schedule={schedule} />
            <GarbageReadyCard
              household={household}
              onMark={handleMark}
              onUnmark={handleUnmark}
              onConfirm={handleConfirm}
            />

            {/* Quick Actions */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Report Issues</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowMissed(true)}
                  className="card flex flex-col items-center gap-2 py-4 hover:border-orange-300 hover:bg-orange-50 transition-all text-center"
                >
                  <AlertTriangle size={20} className="text-orange-500" />
                  <span className="text-xs font-semibold text-gray-700">Missed Collection</span>
                </button>
                <button
                  onClick={() => setShowBlackspot(true)}
                  className="card flex flex-col items-center gap-2 py-4 hover:border-red-300 hover:bg-red-50 transition-all text-center"
                >
                  <MapPin size={20} className="text-red-500" />
                  <span className="text-xs font-semibold text-gray-700">Report Blackspot</span>
                </button>
              </div>
            </div>

            {/* Recent activity */}
            {myRequests.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Recent Activity</p>
                <div className="space-y-2">
                  {myRequests.slice(0, 3).map(r => (
                    <div key={r.id} className="card py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{r.street}</p>
                        <p className="text-xs text-gray-400">{formatDate(r.markedAt || r.collectedAt)}</p>
                      </div>
                      <StatusBadge status={r.status} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <MyHistoryTab requests={myRequests} complaints={myComplaints} />
        )}

        {activeTab === 'assistant' && <WasteAssistant />}
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-40">
        <div className="max-w-lg mx-auto flex">
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

      {/* Modals */}
      {showMissed && <ReportMissedModal onClose={() => setShowMissed(false)} onSubmit={handleMissed} />}
      {showBlackspot && (
        <ReportBlackspotModal
          household={household}
          onClose={() => setShowBlackspot(false)}
          onSubmit={handleBlackspot}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-full shadow-lg z-50 whitespace-nowrap">
          {toast}
        </div>
      )}
    </div>
  );
}
