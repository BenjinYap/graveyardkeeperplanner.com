import { createWorkstation } from '../models/Workstation';
import workstationsData from '../../workstations.json';
import placeholder from '../assets/placeholder.svg';

/**
 * Workstation data for Graveyard Keeper loaded from workstations.json.
 * Using images for workstations that have them, and a placeholder for those that don't.
 */
export const workstations = workstationsData.map(station => {
  // Generate an ID from the name (lowercase, replace spaces with underscores)
  const id = station.name.toLowerCase().replace(/\s+/g, '_');

  // Use the image path from the JSON data or fallback to placeholder
  const image = station.image ? new URL(station.image, import.meta.url).href : placeholder;

  return createWorkstation({
    id,
    name: station.name,
    width: station.width,
    height: station.height,
    image,
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
