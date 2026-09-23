import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import AnimalForm from '../components/AnimalForm';
import EventForm from '../components/EventForm';
import { ageStr, daysDiff, fd, uid, today } from '../utils/helpers';

const Cows = () => {
  const { db, navigate, isAdminOrOwner, setDb, sdb } = useApp();
  const [showAnimalForm, setShowAnimalForm] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedCowId, setSelectedCowId] = useState(null);
  const [cowTab, setCowTab] = useState('list');

  const liveCows = db.cows.filter(c => c.status === 'alive');
  const otherCows = db.cows.filter(c => c.status !== 'alive');
  const liveCalves = db.calves.filter(c => c.status === 'alive');
  const promotedCalves = db.calves.filter(c => c.status === 'promoted');
  const otherCalves = db.calves.filter(c => c.status !== 'alive' && c.status !== 'promoted');

  const handleAddCow = () => {
    setSelectedCowId(null);
    setShowAnimalForm(true);
  };

  const handleEditCow = (id) => {
    setSelectedCowId(id);
    setShowAnimalForm(true);
  };

  const handleAddEvent = () => {
    setShowEventForm(true);
  };

  const handleSellAnimal = (id) => {
    setSelectedCowId(id);
    setShowEventForm(true);
    // Pre-select "Sold" event type
    setTimeout(() => {
      const eventTypeSelect = document.querySelector('select[name="eventType"]');
      if (eventTypeSelect) eventTypeSelect.value = 'Sold';
    }, 100);
  };

  const handleRecordDeath = (id) => {
    setSelectedCowId(id);
    setShowEventForm(true);
    // Pre-select "Death" event type
    setTimeout(() => {
      const eventTypeSelect = document.querySelector('select[name="eventType"]');
      if (eventTypeSelect) eventTypeSelect.value = 'Death';
    }, 100);
  };

  const handleAddCalf = () => {
    setSelectedCowId(null);
    setShowAnimalForm(true);
  };

  const handleEditCalf = (id) => {
    setSelectedCowId(id);
    setShowAnimalForm(true);
  };

  const handlePromoteCalf = (id) => {
    if (!confirm('Promote this calf to a cow?')) return;
    
    const calf = db.calves.find(c => c.id === id);
    if (!calf) return;

    const newCow = {
      ...calf,
      id: uid(),
      status: 'alive',
      promotedFromCalfId: calf.id,
      promotedDate: today()
    };

    const updatedCalves = db.calves.map(c => 
      c.id === id ? { ...c, status: 'promoted', promotedDate: today() } : c
    );

    const updatedDb = {
      ...db,
      calves: updatedCalves,
      cows: [...db.cows, newCow]
    };

    setDb(updatedDb);
    sdb();
  };

  const handleDemoteCalf = (id) => {
    if (!confirm('Demote this cow back to calf?')) return;
    
    const calf = db.calves.find(c => c.id === id);
    const cow = db.cows.find(c => c.promotedFromCalfId === id);
    
    if (!calf || !cow) return;

    const updatedCalves = db.calves.map(c => 
      c.id === id ? { ...c, status: 'alive' } : c
    );

    const updatedDb = {
      ...db,
      calves: updatedCalves,
      cows: db.cows.filter(c => c.id !== cow.id)
    };

    setDb(updatedDb);
    sdb();
  };

  return (
    <div className="theme-cow">
      <div className="section-banner" style={{ background: 'var(--cow-l)' }}>
        <div>
          <h3 style={{ color: 'var(--cow-h)' }}>Cow Management</h3>
          <p style={{ color: 'var(--cow-b)' }}>Full livestock records — species, health, breeding, events</p>
        </div>
      </div>
      <div className="page-hdr">
        <div className="page-title" style={{ color: 'var(--cow-h)' }}>Cows</div>
        <div className="page-actions">
          {isAdminOrOwner() ? (
            <>
              <button className="btn btn-primary btn-sm" onClick={handleAddCow}>+ Add Cow</button>
              <button className="btn btn-outline btn-sm" onClick={handleAddEvent}>+ Log Event</button>
              <button className="btn btn-sm" style={{ background: '#2a7a3a', color: '#fff' }} onClick={() => handleSellAnimal(null)}>Sell Animal</button>
            </>
          ) : (
            <span className="badge bg-amber">View only — staff</span>
          )}
        </div>
      </div>
      <div className="tabs">
        <div className={`tab ${cowTab === 'list' ? 'active' : ''}`} onClick={() => setCowTab('list')}>All Cows</div>
        <div className={`tab ${cowTab === 'calves' ? 'active' : ''}`} onClick={() => setCowTab('calves')}>Calves</div>
        <div className={`tab ${cowTab === 'events' ? 'active' : ''}`} onClick={() => setCowTab('events')}>Events Log</div>
        <div className={`tab ${cowTab === 'health' ? 'active' : ''}`} onClick={() => setCowTab('health')}>Health Schedule</div>
      </div>

      {cowTab === 'list' && (
        <>
          <div className="card">
            <div className="card-hdr">
              <div className="card-title">Live Cows ({liveCows.length})</div>
            </div>
            {liveCows.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">Cows</div>
                No cows recorded yet.
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
                    {liveCows.map(cow => (
                      <tr key={cow.id}>
                        <td><strong>{cow.tag}</strong></td>
                        <td>
                          <div>{cow.species || '—'}</div>
                          <div className="text-muted text-sm">{cow.breed || ''}</div>
                        </td>
                        <td>{cow.colour || '—'}</td>
                        <td>{cow.sex || '—'}</td>
                        <td>{ageStr(cow.dob)}</td>
                        <td>{cow.weight ? cow.weight + ' kg' : '—'}</td>
                        <td>
                          {cow.lastDeworming ? (
                            <div className="text-sm">{fd(cow.lastDeworming)}</div>
                          ) : (
                            <span className="badge bg-amber">Not set</span>
                          )}
                        </td>
                        <td>
                          {cow.nextVaccination ? (
                            <span className={`badge ${daysDiff(cow.nextVaccination) !== null && daysDiff(cow.nextVaccination) < 0 ? 'bg-red' : daysDiff(cow.nextVaccination) <= 5 ? 'bg-amber' : 'bg-green'}`}>
                              {fd(cow.nextVaccination)}
                            </span>
                          ) : '—'}
                        </td>
                        <td><span className="badge bg-green">alive</span></td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          {isAdminOrOwner() ? (
                            <>
                              <button className="btn btn-outline btn-xs" onClick={() => handleEditCow(cow.id)}>Edit</button>
                              <button className="btn btn-xs" style={{ background: '#2a7a3a', color: '#fff' }} onClick={() => handleSellAnimal(cow.id)}>Sell</button>
                              <button className="btn btn-xs" style={{ background: 'var(--red)', color: '#fff' }} onClick={() => handleRecordDeath(cow.id)}>Death</button>
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

          {otherCows.length > 0 && (
            <div className="card">
              <div className="card-hdr">
                <div className="card-title">Sold / Deceased Cows ({otherCows.length})</div>
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
                    {otherCows.map(cow => (
                      <tr key={cow.id}>
                        <td><strong>{cow.tag}</strong></td>
                        <td>{cow.breed || cow.species || '—'}</td>
                        <td>{cow.sex || '—'}</td>
                        <td>{ageStr(cow.dob)}</td>
                        <td><span className={`badge ${cow.status === 'sold' ? 'bg-amber' : 'bg-red'}`}>{cow.status}</span></td>
                        <td>
                          {isAdminOrOwner() ? (
                            <button className="btn btn-outline btn-xs" onClick={() => handleEditCow(cow.id)}>Edit Info</button>
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

      {cowTab === 'calves' && (
        <>
          <div className="page-hdr" style={{ marginBottom: '.75rem' }}>
            <div></div>
            <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
              {isAdminOrOwner() ? (
                <>
                  <button className="btn btn-primary btn-sm" onClick={handleAddCalf}>+ Add Calf</button>
                  <button className="btn btn-outline btn-sm" onClick={() => { setSelectedCowId(null); setShowEventForm(true); }}>+ Log Calf Event</button>
                </>
              ) : (
                <span className="badge bg-amber">View only — staff</span>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-hdr">
              <div className="card-title">Live Calves ({liveCalves.length})</div>
            </div>
            {liveCalves.length === 0 ? (
              <div className="tbl-empty">No live calves recorded.</div>
            ) : (
              <div className="tbl-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Tag</th>
                      <th>Breed</th>
                      <th>Colour</th>
                      <th>Dam (Mother)</th>
                      <th>Sire</th>
                      <th>Born</th>
                      <th>Age</th>
                      <th>Sex</th>
                      <th>Weight</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {liveCalves.map(calf => (
                      <tr key={calf.id}>
                        <td><strong>{calf.tag}</strong></td>
                        <td>{calf.breed || calf.species || '—'}</td>
                        <td>{calf.colour || '—'}</td>
                        <td>{db.cows.find(x => x.id === calf.damId)?.tag || calf.damTag || '—'}</td>
                        <td>{calf.sire || '—'}</td>
                        <td>{fd(calf.dob)}</td>
                        <td>{ageStr(calf.dob)}</td>
                        <td>{calf.sex || '—'}</td>
                        <td>{calf.weight ? calf.weight + ' kg' : '—'}</td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          {isAdminOrOwner() ? (
                            <>
                              <button className="btn btn-outline btn-xs" onClick={() => handleEditCalf(calf.id)}>Edit</button>
                              <button className="btn btn-xs" style={{ background: 'var(--cow-h)', color: '#fff' }} onClick={() => handlePromoteCalf(calf.id)}>Promote to Cow</button>
                              <button className="btn btn-xs" style={{ background: '#2a7a3a', color: '#fff' }} onClick={() => handleSellAnimal(calf.id)}>Sell</button>
                              <button className="btn btn-xs" style={{ background: 'var(--red)', color: '#fff' }} onClick={() => handleRecordDeath(calf.id)}>Death</button>
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

          {promotedCalves.length > 0 && (
            <div className="card mt1">
              <div className="card-hdr">
                <div className="card-title">Promoted to Cows ({promotedCalves.length})</div>
                <div className="card-sub text-sm">These calves are now in the Cows list</div>
              </div>
              <div className="tbl-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Tag</th>
                      <th>Breed</th>
                      <th>Promoted On</th>
                      <th>Now Listed As</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {promotedCalves.map(calf => {
                      const cow = db.cows.find(x => x.promotedFromCalfId === calf.id || x.tag === calf.tag);
                      return (
                        <tr key={calf.id}>
                          <td><strong>{calf.tag}</strong></td>
                          <td>{calf.breed || '—'}</td>
                          <td>{fd(calf.promotedDate)}</td>
                          <td>
                            {cow ? (
                              <span className="badge bg-blue">Cow: {cow.tag}</span>
                            ) : (
                              <span className="badge bg-gray">—</span>
                            )}
                          </td>
                          <td>
                            {isAdminOrOwner() ? (
                              <button className="btn btn-outline btn-xs" onClick={() => handleDemoteCalf(calf.id)} title="Undo promotion — move back to Calves">Undo</button>
                            ) : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {otherCalves.length > 0 && (
            <div className="card">
              <div className="card-hdr">
                <div className="card-title">Sold / Deceased Calves ({otherCalves.length})</div>
              </div>
              <div className="tbl-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Tag</th>
                      <th>Breed</th>
                      <th>Dam</th>
                      <th>Sex</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {otherCalves.map(calf => (
                      <tr key={calf.id}>
                        <td><strong>{calf.tag}</strong></td>
                        <td>{calf.breed || '—'}</td>
                        <td>{db.cows.find(x => x.id === calf.damId)?.tag || calf.damTag || '—'}</td>
                        <td>{calf.sex || '—'}</td>
                        <td><span className={`badge ${calf.status === 'sold' ? 'bg-amber' : 'bg-red'}`}>{calf.status}</span></td>
                        <td>
                          {isAdminOrOwner() ? (
                            <button className="btn btn-outline btn-xs" onClick={() => handleEditCalf(calf.id)}>Edit</button>
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

      {cowTab === 'events' && (
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
                {db.cowEvents.length === 0 ? (
                  <tr><td colSpan="8" className="tbl-empty">No events yet.</td></tr>
                ) : (
                  db.cowEvents.sort((a, b) => b.date.localeCompare(a.date)).map(e => {
                    const animal = db.cows.find(x => x.id === e.animalId) || db.calves.find(x => x.id === e.animalId);
                    return (
                      <tr key={e.id}>
                        <td>{fd(e.date)}</td>
                        <td>{animal?.tag || '?'}</td>
                        <td><span className="badge bg-blue">{e.event}</span></td>
                        <td className="text-sm">{e.details || '—'}</td>
                        <td className="text-sm">{e.drug || '—'}</td>
                        <td className="text-sm">{e.cost ? 'KES ' + Number(e.cost).toLocaleString() : '—'}</td>
                        <td className="text-sm text-muted">{e.notes || '—'}</td>
                        <td>{isAdminOrOwner() ? <button className="btn btn-outline btn-xs">Edit</button> : '—'}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {cowTab === 'health' && (
        <div className="card">
          <div className="card-title mb1">Deworming & Vaccination Overview</div>
          {liveCows.length === 0 ? (
            <div className="tbl-empty">No live cows.</div>
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
                  {liveCows.map(cow => {
                    let nextDew = '—', daysAway = '—', healthStatus = 'bg-gray', statusText = 'No schedule';
                    
                    if (cow.lastDeworming) {
                      const nd = new Date(cow.lastDeworming + 'T12:00:00');
                      nd.setDate(nd.getDate() + (cow.dewormingIntervalDays || 90));
                      nextDew = fd(nd.toISOString().slice(0, 10));
                      const diff = Math.round((nd - new Date()) / (1000 * 60 * 60 * 24));
                      daysAway = diff < 0 ? <span style={{ color: 'var(--red)' }}>{Math.abs(diff)}d overdue!</span> : `${diff}d`;
                      healthStatus = diff < 0 ? 'bg-red' : diff <= 5 ? 'bg-amber' : 'bg-green';
                      statusText = diff < 0 ? 'OVERDUE' : diff <= 5 ? 'Due soon' : 'On track';
                    }
                    
                    return (
                      <tr key={cow.id}>
                        <td><strong>{cow.tag}</strong></td>
                        <td>{cow.breed || '—'}</td>
                        <td>{fd(cow.lastDeworming)}</td>
                        <td>{nextDew}</td>
                        <td>{daysAway}</td>
                        <td>{fd(cow.lastVaccination)}</td>
                        <td>{cow.nextVaccination ? fd(cow.nextVaccination) : '—'}</td>
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
        type="cow" 
        animalId={selectedCowId}
        isCalf={cowTab === 'calves'}
      />

      <EventForm 
        isOpen={showEventForm} 
        onClose={() => setShowEventForm(false)} 
        type="cow" 
        preselectedAnimalId={selectedCowId}
        calvesOnly={cowTab === 'calves'}
      />
    </div>
  );
};

export default Cows;