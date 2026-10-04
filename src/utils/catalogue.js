// Catalogue of farm enterprises a farmer can pick from. `kind` decides which
// activity list and units the generic enterprise page offers. Items with a
// `page` already have a dedicated screen in the app.
const ANIMAL = 'animal';
const CROP = 'crop';

export const CATEGORIES = [
  { id: 'livestock', name: 'Livestock', kind: ANIMAL, items: [
    { id: 'cows', name: 'Cows (dairy & beef)', short: 'Cows', page: 'cows' },
    { id: 'sheep', name: 'Sheep', short: 'Sheep', page: 'sheep' },
    { id: 'goats', name: 'Goats (dairy & meat)', short: 'Goats' },
    { id: 'pigs', name: 'Pigs', short: 'Pigs' },
    { id: 'rabbits', name: 'Rabbits', short: 'Rabbits' },
    { id: 'camels', name: 'Camels', short: 'Camels' },
    { id: 'donkeys', name: 'Donkeys', short: 'Donkeys' },
    { id: 'horses', name: 'Horses', short: 'Horses' }
  ]},
  { id: 'poultry', name: 'Poultry', kind: ANIMAL, items: [
    { id: 'layers', name: 'Chicken — layers (eggs)', short: 'Layers' },
    { id: 'broilers', name: 'Chicken — broilers (meat)', short: 'Broilers' },
    { id: 'kienyeji', name: 'Chicken — indigenous (kienyeji)', short: 'Kienyeji Chicken' },
    { id: 'ducks', name: 'Ducks', short: 'Ducks' },
    { id: 'turkeys', name: 'Turkeys', short: 'Turkeys' },
    { id: 'geese', name: 'Geese', short: 'Geese' },
    { id: 'quails', name: 'Quails', short: 'Quails' },
    { id: 'guinea-fowl', name: 'Guinea fowl', short: 'Guinea Fowl' },
    { id: 'ostriches', name: 'Ostriches', short: 'Ostriches' }
  ]},
  { id: 'aquaculture', name: 'Fish & Bees', kind: ANIMAL, items: [
    { id: 'tilapia', name: 'Tilapia', short: 'Tilapia' },
    { id: 'catfish', name: 'Catfish', short: 'Catfish' },
    { id: 'trout', name: 'Trout', short: 'Trout' },
    { id: 'bees', name: 'Bees (honey)', short: 'Beekeeping' }
  ]},
  { id: 'cereals', name: 'Cereals', kind: CROP, items: [
    { id: 'maize', name: 'Maize', short: 'Maize' },
    { id: 'wheat', name: 'Wheat', short: 'Wheat' },
    { id: 'rice', name: 'Rice', short: 'Rice' },
    { id: 'sorghum', name: 'Sorghum', short: 'Sorghum' },
    { id: 'millet', name: 'Millet', short: 'Millet' },
    { id: 'barley', name: 'Barley', short: 'Barley' }
  ]},
  { id: 'vegetables', name: 'Vegetables', kind: CROP, items: [
    { id: 'kale', name: 'Kale (sukuma wiki)', short: 'Kale' },
    { id: 'cabbage', name: 'Cabbage', short: 'Cabbage' },
    { id: 'tomatoes', name: 'Tomatoes', short: 'Tomatoes' },
    { id: 'onions', name: 'Onions', short: 'Onions' },
    { id: 'spinach', name: 'Spinach', short: 'Spinach' },
    { id: 'carrots', name: 'Carrots', short: 'Carrots' },
    { id: 'capsicum', name: 'Capsicum', short: 'Capsicum' },
    { id: 'cucumber', name: 'Cucumber', short: 'Cucumber' },
    { id: 'french-beans', name: 'French beans', short: 'French Beans' },
    { id: 'pumpkin', name: 'Pumpkin', short: 'Pumpkin' }
  ]},
  { id: 'fruits', name: 'Fruits', kind: CROP, items: [
    { id: 'avocado', name: 'Avocado', short: 'Avocado' },
    { id: 'mango', name: 'Mango', short: 'Mango' },
    { id: 'banana', name: 'Banana', short: 'Banana' },
    { id: 'passion', name: 'Passion fruit', short: 'Passion Fruit' },
    { id: 'pawpaw', name: 'Pawpaw', short: 'Pawpaw' },
    { id: 'citrus', name: 'Oranges & citrus', short: 'Citrus' },
    { id: 'pineapple', name: 'Pineapple', short: 'Pineapple' },
    { id: 'watermelon', name: 'Watermelon', short: 'Watermelon' },
    { id: 'tree-tomato', name: 'Tree tomato', short: 'Tree Tomato' },
    { id: 'strawberry', name: 'Strawberries', short: 'Strawberries' }
  ]},
  { id: 'roots', name: 'Roots & Tubers', kind: CROP, items: [
    { id: 'potatoes', name: 'Irish potatoes', short: 'Potatoes', page: 'potatoes' },
    { id: 'sweet-potatoes', name: 'Sweet potatoes', short: 'Sweet Potatoes' },
    { id: 'cassava', name: 'Cassava', short: 'Cassava' },
    { id: 'arrowroots', name: 'Arrow roots', short: 'Arrow Roots' },
    { id: 'yams', name: 'Yams', short: 'Yams' }
  ]},
  { id: 'legumes', name: 'Legumes', kind: CROP, items: [
    { id: 'beans', name: 'Beans', short: 'Beans' },
    { id: 'peas', name: 'Peas', short: 'Peas' },
    { id: 'green-grams', name: 'Green grams (ndengu)', short: 'Green Grams' },
    { id: 'cowpeas', name: 'Cowpeas', short: 'Cowpeas' },
    { id: 'groundnuts', name: 'Groundnuts', short: 'Groundnuts' },
    { id: 'soybeans', name: 'Soybeans', short: 'Soybeans' }
  ]},
  { id: 'cash', name: 'Cash Crops', kind: CROP, items: [
    { id: 'coffee', name: 'Coffee', short: 'Coffee' },
    { id: 'tea', name: 'Tea', short: 'Tea' },
    { id: 'sugarcane', name: 'Sugarcane', short: 'Sugarcane' },
    { id: 'pyrethrum', name: 'Pyrethrum', short: 'Pyrethrum' },
    { id: 'macadamia', name: 'Macadamia', short: 'Macadamia' },
    { id: 'cotton', name: 'Cotton', short: 'Cotton' }
  ]},
  { id: 'herbs', name: 'Herbs, Spices & Flowers', kind: CROP, items: [
    { id: 'garlic', name: 'Garlic', short: 'Garlic' },
    { id: 'ginger', name: 'Ginger', short: 'Ginger' },
    { id: 'coriander', name: 'Coriander', short: 'Coriander' },
    { id: 'chilli', name: 'Chilli', short: 'Chilli' },
    { id: 'cut-flowers', name: 'Cut flowers', short: 'Cut Flowers' }
  ]},
  { id: 'fodder', name: 'Fodder', kind: CROP, items: [
    { id: 'napier', name: 'Napier grass', short: 'Napier Grass' },
    { id: 'lucerne', name: 'Lucerne / hay', short: 'Lucerne & Hay' },
    { id: 'desmodium', name: 'Desmodium & legumes fodder', short: 'Fodder Legumes' }
  ]}
];

export const ACTIVITIES = {
  animal: ['Purchase / Stocking', 'Birth / Hatching', 'Feeding', 'Vaccination', 'Deworming / Treatment', 'Weighing', 'Production (milk, eggs, honey, etc.)', 'Sale', 'Mortality', 'Culling'],
  crop: ['Land preparation', 'Planting / Sowing', 'Weeding', 'Fertilizer application', 'Spraying', 'Irrigation', 'Harvest', 'Sale']
};

export const UNITS = {
  animal: ['Head', 'Kg', 'Litres', 'Eggs', 'Trays', 'Pieces', 'Bags'],
  crop: ['Kg', 'Bags', 'Crates', 'Bunches', 'Sacks', 'Pieces', 'Acres']
};

export const findCategory = (id) => CATEGORIES.find((c) => c.id === id);
export const findCatalogueItem = (id) => {
  for (const c of CATEGORIES) {
    const item = c.items.find((i) => i.id === id);
    if (item) return { ...item, category: c.id, categoryName: c.name, kind: c.kind };
  }
  return null;
};
