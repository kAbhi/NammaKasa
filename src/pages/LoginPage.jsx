import React, { useState } from 'react';
import { Home, Truck, Shield, ChevronRight, MapPin } from 'lucide-react';
import { Logo } from '../components/shared';
import { getHouseholds, getWorkers } from '../data/storage';
import { useApp } from '../context/AppContext';

function LoginCard({ icon: Icon, title, description, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left card hover:border-green-300 hover:shadow-md transition-all duration-200 group"
    >
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${color} flex-shrink-0`}>
          <Icon size={24} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900">{title}</p>
          <p className="text-sm text-gray-500 mt-0.5">{description}</p>
        </div>
        <ChevronRight size={18} className="text-gray-400 group-hover:text-green-600 transition-colors" />
      </div>
    </button>
  );
}

function ResidentLogin({ onBack, onLogin }) {
  const households = getHouseholds();
  const [selectedId, setSelectedId] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (!selectedId) { setError('Please select your household.'); return; }
    const h = households.find(hh => hh.id === selectedId);
    if (!h) { setError('Household not found.'); return; }
    if (pin !== h.pin) { setError('Incorrect PIN. Try: ' + h.pin); return; }
    onLogin({ role: 'resident', householdId: h.id, name: h.name, locality: h.locality });
  };

  const localities = [...new Set(households.map(h => h.locality))];

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
        ← Back
      </button>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Select Household</label>
        <select className="select" value={selectedId} onChange={e => { setSelectedId(e.target.value); setError(''); }}>
          <option value="">Choose your household…</option>
          {localities.map(loc => (
            <optgroup key={loc} label={loc.charAt(0).toUpperCase() + loc.slice(1)}>
              {households.filter(h => h.locality === loc).map(h => (
                <option key={h.id} value={h.id}>{h.name} – {h.address}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">PIN</label>
        <input
          type="password"
          className="input"
          placeholder="Enter 4-digit PIN"
          value={pin}
          maxLength={4}
          onChange={e => { setPin(e.target.value); setError(''); }}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
        />
        <p className="text-xs text-gray-400 mt-1">Demo PINs: 1234, 2345, 3456… (shown in hint on error)</p>
      </div>
      {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
      <button onClick={handleLogin} className="btn-primary w-full">Sign In as Resident</button>
    </div>
  );
}

function WorkerLogin({ onBack, onLogin }) {
  const workers = getWorkers();
  const [selectedId, setSelectedId] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (!selectedId) { setError('Please select a worker.'); return; }
    const w = workers.find(ww => ww.id === selectedId);
    if (!w) { setError('Worker not found.'); return; }
    if (pin !== w.pin) { setError('Incorrect PIN. Try: ' + w.pin); return; }
    onLogin({ role: 'worker', workerId: w.id, name: w.name, locality: w.locality, routeId: w.routeId });
  };

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-700">← Back</button>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Select Worker</label>
        <select className="select" value={selectedId} onChange={e => { setSelectedId(e.target.value); setError(''); }}>
          <option value="">Choose your name…</option>
          {workers.map(w => (
            <option key={w.id} value={w.id}>{w.name} – {w.locality.charAt(0).toUpperCase() + w.locality.slice(1)}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">PIN</label>
        <input
          type="password"
          className="input"
          placeholder="Enter PIN"
          value={pin}
          maxLength={4}
          onChange={e => { setPin(e.target.value); setError(''); }}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
        />
        <p className="text-xs text-gray-400 mt-1">Demo PINs: 1111, 2222, 3333</p>
      </div>
      {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
      <button onClick={handleLogin} className="btn-primary w-full">Sign In as Worker</button>
    </div>
  );
}

function AdminLogin({ onBack, onLogin }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (pin === '0000') {
      onLogin({ role: 'admin', name: 'BBMP Admin' });
    } else {
      setError('Incorrect PIN. Use 0000 for demo.');
    }
  };

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-700">← Back</button>
      <div className="p-3 bg-green-50 rounded-xl border border-green-200">
        <p className="text-sm text-green-800 font-medium">Admin Access</p>
        <p className="text-xs text-green-700 mt-0.5">BBMP Solid Waste Management Division</p>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Admin PIN</label>
        <input
          type="password"
          className="input"
          placeholder="Enter admin PIN"
          value={pin}
          maxLength={4}
          onChange={e => { setPin(e.target.value); setError(''); }}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
        />
        <p className="text-xs text-gray-400 mt-1">Demo PIN: 0000</p>
      </div>
      {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
      <button onClick={handleLogin} className="btn-primary w-full">Sign In as Admin</button>
    </div>
  );
}

export default function LoginPage() {
  const { login } = useApp();
  const [view, setView] = useState('select'); // select | resident | worker | admin

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-3">
              <Logo size="lg" />
            </div>
            <p className="text-gray-600 text-sm">Bengaluru's Smart Waste Coordination</p>
            <div className="flex items-center justify-center gap-1 mt-2 text-xs text-gray-400">
              <MapPin size={12} />
              <span>Whitefield · Indiranagar · Koramangala</span>
            </div>
          </div>

          <div className="card">
            {view === 'select' && (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-600 mb-4">Sign in as</p>
                <LoginCard
                  icon={Home}
                  title="Resident"
                  description="Track collection, report issues"
                  color="bg-green-100 text-green-700"
                  onClick={() => setView('resident')}
                />
                <LoginCard
                  icon={Truck}
                  title="Collection Worker"
                  description="Manage routes, update status"
                  color="bg-blue-100 text-blue-700"
                  onClick={() => setView('worker')}
                />
                <LoginCard
                  icon={Shield}
                  title="BBMP Admin"
                  description="Monitor performance, resolve complaints"
                  color="bg-purple-100 text-purple-700"
                  onClick={() => setView('admin')}
                />
              </div>
            )}
            {view === 'resident' && <ResidentLogin onBack={() => setView('select')} onLogin={login} />}
            {view === 'worker' && <WorkerLogin onBack={() => setView('select')} onLogin={login} />}
            {view === 'admin' && <AdminLogin onBack={() => setView('select')} onLogin={login} />}
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            NammaParisara · BBMP Solid Waste Management · Bengaluru
          </p>
        </div>
      </div>
    </div>
  );
}
