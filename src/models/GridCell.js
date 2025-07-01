/**
 * Represents a cell in the workyard grid.
 * @typedef {Object} GridCell
 * @property {number} x - X coordinate on the grid
 * @property {number} y - Y coordinate on the grid
 * @property {boolean} occupied - Whether the cell is occupied by a workstation
 * @property {string} [workstationId] - ID of the workstation occupying this cell, if any
 */

/**
 * Creates a new GridCell object.
 * @param {number} x - X coordinate on the grid
 * @param {number} y - Y coordinate on the grid
 * @param {boolean} [occupied=false] - Whether the cell is occupied
 * @param {string} [workstationId=null] - ID of the workstation occupying this cell
 * @returns {GridCell} A new GridCell object
 */
export function createGridCell(x, y, occupied = false, workstationId = null) {
  return {
    x,
    y,
    occupied,
    workstationId
  };
}

/**
 * Creates a grid of cells with the specified dimensions.
 * @param {number} width - Width of the grid in cells
 * @param {number} height - Height of the grid in cells
 * @returns {GridCell[][]} A 2D array of GridCell objects
 */
export function createGrid(width, height) {
  const grid = [];
  for (let y = 0; y < height; y++) {
    const row = [];
    for (let x = 0; x < width; x++) {
      row.push(createGridCell(x, y));
    }
    grid.push(row);
  }
  return grid;
}