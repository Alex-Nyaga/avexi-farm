import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import AnimalForm from '../components/AnimalForm';
import EventForm from '../components/EventForm';
import { ageStr, daysDiff, fd } from '../utils/helpers';

const Sheep = () => {
  const { db, isAdminOrOwner, setDb, sdb } = useApp();
  const [showAnimalForm, setShowAnimalForm] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedSheepId, setSelectedSheepId] = useState(null);
  const [sheepTab, setSheepTab] = useState('list');

  const liveSheep = db.sheep.filter(s => s.status === 'alive');
  const otherSheep = db.sheep.filter(s => s.status !== 'alive');

  const handleAddSheep = () => {
    setSelectedSheepId(null);
    setShowAnimalForm(true);
  };

  const handleEditSheep = (id) => {
    setSelectedSheepId(id);
    setShowAnimalForm(true);
  };

  const handleAddEvent = () => {
    setShowEventForm(true);
  };

  const handleSellAnimal = (id) => {
    setSelectedSheepId(id);
    setShowEventForm(true);
    setTimeout(() => {
      const eventTypeSelect = document.querySelector('select[name="eventType"]');
      if (eventTypeSelect) eventTypeSelect.value = 'Sold';
    }, 100);
  };

  const handleRecordDeath = (id) => {
    setSelectedSheepId(id);
    setShowEventForm(true);
    setTimeout(() => {
      const eventTypeSelect = document.querySelector('select[name="eventType"]');
      if (eventTypeSelect) eventTypeSelect.value = 'Death';
    }, 100);
  };

  return (
    <div className="theme-sheep">
      <div className="section-banner" style={{ background: 'var(--sheep-l)' }}>
        <span style={{ fontSize: '2rem' }}>🐑</span>
        <div>
          <h3 style={{ color: 'var(--sheep-h)' }}>Sheep Management</h3>
          <p style={{ color: 'var(--sheep-b)' }}>Full livestock records — species, health, breeding, events</p>
        </div>
      </div>
      <div className="page-hdr">
        <div className="page-title" style={{ color: 'var(--sheep-h)' }}>Sheep</div>
        <div className="page-actions">
          {isAdminOrOwner() ? (
            <>
              <button className="btn btn-primary btn-sm" onClick={handleAddSheep}>+ Add Sheep</button>
              <button className="btn btn-outline btn-sm" onClick={handleAddEvent}>+ Log Event</button>
              <button className="btn btn-sm" style={{ background: '#bf8a3a', color: '#fff' }} onClick={() => handleSellAnimal(null)}>💰 Sell Animal</button>
            </>
          ) : (
            <span className="badge bg-amber">View only — staff</span>
          )}
        </div>
      </div>
      <div className="tabs">
        <div className={`tab ${sheepTab === 'list' ? 'active' : ''}`} onClick={() => setSheepTab('list')}>All Sheep</div>
        <div className={`tab ${sheepTab === 'events' ? 'active' : ''}`} onClick={() => setSheepTab('events')}>Events Log</div>
        <div className={`tab ${sheepTab === 'health' ? 'active' : ''}`} onClick={() => setSheepTab('health')}>Health Schedule</div>
      </div>

      {sheepTab === 'list' && (
        <>
          <div className="card">
            <div className="card-hdr">
              <div className="card-title">Live Sheep ({liveSheep.length})</div>
            </div>
            {liveSheep.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🐑</div>
                No sheep recorded yet.
              </div>
            ) : (
              <div className="tbl-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Tag/Name</th>
                      <th>Species/Breed</th>
                      <th>Colour</th>
                      <th>Sex</th>
                      <th>Age</th>
                      <th>Weight</th>
                      <th>Deworming</th>
                      <th>Next Vacc</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {liveSheep.map(sheep => (
                      <tr key={sheep.id}>
                        <td><strong>{sheep.tag}</strong></td>
                        <td>
                          <div>{sheep.species || '—'}</div>
                          <div className="text-muted text-sm">{sheep.breed || ''}</div>
                        </td>
                        <td>{sheep.colour || '—'}</td>
                        <td>{sheep.sex || '—'}</td>
                        <td>{ageStr(sheep.dob)}</td>
                        <td>{sheep.weight ? sheep.weight + ' kg' : '—'}</td>
                        <td>
                          {sheep.lastDeworming ? (
                            <div className="text-sm">{fd(sheep.lastDeworming)}</div>
                          ) : (
                            <span className="badge bg-amber">Not set</span>
                          )}
                        </td>
                        <td>
                          {sheep.nextVaccination ? (
                            <span className={`badge ${daysDiff(sheep.nextVaccination) !== null && daysDiff(sheep.nextVaccination) < 0 ? 'bg-red' : daysDiff(sheep.nextVaccination) <= 5 ? 'bg-amber' : 'bg-green'}`}>
                              {fd(sheep.nextVaccination)}
                            </span>
                          ) : '—'}
                        </td>
                        <td><span className="badge bg-green">alive</span></td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          {isAdminOrOwner() ? (
                            <>
                              <button className="btn btn-outline btn-xs" onClick={() => handleEditSheep(sheep.id)}>Edit</button>
                              <button className="btn btn-xs" style={{ background: '#bf8a3a', color: '#fff' }} onClick={() => handleSellAnimal(sheep.id)}>💰 Sell</button>
                              <button className="btn btn-xs" style={{ background: 'var(--red)', color: '#fff' }} onClick={() => handleRecordDeath(sheep.id)}>💀 Death</button>
                            </>
                          ) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {otherSheep.length > 0 && (
            <div className="card">
              <div className="card-hdr">
                <div className="card-title">Sold / Deceased Sheep ({otherSheep.length})</div>
              </div>
              <div className="tbl-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Tag/Name</th>
                      <th>Breed</th>
                      <th>Sex</th>
                      <th>Age</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {otherSheep.map(sheep => (
                      <tr key={sheep.id}>
                        <td><strong>{sheep.tag}</strong></td>
                        <td>{sheep.breed || sheep.species || '—'}</td>
                        <td>{sheep.sex || '—'}</td>
                        <td>{ageStr(sheep.dob)}</td>
                        <td><span className={`badge ${sheep.status === 'sold' ? 'bg-amber' : 'bg-red'}`}>{sheep.status}</span></td>
                        <td>
                          {isAdminOrOwner() ? (
                            <button className="btn btn-outline btn-xs" onClick={() => handleEditSheep(sheep.id)}>✏️ Edit Info</button>
                          ) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {sheepTab === 'events' && (
        <div className="card">
          <div className="page-hdr" style={{ marginBottom: '.75rem' }}>
            <div></div>
            {isAdminOrOwner() && <button className="btn btn-primary btn-sm" onClick={handleAddEvent}>+ Log Event</button>}
          </div>
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Tag</th>
                  <th>Event</th>
                  <th>Details</th>
                  <th>Drug/Product</th>
                  <th>Cost</th>
                  <th>Notes</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {db.sheepEvents.length === 0 ? (
                  <tr><td colSpan="8" className="tbl-empty">No events yet.</td></tr>
                ) : (
                  db.sheepEvents.sort((a, b) => b.date.localeCompare(a.date)).map(e => {
                    const animal = db.sheep.find(x => x.id === e.animalId);
                    return (
                      <tr key={e.id}>
                        <td>{fd(e.date)}</td>
                        <td>{animal?.tag || '?'}</td>
                        <td><span className="badge bg-blue">{e.event}</span></td>
                        <td className="text-sm">{e.details || '—'}</td>
                        <td className="text-sm">{e.drug || '—'}</td>
                        <td className="text-sm">{e.cost ? 'KES ' + Number(e.cost).toLocaleString() : '—'}</td>
                        <td className="text-sm text-muted">{e.notes || '—'}</td>
                        <td>{isAdminOrOwner() ? <button className="btn btn-outline btn-xs">✏️</button> : '—'}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {sheepTab === 'health' && (
        <div className="card">
          <div className="card-title mb1">Deworming & Vaccination Overview</div>
          {liveSheep.length === 0 ? (
            <div className="tbl-empty">No live sheep.</div>
          ) : (
            <div className="tbl-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Tag</th>
                    <th>Breed</th>
                    <th>Last Dewormed</th>
                    <th>Next Due</th>
                    <th>Days Away</th>
                    <th>Last Vaccinated</th>
                    <th>Next Vaccination</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {liveSheep.map(sheep => {
                    let nextDew = '—', daysAway = '—', healthStatus = 'bg-gray', statusText = 'No schedule';
                    
                    if (sheep.lastDeworming) {
                      const nd = new Date(sheep.lastDeworming + 'T12:00:00');
                      nd.setDate(nd.getDate() + (sheep.dewormingIntervalDays || 90));
                      nextDew = fd(nd.toISOString().slice(0, 10));
                      const diff = Math.round((nd - new Date()) / (1000 * 60 * 60 * 24));
                      daysAway = diff < 0 ? <span style={{ color: 'var(--red)' }}>{Math.abs(diff)}d overdue!</span> : `${diff}d`;
                      healthStatus = diff < 0 ? 'bg-red' : diff <= 5 ? 'bg-amber' : 'bg-green';
                      statusText = diff < 0 ? 'OVERDUE' : diff <= 5 ? 'Due soon' : 'On track';
                    }
                    
                    return (
                      <tr key={sheep.id}>
                        <td><strong>{sheep.tag}</strong></td>
                        <td>{sheep.breed || '—'}</td>
                        <td>{fd(sheep.lastDeworming)}</td>
                        <td>{nextDew}</td>
                        <td>{daysAway}</td>
                        <td>{fd(sheep.lastVaccination)}</td>
                        <td>{sheep.nextVaccination ? fd(sheep.nextVaccination) : '—'}</td>
                        <td><span className={`badge ${healthStatus}`}>{statusText}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <AnimalForm 
        isOpen={showAnimalForm} 
        onClose={() => setShowAnimalForm(false)} 
        type="sheep" 
        animalId={selectedSheepId}
      />

      <EventForm 
        isOpen={showEventForm} 
        onClose={() => setShowEventForm(false)} 
        type="sheep" 
        preselectedAnimalId={selectedSheepId}
      />
    </div>
  );
};

export default Sheep;