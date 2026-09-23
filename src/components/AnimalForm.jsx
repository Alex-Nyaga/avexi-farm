import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { useApp } from '../context/AppContext';
import { uid, today } from '../utils/helpers';

const AnimalForm = ({ isOpen, onClose, type, animalId, isCalf = false }) => {
  const { db, setDb, sdb, isAdminOrOwner } = useApp();
  const [formData, setFormData] = useState({});
  const [photoPreview, setPhotoPreview] = useState(null);

  const isCow = type === 'cow';
  const list = isCow ? db.cows : db.sheep;
  const animal = animalId ? list.find(x => x.id === animalId) : null;

  const species = isCow 
    ? ['Friesian', 'Jersey', 'Ayrshire', 'Guernsey', 'Brown Swiss', 'Zebu/Boran', 'Crossbreed', 'Other']
    : ['Dorper', 'Merino', 'Hampshire', 'Suffolk', 'Corriedale', 'Red Maasai', 'Blackhead Persian', 'Crossbreed', 'Other'];

  useEffect(() => {
    if (animal) {
      setFormData(animal);
      if (animal.photo) setPhotoPreview(animal.photo);
    } else {
      setFormData({
        tag: '',
        species: '',
        breed: '',
        colour: '',
        sex: 'Female',
        dob: '',
        weight: '',
        rfid: '',
        sire: '',
        lastDeworming: '',
        dewormingIntervalDays: 90,
        dewormingDrug: '',
        lastVaccination: '',
        nextVaccination: '',
        vaccinationType: '',
        avgMilkPerDay: '',
        lactation: 'Milking',
        status: 'alive',
        purchasePrice: '',
        purchaseDate: today(),
        notes: ''
      });
      setPhotoPreview(null);
    }
  }, [animal, animalId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target.result);
        setFormData(prev => ({ ...prev, photo: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.tag.trim()) {
      alert('Tag/Name is required');
      return;
    }

    // Check for duplicates
    const duplicate = list.find(x => x.tag.trim().toLowerCase() === formData.tag.trim().toLowerCase() && x.id !== animalId);
    if (duplicate) {
      alert(`A ${type} with the name/tag "${duplicate.tag}" already exists. Please use a unique name or tag.`);
      return;
    }

    const targetList = isCow ? (isCalf ? 'calves' : 'cows') : 'sheep';
    const purchasePrice = Number(formData.purchasePrice) || 0;
    const purchaseDate = formData.purchaseDate || today();

    const newAnimal = {
      ...formData,
      id: animalId || uid(),
      purchasePrice,
      purchaseDate,
      createdAt: animal?.createdAt || today()
    };

    let updatedDb;
    if (animalId) {
      // Update existing
      const index = list.findIndex(x => x.id === animalId);
      if (index > -1) {
        const updatedList = [...list];
        updatedList[index] = { ...list[index], ...newAnimal };
        updatedDb = { ...db, [targetList]: updatedList };
      }
    } else {
      // Add new
      updatedDb = { ...db, [targetList]: [...db[targetList], newAnimal] };
      
      // Auto-create purchase expense transaction
      if (purchasePrice > 0) {
        updatedDb.transactions = [
          ...db.transactions,
          {
            id: uid(),
            type: 'expense',
            date: purchaseDate,
            amount: purchasePrice,
            source: type,
            category: isCow ? 'Cow purchase' : 'Sheep purchase',
            desc: `Bought ${type} — ${formData.tag}`
          }
        ];
      }
    }

    setDb(updatedDb);
    sdb();
    onClose();
  };

  const handleDelete = () => {
    if (!confirm('Delete this animal record? This will also remove all its events.')) return;
    
    const targetList = isCow ? (isCalf ? 'calves' : 'cows') : 'sheep';
    const eventList = isCow ? 'cowEvents' : 'sheepEvents';
    
    // Remove linked transactions from events
    const animalEvents = db[eventList].filter(e => e.animalId === animalId);
    let updatedTransactions = db.transactions;
    animalEvents.forEach(e => {
      if (e.transactionId) {
        updatedTransactions = updatedTransactions.filter(t => t.id !== e.transactionId);
      }
    });

    // Remove events and animal
    const updatedDb = {
      ...db,
      [eventList]: db[eventList].filter(e => e.animalId !== animalId),
      [targetList]: db[targetList].filter(x => x.id !== animalId),
      transactions: updatedTransactions
    };

    setDb(updatedDb);
    sdb();
    onClose();
  };

  if (!isAdminOrOwner()) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={animal ? `Edit ${isCow ? 'Cow' : 'Sheep'}` : `Add ${isCalf ? 'Calf' : isCow ? 'Cow' : 'Sheep'}`}>
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="fg">
            <label>Tag / Name *</label>
            <input name="tag" value={formData.tag || ''} onChange={handleChange} placeholder="e.g. C-001" required />
          </div>
          <div className="fg">
            <label>Species / Breed</label>
            <select name="species" value={formData.species || ''} onChange={handleChange}>
              <option value="">Select...</option>
              {species.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="fg">
            <label>Colour / Markings</label>
            <input name="colour" value={formData.colour || ''} onChange={handleChange} placeholder="e.g. Black & white" />
          </div>
          <div className="fg">
            <label>Sex</label>
            <select name="sex" value={formData.sex || 'Female'} onChange={handleChange}>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
            </select>
          </div>
          <div className="fg">
            <label>Date of Birth</label>
            <input type="date" name="dob" value={formData.dob || ''} onChange={handleChange} max={today()} />
          </div>
          <div className="fg">
            <label>Weight (kg)</label>
            <input type="number" name="weight" value={formData.weight || ''} onChange={handleChange} placeholder="kg" />
          </div>
          <div className="fg">
            <label>Ear Tag / RFID</label>
            <input name="rfid" value={formData.rfid || ''} onChange={handleChange} placeholder="optional" />
          </div>
          <div className="fg">
            <label>Sire (Father tag)</label>
            <input name="sire" value={formData.sire || ''} onChange={handleChange} placeholder="optional" />
          </div>
        </div>

        <div className="section-divider">Health Schedule</div>
        <div className="form-grid">
          <div className="fg">
            <label>Last Deworming Date</label>
            <input type="date" name="lastDeworming" value={formData.lastDeworming || ''} onChange={handleChange} />
          </div>
          <div className="fg">
            <label>Deworming Interval (days)</label>
            <input type="number" name="dewormingIntervalDays" value={formData.dewormingIntervalDays || 90} onChange={handleChange} placeholder="90" />
          </div>
          <div className="fg">
            <label>Deworming Drug Used</label>
            <input name="dewormingDrug" value={formData.dewormingDrug || ''} onChange={handleChange} placeholder="e.g. Ivermectin" />
          </div>
          <div className="fg">
            <label>Last Vaccination Date</label>
            <input type="date" name="lastVaccination" value={formData.lastVaccination || ''} onChange={handleChange} />
          </div>
          <div className="fg">
            <label>Next Vaccination Date</label>
            <input type="date" name="nextVaccination" value={formData.nextVaccination || ''} onChange={handleChange} />
          </div>
          <div className="fg">
            <label>Vaccination Type</label>
            <input name="vaccinationType" value={formData.vaccinationType || ''} onChange={handleChange} placeholder="e.g. FMD, Lumpy skin" />
          </div>
        </div>

        {isCow && !isCalf && (
          <>
            <div className="section-divider">Milk</div>
            <div className="form-grid">
              <div className="fg">
                <label>Avg Milk/Day (L)</label>
                <input type="number" name="avgMilkPerDay" value={formData.avgMilkPerDay || ''} onChange={handleChange} placeholder="litres" />
              </div>
              <div className="fg">
                <label>Lactation Status</label>
                <select name="lactation" value={formData.lactation || 'Milking'} onChange={handleChange}>
                  <option value="Milking">Milking</option>
                  <option value="Dry">Dry</option>
                  <option value="Heifer">Heifer</option>
                </select>
              </div>
            </div>
          </>
        )}

        <div className="section-divider">Status & Notes</div>
        <div className="form-grid">
          <div className="fg">
            <label>Status</label>
            <select name="status" value={formData.status || 'alive'} onChange={handleChange}>
              <option value="alive">Alive</option>
              <option value="sold">Sold</option>
              <option value="dead">Dead</option>
            </select>
          </div>
          <div className="fg">
            <label>Purchase Price (KES)</label>
            <input type="number" name="purchasePrice" value={formData.purchasePrice || ''} onChange={handleChange} placeholder="0" />
          </div>
          <div className="fg">
            <label>Purchase Date</label>
            <input type="date" name="purchaseDate" value={formData.purchaseDate || today()} onChange={handleChange} max={today()} />
          </div>
        </div>

        <div className="fg fg-full">
          <label>Notes / Description</label>
          <textarea name="notes" value={formData.notes || ''} onChange={handleChange} />
        </div>

        <div className="fg fg-full">
          <label>Photo (optional)</label>
          <input type="file" accept="image/*" onChange={handlePhotoChange} />
          {photoPreview && <img src={photoPreview} className="photo-preview mt1" alt="Preview" />}
        </div>

        <div className="modal-actions">
          <button type="submit" className="btn btn-primary">Save {isCow ? 'Cow' : 'Sheep'}</button>
          <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
          {animalId && <button type="button" className="btn btn-danger btn-sm" onClick={handleDelete}>Delete</button>}
        </div>
      </form>
    </Modal>
  );
};

export default AnimalForm;