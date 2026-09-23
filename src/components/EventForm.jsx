import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { useApp } from '../context/AppContext';
import { uid, today } from '../utils/helpers';

const EventForm = ({ isOpen, onClose, type, preselectedAnimalId, calvesOnly = false }) => {
  const { db, setDb, sdb, isAdminOrOwner } = useApp();
  const [formData, setFormData] = useState({
    animalId: '',
    date: today(),
    eventType: '',
    drug: '',
    dosage: '',
    cost: '',
    notes: '',
    salePrice: '',
    buyer: '',
    cause: '',
    offspring: 1,
    offspringSex: 'Male',
    updateDeworming: 'yes',
    vaccineType: '',
    nextVaccination: ''
  });

  const isCow = type === 'cow';
  const list = isCow ? db.cows : db.sheep;
  
  // Get animals for dropdown
  const getAnimals = () => {
    if (calvesOnly) {
      return db.calves.filter(c => c.status === 'alive');
    }
    const alive = list.filter(a => a.status === 'alive');
    if (isCow) {
      // Include calves in cow events
      alive.push(...db.calves.filter(c => c.status === 'alive'));
    }
    return alive;
  };

  const events = isCow 
    ? ['Health check', 'Deworming', 'Vaccination', 'Treatment', 'Weight recorded', 'Milking issue', 'Calving', 'Breeding/AI', 'Pregnancy check', 'Dry off', 'Sold', 'Death', 'Other']
    : ['Health check', 'Deworming', 'Vaccination', 'Treatment', 'Weight recorded', 'Shearing', 'Lambing', 'Breeding', 'Sold', 'Death', 'Other'];

  useEffect(() => {
    if (preselectedAnimalId) {
      setFormData(prev => ({ ...prev, animalId: preselectedAnimalId }));
    }
  }, [preselectedAnimalId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.animalId) {
      alert('Please select an animal');
      return;
    }

    if (!formData.date) {
      alert('Please enter a date');
      return;
    }

    if (formData.date > today()) {
      alert('⛔ Date cannot be in the future.');
      return;
    }

    const eventList = isCow ? 'cowEvents' : 'sheepEvents';
    const cost = Number(formData.cost) || 0;

    const newEvent = {
      id: uid(),
      animalId: formData.animalId,
      date: formData.date,
      event: formData.eventType,
      drug: formData.drug,
      dosage: formData.dosage,
      cost,
      notes: formData.notes,
      salePrice: formData.salePrice,
      buyer: formData.buyer,
      cause: formData.cause,
      offspring: formData.offspring,
      offspringSex: formData.offspringSex,
      vaccineType: formData.vaccineType,
      nextVaccination: formData.nextVaccination,
      createdAt: today()
    };

    let updatedDb = { ...db };

    // Smart dedup for deworming and vaccination
    if (formData.eventType === 'Deworming' || formData.eventType === 'Vaccination') {
      const existingIdx = db[eventList].findIndex(e => e.animalId === formData.animalId && e.event === formData.eventType);
      if (existingIdx > -1) {
        const old = db[eventList][existingIdx];
        // Remove old transaction if any
        if (old.transactionId) {
          updatedDb.transactions = db.transactions.filter(t => t.id !== old.transactionId);
        }
        // Update existing event
        updatedDb[eventList] = [
          ...db[eventList].slice(0, existingIdx),
          { ...old, ...newEvent, id: old.id },
          ...db[eventList].slice(existingIdx + 1)
        ];
      } else {
        updatedDb[eventList] = [...db[eventList], newEvent];
      }
    } else {
      updatedDb[eventList] = [...db[eventList], newEvent];
    }

    // Handle sale
    if (formData.eventType === 'Sold' && formData.salePrice) {
      const transaction = {
        id: uid(),
        type: 'income',
        date: formData.date,
        amount: Number(formData.salePrice),
        source: type,
        category: 'Animal sale',
        desc: `Sold ${type} — ${list.find(a => a.id === formData.animalId)?.tag || 'Unknown'}`
      };
      updatedDb.transactions = [...db.transactions, transaction];
      newEvent.transactionId = transaction.id;
    }

    // Handle treatment cost
    if (cost > 0) {
      const transaction = {
        id: uid(),
        type: 'expense',
        date: formData.date,
        amount: cost,
        source: type,
        category: 'Veterinary',
        desc: `${formData.eventType} - ${formData.drug || 'Treatment'}`
      };
      updatedDb.transactions = [...db.transactions, transaction];
      newEvent.transactionId = transaction.id;
    }

    // Update animal health schedule if needed
    if (formData.eventType === 'Deworming' && formData.updateDeworming === 'yes') {
      const animalList = isCow ? [...db.cows, ...db.calves] : db.sheep;
      const animalIdx = animalList.findIndex(a => a.id === formData.animalId);
      if (animalIdx > -1) {
        const animal = animalList[animalIdx];
        const updatedAnimal = {
          ...animal,
          lastDeworming: formData.date,
          dewormingDrug: formData.drug
        };
        
        if (isCow) {
          const cowIdx = db.cows.findIndex(c => c.id === formData.animalId);
          if (cowIdx > -1) {
            updatedDb.cows = [...db.cows.slice(0, cowIdx), updatedAnimal, ...db.cows.slice(cowIdx + 1)];
          } else {
            const calfIdx = db.calves.findIndex(c => c.id === formData.animalId);
            if (calfIdx > -1) {
              updatedDb.calves = [...db.calves.slice(0, calfIdx), updatedAnimal, ...db.calves.slice(calfIdx + 1)];
            }
          }
        } else {
          const sheepIdx = db.sheep.findIndex(s => s.id === formData.animalId);
          if (sheepIdx > -1) {
            updatedDb.sheep = [...db.sheep.slice(0, sheepIdx), updatedAnimal, ...db.sheep.slice(sheepIdx + 1)];
          }
        }
      }
    }

    if (formData.eventType === 'Vaccination') {
      const animalList = isCow ? [...db.cows, ...db.calves] : db.sheep;
      const animalIdx = animalList.findIndex(a => a.id === formData.animalId);
      if (animalIdx > -1) {
        const animal = animalList[animalIdx];
        const updatedAnimal = {
          ...animal,
          lastVaccination: formData.date,
          vaccinationType: formData.vaccineType,
          nextVaccination: formData.nextVaccination
        };
        
        if (isCow) {
          const cowIdx = db.cows.findIndex(c => c.id === formData.animalId);
          if (cowIdx > -1) {
            updatedDb.cows = [...db.cows.slice(0, cowIdx), updatedAnimal, ...db.cows.slice(cowIdx + 1)];
          } else {
            const calfIdx = db.calves.findIndex(c => c.id === formData.animalId);
            if (calfIdx > -1) {
              updatedDb.calves = [...db.calves.slice(0, calfIdx), updatedAnimal, ...db.calves.slice(calfIdx + 1)];
            }
          }
        } else {
          const sheepIdx = db.sheep.findIndex(s => s.id === formData.animalId);
          if (sheepIdx > -1) {
            updatedDb.sheep = [...db.sheep.slice(0, sheepIdx), updatedAnimal, ...db.sheep.slice(sheepIdx + 1)];
          }
        }
      }
    }

    setDb(updatedDb);
    sdb();
    onClose();
  };

  if (!isAdminOrOwner()) return null;

  const animals = getAnimals();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Log ${isCow ? 'Cow' : 'Sheep'} Event`}>
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="fg">
            <label>Animal *</label>
            <select name="animalId" value={formData.animalId} onChange={handleChange} required>
              <option value="">Select...</option>
              {animals.map(a => (
                <option key={a.id} value={a.id}>{a.tag} ({a.breed || a.species || ''})</option>
              ))}
            </select>
          </div>
          <div className="fg">
            <label>Date *</label>
            <input type="date" name="date" value={formData.date} onChange={handleChange} max={today()} required />
          </div>
          <div className="fg">
            <label>Event Type *</label>
            <select name="eventType" value={formData.eventType} onChange={handleChange} required>
              <option value="">Select...</option>
              {events.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          <div className="fg">
            <label>Drug / Product</label>
            <input name="drug" value={formData.drug || ''} onChange={handleChange} placeholder="e.g. Ivermectin, Copper Sulphate" />
          </div>
          <div className="fg">
            <label>Dosage / Quantity</label>
            <input name="dosage" value={formData.dosage || ''} onChange={handleChange} placeholder="e.g. 5ml, 2 tablets" />
          </div>
          <div className="fg">
            <label>Cost (KES)</label>
            <input type="number" name="cost" value={formData.cost || ''} onChange={handleChange} placeholder="0" />
          </div>
        </div>

        {/* Event-specific fields */}
        {formData.eventType === 'Sold' && (
          <div className="form-grid mt1">
            <div className="fg">
              <label>Sale Price (KES) *</label>
              <input type="number" name="salePrice" value={formData.salePrice || ''} onChange={handleChange} placeholder="0" required />
            </div>
            <div className="fg">
              <label>Buyer Name</label>
              <input name="buyer" value={formData.buyer || ''} onChange={handleChange} placeholder="Buyer name" />
            </div>
          </div>
        )}

        {formData.eventType === 'Death' && (
          <div className="fg fg-full mt1">
            <label>Cause of Death *</label>
            <input name="cause" value={formData.cause || ''} onChange={handleChange} placeholder="e.g. Disease, Injury, Unknown" required />
          </div>
        )}

        {(formData.eventType === 'Calving' || formData.eventType === 'Lambing') && (
          <div className="form-grid mt1">
            <div className="fg">
              <label>Number of offspring</label>
              <input type="number" name="offspring" value={formData.offspring || 1} onChange={handleChange} />
            </div>
            <div className="fg">
              <label>Offspring sex</label>
              <select name="offspringSex" value={formData.offspringSex || 'Male'} onChange={handleChange}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Mixed">Mixed</option>
              </select>
            </div>
          </div>
        )}

        {formData.eventType === 'Deworming' && (
          <div className="fg fg-full mt1">
            <label>Update last deworming date on animal?</label>
            <select name="updateDeworming" value={formData.updateDeworming || 'yes'} onChange={handleChange}>
              <option value="yes">Yes — update</option>
              <option value="no">No</option>
            </select>
          </div>
        )}

        {formData.eventType === 'Vaccination' && (
          <div className="form-grid mt1">
            <div className="fg">
              <label>Vaccine Type</label>
              <input name="vaccineType" value={formData.vaccineType || ''} onChange={handleChange} placeholder="e.g. FMD vaccine" />
            </div>
            <div className="fg">
              <label>Next vaccination date</label>
              <input type="date" name="nextVaccination" value={formData.nextVaccination || ''} onChange={handleChange} />
            </div>
          </div>
        )}

        <div className="fg fg-full mt1">
          <label>Notes</label>
          <textarea name="notes" value={formData.notes || ''} onChange={handleChange} placeholder="Additional observations..." />
        </div>

        <div className="modal-actions">
          <button type="submit" className="btn btn-primary">Save Event</button>
          <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </Modal>
  );
};

export default EventForm;