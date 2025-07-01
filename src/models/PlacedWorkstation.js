/**
 * Represents a workstation that has been placed on the grid.
 * @typedef {Object} PlacedWorkstation
 * @property {string} id - Unique identifier for the workstation
 * @property {string} name - Display name of the workstation
 * @property {number} width - Width of the workstation in grid cells
 * @property {number} height - Height of the workstation in grid cells
 * @property {string} image - Path to the workstation image
 * @property {boolean} canRotate - Whether the workstation can be rotated
 * @property {number} x - X coordinate on the grid
 * @property {number} y - Y coordinate on the grid
 * @property {number} rotation - Rotation in degrees (0 or 90)
 */

import { createWorkstation } from './Workstation';

/**
 * Creates a new PlacedWorkstation object.
 * @param {Object} workstation - The base workstation object
 * @param {number} x - X coordinate on the grid
 * @param {number} y - Y coordinate on the grid
 * @param {number} rotation - Rotation in degrees (0 or 90)
 * @returns {PlacedWorkstation} A new PlacedWorkstation object
 */
export function createPlacedWorkstation(workstation, x, y, rotation = 0) {
  return {
    ...workstation,
    x,
    y,
    rotation
  };
}

/**
 * Gets the effective width and height of a workstation after rotation.
 * @param {PlacedWorkstation} placedWorkstation - The placed workstation
 * @returns {{width: number, height: number}} The effective dimensions
 */
export function getEffectiveDimensions(placedWorkstation) {
  const { width, height, rotation } = placedWorkstation;
  // If rotation is 90 degrees, swap width and height
  if (rotation === 90) {
    return { width: height, height: width };
  }
  return { width, height };
}
