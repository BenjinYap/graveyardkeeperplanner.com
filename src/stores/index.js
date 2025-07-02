import { writable } from 'svelte/store';
import { createGrid, createGridFromAreas } from '../models/GridCell';
import gridAreasData from '../../grid_areas.json';

// Local storage key for saving placed workstations
const STORAGE_KEY = 'graveyard_keeper_placed_workstations';

/**
 * Store for the currently selected workstation.
 * @type {import('svelte/store').Writable<import('../models/Workstation').Workstation | null>}
 */
export const selectedWorkstation = writable(null);

/**
 * Store for workstations that have been placed on the grid.
 * @type {import('svelte/store').Writable<import('../models/PlacedWorkstation').PlacedWorkstation[]>}
 */
export const placedWorkstations = writable(loadPlacedWorkstations());

/**
 * Saves the current placed workstations to localStorage.
 * @param {import('../models/PlacedWorkstation').PlacedWorkstation[]} workstations - The workstations to save
 */
export function savePlacedWorkstations(workstations) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workstations));
    return true;
  } catch (error) {
    console.error('Failed to save workstations:', error);
    return false;
  }
}

/**
 * Loads placed workstations from localStorage.
 * @returns {import('../models/PlacedWorkstation').PlacedWorkstation[]} The loaded workstations or an empty array if none exist
 */
function loadPlacedWorkstations() {
  try {
    const savedWorkstations = localStorage.getItem(STORAGE_KEY);
    return savedWorkstations ? JSON.parse(savedWorkstations) : [];
  } catch (error) {
    console.error('Failed to load workstations:', error);
    return [];
  }
}

/**
 * Store for the grid state.
 * @type {import('svelte/store').Writable<import('../models/GridCell').GridCell[][]>}
 */
export const gridState = writable(createGrid(10, 10)); // Default 10x10 grid, can be adjusted

/**
 * Store for the ghost state (workstation being placed or moved).
 * @type {import('svelte/store').Writable<{
 *   workstation: import('../models/Workstation').Workstation | null,
 *   x: number,
 *   y: number,
 *   rotation: number,
 *   isValid: boolean,
 *   originalPosition: {x: number, y: number, rotation: number} | null
 * }>}
 */
export const ghostState = writable({
  workstation: null,
  x: 0,
  y: 0,
  rotation: 0,
  isValid: false,
  originalPosition: null // For cancellation
});

/**
 * Initializes the grid with the specified dimensions.
 * @param {number} width - Width of the grid in cells (ignored if useGridAreas is true)
 * @param {number} height - Height of the grid in cells (ignored if useGridAreas is true)
 * @param {boolean} [useGridAreas=true] - Whether to use the grid areas data
 */
export function initializeGrid(width, height, useGridAreas = true) {
  if (useGridAreas) {
    gridState.set(createGridFromAreas(gridAreasData));
  } else {
    gridState.set(createGrid(width, height));
  }
}
