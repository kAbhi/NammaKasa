import React, { useState, useMemo } from 'react';
import {
  Users, Plus, Calendar, Clock, MapPin, Recycle, CheckCircle,
  ChevronDown, ChevronUp, Building2, Package, Info, XCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LOCALITIES, COMMUNITY_WASTE_CATEGORIES } from '../data/seed';
import { StatusBadge, Modal, EmptyState, MiniBar } from '../components/shared';

function formatDriveDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

function getDefaultDriveDate() {
  const d = new Date();
  const daysUntilSat = (6 - d.getDay() + 7) % 7 || 7;
  d.setDate(d.getDate() + daysUntilSat);
  return d.toISOString().split('T')[0];
}

function CategoryPill({ categoryId }) {
  const cat = COMMUNITY_WASTE_CATEGORIES.find(c => c.id === categoryId) || COMMUNITY_WASTE_CATEGORIES[0];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cat.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cat.dot}`} />
      {cat.shortLabel}
    </span>
  );
}

function OrganizeDriveModal({ household, onClose, onSubmit }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('e-waste');
  const [locality, setLocality] = useState(household?.locality || 'whitefield');
  const [dropoffLocation, setDropoffLocation] = useState(household ? `${household.address}, ${household.street}` : '');
  const [date, setDate] = useState(getDefaultDriveDate);
  const [timeWindow, setTimeWindow] = useState('9:00 AM – 12:00 PM');
  const [targetHouseholds, setTargetHouseholds] = useState('10');
  const [partner, setPartner] = useState('');
  const [acceptedItems, setAcceptedItems] = useState('');
  const [organizerPledge, setOrganizerPledge] = useState('');

  const selectedCategory = COMMUNITY_WASTE_CATEGORIES.find(c => c.id === category);
  const canSubmit = title.trim() && dropoffLocation.trim() && date && acceptedItems.trim();

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({
      title,
      category,
      locality,
      dropoffLocation,
      date,
      timeWindow,
      targetHouseholds,
      partner,
      acceptedItems,
      organizerPledge,
    });
    onClose();
  };

  return (
    <Modal title="Organize Collection Drive" onClose={onClose}>
      <div className="space-y-3.5">
        <div className="p-3 bg-green-50 rounded-xl border border-green-200">
          <p className="text-xs text-green-800 leading-snug">
            Pool non-BBMP waste with your neighbours to meet recycler pickup minimums and keep hazardous items out of landfills.
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Drive Title *</label>
          <input
            className="input"
            placeholder="e.g. Saturday E-Waste & Cable Drive"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Waste Type *</label>
            <select className="select" value={category} onChange={e => setCategory(e.target.value)}>
              {COMMUNITY_WASTE_CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Locality *</label>
            <select className="select" value={locality} onChange={e => setLocality(e.target.value)}>
              {Object.values(LOCALITIES).map(loc => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Drop-off Point *</label>
          <input
            className="input"
            placeholder="e.g. Apartment gate, clubhouse, or park entrance"
            value={dropoffLocation}
            onChange={e => setDropoffLocation(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Date *</label>
            <input
              type="date"
              className="input"
              value={date}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => setDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Time Window</label>
            <input
              className="input"
              placeholder="9:00 AM – 12:00 PM"
              value={timeWindow}
              onChange={e => setTimeWindow(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Target Households</label>
            <input
              type="number"
              min={2}
              max={100}
              className="input"
              value={targetHouseholds}
              onChange={e => setTargetHouseholds(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Recycler / Partner</label>
            <input
              className="input"
              placeholder="e.g. Saahas, Goonj"
              value={partner}
              onChange={e => setPartner(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Accepted Items &amp; Prep *</label>
          <textarea
            className="input resize-none"
            rows={2}
            placeholder={selectedCategory ? `e.g. ${selectedCategory.examples}` : 'List accepted items and any prep instructions...'}
            value={acceptedItems}
            onChange={e => setAcceptedItems(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Your Pledged Items (optional)</label>
          <input
            className="input"
            placeholder="e.g. 2 old phones, 1 broken monitor"
            value={organizerPledge}
            onChange={e => setOrganizerPledge(e.target.value)}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Publish Community Drive
        </button>
      </div>
    </Modal>
  );
}

function JoinDriveModal({ drive, onClose, onConfirm }) {
  const [pledgedItems, setPledgedItems] = useState('');
  const cat = COMMUNITY_WASTE_CATEGORIES.find(c => c.id === drive.category);

  const handleConfirm = () => {
    onConfirm(pledgedItems);
    onClose();
  };

  return (
    <Modal title="Join Collection Drive" onClose={onClose}>
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-xl p-3 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-bold text-gray-900">{drive.title}</p>
            <CategoryPill categoryId={drive.category} />
          </div>
          <p className="text-xs text-gray-500">
            {formatDriveDate(drive.date)} · {drive.timeWindow}
          </p>
          <p className="text-xs text-gray-600">{drive.dropoffLocation}</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            What items are you bringing?
          </label>
          <textarea
            className="input resize-none"
            rows={3}
            placeholder={cat ? `e.g. ${cat.examples}` : 'List items so the organizer can estimate volume...'}
            value={pledgedItems}
            onChange={e => setPledgedItems(e.target.value)}
          />
          <p className="text-xs text-gray-400 mt-1">
            Helps the organizer estimate total load for the recycling partner.
          </p>
        </div>

        <button onClick={handleConfirm} className="btn-primary w-full flex items-center justify-center gap-2">
          <CheckCircle size={16} />
          Confirm &amp; Join Drive
        </button>
      </div>
    </Modal>
  );
}

function DriveCard({ drive, household, onJoinClick, onLeave, onUpdateStatus }) {
  const [showParticipants, setShowParticipants] = useState(false);

  const isOrganizer = drive.organizerHouseholdId === household.id;
  const myParticipation = drive.participants.find(p => p.householdId === household.id);
  const isJoined = Boolean(myParticipation);
  const isUpcoming = drive.status === 'upcoming';

  return (
    <div className={`card space-y-3 ${!isUpcoming ? 'opacity-75' : ''}`}>
      {/* Top badges */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <CategoryPill categoryId={drive.category} />
          {isOrganizer && (
            <span className="badge bg-green-50 text-green-700 border border-green-200">
              Your Drive
            </span>
          )}
        </div>
        <StatusBadge status={drive.status} />
      </div>

      {/* Title & organizer */}
      <div>
        <h3 className="font-bold text-gray-900 leading-snug">{drive.title}</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          Organized by <span className="font-semibold text-gray-700">{drive.organizerName}</span> · {LOCALITIES[drive.locality]?.name}
        </p>
      </div>

      {/* Metadata */}
      <div className="space-y-1.5 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <Calendar size={13} className="text-green-600 flex-shrink-0" />
          <span className="font-medium text-gray-800">{formatDriveDate(drive.date)}</span>
          <span className="text-gray-400">·</span>
          <Clock size={13} className="text-gray-400 flex-shrink-0" />
          <span>{drive.timeWindow}</span>
        </div>
        <div className="flex items-start gap-2">
          <MapPin size={13} className="text-green-600 flex-shrink-0 mt-0.5" />
          <span>{drive.dropoffLocation}</span>
        </div>
        {drive.partner && (
          <div className="flex items-start gap-2">
            <Building2 size={13} className="text-gray-400 flex-shrink-0 mt-0.5" />
            <span>Partner: <span className="font-medium text-gray-700">{drive.partner}</span></span>
          </div>
        )}
      </div>

      {/* Accepted items */}
      <div className="bg-gray-50 rounded-xl p-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Accepted Items</p>
        <p className="text-xs text-gray-700 leading-relaxed">{drive.acceptedItems}</p>
      </div>

      {/* Participation progress */}
      <div>
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-gray-500 font-medium">
            <span className="text-gray-900 font-bold">{drive.participants.length}</span> / {drive.targetHouseholds} households joined
          </span>
          <button
            onClick={() => setShowParticipants(v => !v)}
            className="text-green-700 hover:text-green-800 font-semibold flex items-center gap-0.5"
          >
            {showParticipants ? 'Hide list' : 'View pledges'}
            {showParticipants ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>
        <MiniBar
          value={drive.participants.length}
          max={drive.targetHouseholds}
          color={drive.participants.length >= drive.targetHouseholds ? 'bg-green-600' : 'bg-green-500'}
        />
      </div>

      {/* Participants list */}
      {showParticipants && (
        <div className="border-t border-gray-100 pt-2.5 space-y-2">
          {drive.participants.map(p => (
            <div key={p.householdId} className="flex items-start gap-2 text-xs">
              <div className="bg-green-50 text-green-700 p-1 rounded-lg flex-shrink-0 mt-0.5">
                <Package size={12} />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-800">
                  {p.name}
                  {p.householdId === drive.organizerHouseholdId && (
                    <span className="ml-1.5 text-[10px] font-semibold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full">
                      Organizer
                    </span>
                  )}
                </p>
                <p className="text-gray-500">{p.pledgedItems}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      {isUpcoming && (
        <div className="pt-1">
          {isOrganizer ? (
            <div className="flex gap-2">
              <button
                onClick={() => onUpdateStatus(drive.id, 'completed')}
                className="btn-primary flex-1 text-xs py-2 flex items-center justify-center gap-1.5"
              >
                <CheckCircle size={14} />
                Mark Completed
              </button>
              <button
                onClick={() => onUpdateStatus(drive.id, 'cancelled')}
                className="btn-secondary text-xs py-2 px-3 text-red-600 hover:bg-red-50 hover:border-red-200 flex items-center justify-center gap-1"
              >
                <XCircle size={14} />
                Cancel
              </button>
            </div>
          ) : isJoined ? (
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-green-700 bg-green-50 rounded-xl p-2.5 text-xs">
                <CheckCircle size={14} className="flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">You&apos;ve joined this drive</p>
                  <p className="text-green-600 mt-0.5">Pledged: {myParticipation.pledgedItems}</p>
                </div>
              </div>
              <button
                onClick={() => onLeave(drive.id)}
                className="btn-secondary w-full text-xs py-2"
              >
                Leave Drive
              </button>
            </div>
          ) : (
            <button
              onClick={() => onJoinClick(drive)}
              className="btn-primary w-full text-sm py-2.5 flex items-center justify-center gap-2"
            >
              <Users size={15} />
              Join &amp; Pledge Waste
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function CommunityPage({ household, showToast }) {
  const {
    communityDrives,
    createCommunityDrive,
    joinCommunityDrive,
    leaveCommunityDrive,
    updateCommunityDriveStatus,
  } = useApp();

  const [scope, setScope] = useState('locality'); // 'locality' | 'all'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showOrganize, setShowOrganize] = useState(false);
  const [joiningDrive, setJoiningDrive] = useState(null);

  const allDrives = communityDrives();

  const filteredDrives = useMemo(() => {
    const statusOrder = { upcoming: 0, completed: 1, cancelled: 2 };
    return allDrives
      .filter(d => (scope === 'locality' ? d.locality === household.locality : true))
      .filter(d => (selectedCategory === 'all' ? true : d.category === selectedCategory))
      .sort((a, b) => {
        const orderDiff = (statusOrder[a.status] ?? 3) - (statusOrder[b.status] ?? 3);
        if (orderDiff !== 0) return orderDiff;
        return (a.date || '').localeCompare(b.date || '');
      });
  }, [allDrives, scope, selectedCategory, household.locality]);

  const upcomingCount = allDrives.filter(d => d.status === 'upcoming').length;

  const handleCreate = (data) => {
    createCommunityDrive(data, household);
    showToast('✓ Community collection drive published!');
    if (data.locality !== household.locality) {
      setScope('all');
    }
    setSelectedCategory('all');
  };

  const handleJoin = (pledgedItems) => {
    if (!joiningDrive) return;
    joinCommunityDrive(joiningDrive.id, household, pledgedItems);
    showToast('✓ Joined drive & pledged your items!');
  };

  const handleLeave = (driveId) => {
    leaveCommunityDrive(driveId, household.id);
    showToast('Left the community drive.');
  };

  const handleStatusChange = (driveId, status) => {
    updateCommunityDriveStatus(driveId, status);
    showToast(status === 'completed' ? '✓ Drive marked as completed!' : 'Drive cancelled.');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Community Drives</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {upcomingCount} upcoming drive{upcomingCount === 1 ? '' : 's'} for non-BBMP waste
          </p>
        </div>
        <button
          onClick={() => setShowOrganize(true)}
          className="btn-primary text-xs px-3.5 py-2 flex items-center gap-1.5 flex-shrink-0"
        >
          <Plus size={15} />
          Organize Drive
        </button>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-2.5 bg-green-50 border border-green-200 rounded-2xl p-3">
        <Info size={15} className="text-green-700 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-green-800 leading-snug">
          BBMP door-to-door trucks don&apos;t routinely collect <span className="font-semibold">e-waste, batteries, textiles, thermocol, or bulky items</span>. Organize or join a neighbour-led drop-off drive to recycle responsibly.
        </p>
      </div>

      {/* Scope toggle */}
      <div className="bg-white border border-gray-100 rounded-xl p-1 flex gap-1 shadow-sm">
        <button
          onClick={() => setScope('locality')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
            scope === 'locality' ? 'tab-active' : 'tab-inactive'
          }`}
        >
          My Locality ({LOCALITIES[household.locality]?.name})
        </button>
        <button
          onClick={() => setScope('all')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
            scope === 'all' ? 'tab-active' : 'tab-inactive'
          }`}
        >
          All Bengaluru ({allDrives.length})
        </button>
      </div>

      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`flex-shrink-0 text-xs rounded-full px-3 py-1.5 font-medium border transition-colors ${
            selectedCategory === 'all'
              ? 'bg-green-600 text-white border-green-600'
              : 'bg-white text-gray-600 border-gray-200 hover:border-green-300'
          }`}
        >
          All Types
        </button>
        {COMMUNITY_WASTE_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex-shrink-0 text-xs rounded-full px-3 py-1.5 font-medium border transition-colors ${
              selectedCategory === cat.id
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-green-300'
            }`}
          >
            {cat.shortLabel}
          </button>
        ))}
      </div>

      {/* Drive list */}
      {filteredDrives.length === 0 ? (
        <EmptyState
          icon={Recycle}
          title="No community drives found"
          description={
            scope === 'locality'
              ? `No matching drives in ${LOCALITIES[household.locality]?.name} yet. Start one for your neighbours!`
              : 'No drives match this filter. Try another category or organize one.'
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredDrives.map(drive => (
            <DriveCard
              key={drive.id}
              drive={drive}
              household={household}
              onJoinClick={setJoiningDrive}
              onLeave={handleLeave}
              onUpdateStatus={handleStatusChange}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showOrganize && (
        <OrganizeDriveModal
          household={household}
          onClose={() => setShowOrganize(false)}
          onSubmit={handleCreate}
        />
      )}
      {joiningDrive && (
        <JoinDriveModal
          drive={joiningDrive}
          onClose={() => setJoiningDrive(null)}
          onConfirm={handleJoin}
        />
      )}
    </div>
  );
}
