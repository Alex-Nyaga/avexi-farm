const select = (name, label, options, extra = {}) => ({ name, label, type: 'select', options, ...extra });
const text = (name, label, extra = {}) => ({ name, label, type: 'text', ...extra });
const number = (name, label, extra = {}) => ({ name, label, type: 'number', ...extra });
const date = (name, label, extra = {}) => ({ name, label, type: 'date', ...extra });

const METHODS = ['Manual', 'Animal traction', 'Tractor', 'Hired contractor', 'Other'];
const LABOUR = ['Family labour', 'Hired labour', 'Contractor', 'Mechanised', 'Other'];
const UNITS = ['kg', 'g', 'litres', 'ml', 'bags', 'sacks', 'crates', 'acres', 'hectares', 'hours', 'plants', 'seeds'];

export const ACTIVITY_SCHEMAS = {
  crop: {
    'Land preparation': [
      select('method', 'Preparation method', METHODS, { required: true }),
      number('area', 'Area prepared', { suffix: 'acres', min: 0, step: 'any' }),
      select('labourType', 'Labour / power source', LABOUR),
      number('labourers', 'People / operators', { min: 0, step: 1 }),
      number('hours', 'Work duration', { suffix: 'hours', min: 0, step: 'any' }),
      text('equipment', 'Equipment used')
    ],
    'Field preparation': [
      select('method', 'Preparation method', METHODS, { required: true }),
      number('area', 'Area prepared', { suffix: 'acres', min: 0, step: 'any' }),
      select('labourType', 'Labour / power source', LABOUR),
      number('labourers', 'People / operators', { min: 0, step: 1 }),
      number('hours', 'Work duration', { suffix: 'hours', min: 0, step: 'any' }),
      text('equipment', 'Equipment used')
    ],
    'Planting / Sowing': [
      text('variety', 'Crop variety / cultivar'),
      select('seedSource', 'Seed source', ['Certified supplier', 'Farm-saved', 'Community / market', 'Other']),
      number('seedQuantity', 'Seed quantity', { min: 0, step: 'any' }),
      select('seedUnit', 'Seed unit', ['kg', 'g', 'bags', 'sacks', 'seeds', 'seedlings']),
      number('area', 'Area planted', { suffix: 'acres', min: 0, step: 'any' }),
      select('plantingMethod', 'Planting method', ['Direct seeding', 'Transplanting', 'Machine planter', 'Other']),
      text('seedTreatment', 'Seed treatment (if used)')
    ],
    Planting: [
      text('variety', 'Crop variety / cultivar'),
      select('seedSource', 'Seed source', ['Certified supplier', 'Farm-saved', 'Community / market']),
      number('seedQuantity', 'Seed quantity', { min: 0, step: 'any' }),
      select('seedUnit', 'Seed unit', ['kg', 'g', 'bags', 'sacks', 'seeds', 'seedlings']),
      number('area', 'Area planted', { suffix: 'acres', min: 0, step: 'any' }),
      select('plantingMethod', 'Planting method', ['Direct seeding', 'Transplanting', 'Machine planter']),
      text('seedTreatment', 'Seed treatment (if used)')
    ],
    Weeding: [
      select('method', 'Weeding method', ['Hand / hoe', 'Mechanical', 'Herbicide', 'Other'], { required: true }),
      number('area', 'Area weeded', { suffix: 'acres', min: 0, step: 'any' }),
      text('product', 'Herbicide / product (if used)'),
      number('labourers', 'People involved', { min: 0, step: 1 })
    ],
    'Fertilizer application': [
      text('product', 'Fertilizer / amendment', { required: true, placeholder: 'Product or manure type' }),
      number('quantity', 'Quantity applied', { min: 0, step: 'any' }),
      select('unit', 'Unit', UNITS),
      select('method', 'Application method', ['Broadcasting', 'Placement / banding', 'Side dressing', 'Foliar', 'Fertigation', 'Other']),
      number('area', 'Area treated', { suffix: 'acres', min: 0, step: 'any' })
    ],
    Spraying: [
      text('product', 'Product name', { required: true }),
      select('purpose', 'Purpose', ['Pest control', 'Disease control', 'Weed control', 'Other']),
      text('target', 'Target pest, disease or weed'),
      number('dose', 'Product dose', { min: 0, step: 'any' }),
      select('doseUnit', 'Dose unit', ['ml/L', 'g/L', 'ml/acre', 'g/acre', 'L/acre', 'Other']),
      number('waterVolume', 'Spray mixture / water volume', { suffix: 'litres', min: 0, step: 'any' }),
      number('area', 'Area treated', { suffix: 'acres', min: 0, step: 'any' }),
      number('preHarvestInterval', 'Pre-harvest interval from product label', { suffix: 'days', min: 0, step: 1 }),
      text('applicator', 'Applicator / operator')
    ],
    Irrigation: [
      select('method', 'Irrigation method', ['Drip', 'Sprinkler', 'Furrow', 'Flood', 'Watering can', 'Other']),
      text('waterSource', 'Water source'),
      number('duration', 'Duration', { suffix: 'hours', min: 0, step: 'any' }),
      number('area', 'Area irrigated', { suffix: 'acres', min: 0, step: 'any' })
    ],
    'Hilling / earthing up': [
      select('method', 'Method', ['Hand hoe', 'Ox plough', 'Tractor / ridger', 'Other']),
      number('area', 'Area covered', { suffix: 'acres', min: 0, step: 'any' }),
      number('labourers', 'People involved', { min: 0, step: 1 })
    ],
    'Pest / disease scouting': [
      text('target', 'Pest, symptom or disease observed', { required: true }),
      number('area', 'Area inspected', { suffix: 'acres', min: 0, step: 'any' }),
      text('action', 'Action / monitoring plan')
    ],
    'Harvest': [
      number('yield', 'Harvested quantity', { min: 0, step: 'any', required: true }),
      select('yieldUnit', 'Yield unit', ['kg', 'bags', 'sacks', 'crates', 'bunches', 'pieces', 'other'], { required: true }),
      select('grade', 'Produce grade', ['Grade 1', 'Grade 2', 'Grade 3', 'Mixed', 'Not graded', 'Other']),
      number('losses', 'Estimated losses', { min: 0, step: 'any' }),
      select('method', 'Harvest method', ['Manual', 'Machine', 'Contractor', 'Other']),
      number('area', 'Area harvested', { suffix: 'acres', min: 0, step: 'any' })
    ],
    Sale: [
      number('quantitySold', 'Quantity sold', { min: 0, step: 'any', required: true }),
      select('saleUnit', 'Sale unit', ['kg', 'bags', 'sacks', 'crates', 'bunches', 'pieces', 'litres', 'other'], { required: true }),
      text('buyer', 'Buyer / market'),
      select('marketChannel', 'Sales channel', ['Farm gate', 'Local market', 'Cooperative', 'Broker / trader', 'Contract', 'Other']),
      number('unitPrice', 'Price per unit (KES)', { min: 0, step: 'any' })
    ]
  },
  animal: {
    'Purchase / Stocking': [
      number('headCount', 'Number acquired', { min: 1, step: 1, required: true }),
      text('source', 'Seller / source'),
      text('breed', 'Breed / strain'),
      text('healthStatus', 'Health documents / checks')
    ],
    'Birth / Hatching': [
      number('offspringCount', 'Number born / hatched', { min: 1, step: 1, required: true }),
      select('sex', 'Sex (if known)', ['Male', 'Female', 'Mixed', 'Unknown']),
      text('damSire', 'Dam / parent identification'),
      text('birthOutcome', 'Outcome / observations')
    ],
    Feeding: [
      text('feed', 'Feed / ration', { required: true }),
      number('quantityFed', 'Quantity fed', { min: 0, step: 'any' }),
      select('feedUnit', 'Unit', ['kg', 'g', 'litres', 'bags', 'scoops', 'bales', 'other']),
      number('animalsFed', 'Animals fed', { min: 0, step: 1 }),
      text('feedingMethod', 'Feeding method / notes')
    ],
    Vaccination: [
      text('vaccine', 'Vaccine name', { required: true }),
      select('targetDisease', 'Disease targeted', ['Other']),
      number('dose', 'Dose given', { min: 0, step: 'any', required: true }),
      select('doseUnit', 'Dose unit', ['ml', 'dose', 'tablet', 'g', 'other'], { required: true }),
      select('route', 'Administration route', ['Intramuscular', 'Subcutaneous', 'Oral', 'Intranasal', 'Other']),
      text('batchNumber', 'Batch / lot number'),
      text('administeredBy', 'Administered by (person / vet)'),
      text('withdrawalPeriod', 'Withdrawal period from product label'),
      date('nextDue', 'Next dose / due date (as advised)')
    ],
    'Deworming / Treatment': [
      text('diagnosis', 'Reason / diagnosis'),
      text('product', 'Medicine / product', { required: true }),
      number('dose', 'Dose given', { min: 0, step: 'any', required: true }),
      select('doseUnit', 'Dose unit', ['ml', 'ml/kg', 'mg/kg', 'tablet', 'g', 'other'], { required: true }),
      select('route', 'Administration route', ['Oral', 'Intramuscular', 'Subcutaneous', 'Topical', 'Other']),
      number('animalsTreated', 'Animals treated', { min: 1, step: 1 }),
      text('administeredBy', 'Treated by (person / vet)'),
      text('withdrawalPeriod', 'Withdrawal period from product label')
    ],
    Weighing: [
      number('weight', 'Weight', { min: 0, step: 'any', required: true }),
      select('weightUnit', 'Unit', ['kg', 'g', 'other'], { required: true }),
      text('scale', 'Scale / method'),
      text('bodyCondition', 'Body condition / notes')
    ],
    'Production (milk, eggs, honey, etc.)': [
      text('product', 'Product collected'),
      number('quantityProduced', 'Quantity produced', { min: 0, step: 'any', required: true }),
      select('productionUnit', 'Unit', ['litres', 'kg', 'eggs', 'trays', 'crates', 'honey jars', 'other'], { required: true }),
      text('quality', 'Quality / grade')
    ],
    Sale: [
      number('headCountSold', 'Number sold', { min: 1, step: 1, required: true }),
      text('buyer', 'Buyer'),
      select('marketChannel', 'Sales channel', ['Farm gate', 'Auction', 'Market', 'Cooperative', 'Contract', 'Other']),
      number('unitPrice', 'Price per animal (KES)', { min: 0, step: 'any' })
    ],
    Mortality: [
      number('headCount', 'Number lost', { min: 1, step: 1, required: true }),
      select('cause', 'Suspected cause', ['Disease', 'Injury', 'Predator', 'Poisoning', 'Birth complication', 'Unknown', 'Other']),
      text('actionTaken', 'Action taken / vet contacted')
    ],
    Culling: [
      number('headCount', 'Number culled', { min: 1, step: 1, required: true }),
      select('reason', 'Reason', ['Poor production', 'Age', 'Health', 'Breeding decision', 'Other']),
      text('disposition', 'Disposition')
    ]
  }
};

const DISEASES_BY_CATEGORY = {
  livestock: ['Foot-and-mouth disease', 'Lumpy skin disease', 'East Coast fever', 'Anthrax', 'Black quarter', 'Brucellosis', 'Peste des petits ruminants'],
  poultry: ['Newcastle disease', 'Infectious bursal disease (Gumboro)', 'Marek’s disease', 'Infectious bronchitis', 'Fowl pox', 'Other'],
  aquaculture: ['Streptococcosis', 'Columnaris disease', 'Other']
};

export const schemaForActivity = (kind, activity, category = '') => {
  const fields = ACTIVITY_SCHEMAS[kind]?.[activity] || [];
  if (kind !== 'animal' || activity !== 'Vaccination') return fields;
  return fields.map((field) => field.name === 'targetDisease'
    ? { ...field, options: DISEASES_BY_CATEGORY[category] || ['Other'] }
    : field);
};

export const formatActivityDetail = (key) =>
  key.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase());
