// Workstation data for Graveyard Keeper
// Each workstation has:
// - id: unique identifier
// - name: display name
// - image: path to the image (to be added)
// - width: width in grid cells
// - height: height in grid cells
// - locations: array of locations where this workstation can be placed
// - canRotate: whether the workstation can be rotated

export const workstations = [
  // Workyard workstations
  {
    id: 'stone_cutter',
    name: 'Stone Cutter',
    image: '/images/workstations/placeholder.svg',
    width: 2,
    height: 1,
    locations: ['workyard'],
    canRotate: true
  },
  {
    id: 'sawing_spot',
    name: 'Sawing Spot',
    image: '/images/workstations/placeholder.svg',
    width: 2,
    height: 1,
    locations: ['workyard'],
    canRotate: true
  },
  {
    id: 'wood_cutting_spot',
    name: 'Wood Cutting Spot',
    image: '/images/workstations/placeholder.svg',
    width: 1,
    height: 1,
    locations: ['workyard'],
    canRotate: false
  },
  {
    id: 'garden_bed',
    name: 'Garden Bed',
    image: '/images/workstations/placeholder.svg',
    width: 1,
    height: 1,
    locations: ['garden'],
    canRotate: false
  },
  {
    id: 'compost_heap',
    name: 'Compost Heap',
    image: '/images/workstations/placeholder.svg',
    width: 1,
    height: 1,
    locations: ['garden'],
    canRotate: false
  },
  {
    id: 'dissection_table',
    name: 'Dissection Table',
    image: '/images/workstations/placeholder.svg',
    width: 2,
    height: 1,
    locations: ['morgue'],
    canRotate: true
  },
  {
    id: 'autopsy_table',
    name: 'Autopsy Table',
    image: '/images/workstations/placeholder.svg',
    width: 2,
    height: 1,
    locations: ['morgue'],
    canRotate: true
  },
  {
    id: 'preparation_place',
    name: 'Preparation Place',
    image: '/images/workstations/placeholder.svg',
    width: 1,
    height: 1,
    locations: ['morgue'],
    canRotate: false
  }
];

// Define grid sizes for each location
export const locationGrids = {
  workyard: { width: 8, height: 8 },
  garden: { width: 6, height: 6 },
  morgue: { width: 7, height: 7 }
};

// Helper function to filter workstations by location
export function getWorkstationsForLocation(location) {
  return workstations.filter(w => w.locations.includes(location));
}
