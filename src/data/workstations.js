import { createWorkstation } from '../models/Workstation';
import workstationsData from '../../workstations.json';

/**
 * Workstation data for Graveyard Keeper loaded from workstations.json.
 * As per requirements, we're not using images anymore and displaying names instead.
 */
export const workstations = workstationsData.map(station => {
  // Generate an ID from the name (lowercase, replace spaces with underscores)
  const id = station.name.toLowerCase().replace(/\s+/g, '_');

  return createWorkstation({
    id,
    name: station.name,
    width: station.width,
    height: station.height,
    // No image as per requirements
    image: null,
    // Default to true for canRotate
    canRotate: true
  });
});

/**
 * Get a workstation by its ID.
 * @param {string} id - The workstation ID
 * @returns {import('../models/Workstation').Workstation | undefined} The workstation or undefined if not found
 */
export function getWorkstationById(id) {
  return workstations.find(workstation => workstation.id === id);
}
