import { createWorkstation } from '../models/Workstation';

/**
 * Sample workstation data for Graveyard Keeper.
 * Note: This is placeholder data and should be replaced with actual game data.
 * Image paths are placeholders and should be replaced with actual image paths.
 */
export const workstations = [
  createWorkstation({
    id: 'stone_cutter',
    name: 'Stone Cutter',
    width: 2,
    height: 2,
    image: '/images/workstations/placeholder.svg',
    canRotate: true
  }),
  createWorkstation({
    id: 'sawmill',
    name: 'Sawmill',
    width: 2,
    height: 3,
    image: '/images/workstations/placeholder.svg',
    canRotate: true
  }),
  createWorkstation({
    id: 'furnace',
    name: 'Furnace',
    width: 2,
    height: 2,
    image: '/images/workstations/placeholder.svg',
    canRotate: false
  }),
  createWorkstation({
    id: 'anvil',
    name: 'Anvil',
    width: 1,
    height: 1,
    image: '/images/workstations/placeholder.svg',
    canRotate: false
  }),
  createWorkstation({
    id: 'alchemy_workbench',
    name: 'Alchemy Workbench',
    width: 2,
    height: 1,
    image: '/images/workstations/placeholder.svg',
    canRotate: true
  }),
  createWorkstation({
    id: 'garden_bed',
    name: 'Garden Bed',
    width: 1,
    height: 2,
    image: '/images/workstations/placeholder.svg',
    canRotate: true
  }),
  createWorkstation({
    id: 'wood_processing',
    name: 'Wood Processing',
    width: 3,
    height: 2,
    image: '/images/workstations/placeholder.svg',
    canRotate: true
  }),
  createWorkstation({
    id: 'study_table',
    name: 'Study Table',
    width: 2,
    height: 1,
    image: '/images/workstations/placeholder.svg',
    canRotate: true
  }),
  createWorkstation({
    id: 'writing_desk',
    name: 'Writing Desk',
    width: 1,
    height: 1,
    image: '/images/workstations/placeholder.svg',
    canRotate: false
  }),
  createWorkstation({
    id: 'crematorium',
    name: 'Crematorium',
    width: 3,
    height: 3,
    image: '/images/workstations/placeholder.svg',
    canRotate: false
  })
];

/**
 * Get a workstation by its ID.
 * @param {string} id - The workstation ID
 * @returns {import('../models/Workstation').Workstation | undefined} The workstation or undefined if not found
 */
export function getWorkstationById(id) {
  return workstations.find(workstation => workstation.id === id);
}
