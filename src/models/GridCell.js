/**
 * Represents a cell in the workyard grid.
 * @typedef {Object} GridCell
 * @property {number} x - X coordinate on the grid
 * @property {number} y - Y coordinate on the grid
 * @property {boolean} occupied - Whether the cell is occupied by a workstation
 * @property {string} [workstationId] - ID of the workstation occupying this cell, if any
 * @property {string} [area] - The buildable area this cell belongs to, if any
 * @property {boolean} buildable - Whether the cell is in a buildable area
 */

/**
 * Creates a new GridCell object.
 * @param {number} x - X coordinate on the grid
 * @param {number} y - Y coordinate on the grid
 * @param {boolean} [occupied=false] - Whether the cell is occupied
 * @param {string} [workstationId=null] - ID of the workstation occupying this cell
 * @param {string} [area=null] - The buildable area this cell belongs to, if any
 * @param {boolean} [buildable=false] - Whether the cell is in a buildable area
 * @returns {GridCell} A new GridCell object
 */
export function createGridCell(x, y, occupied = false, workstationId = null, area = null, buildable = false) {
  return {
    x,
    y,
    occupied,
    workstationId,
    area,
    buildable
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

/**
 * Creates a grid based on the buildable areas defined in grid_areas.json.
 * @param {Object} gridAreas - The grid areas data from grid_areas.json
 * @returns {GridCell[][]} A 2D array of GridCell objects
 */
export function createGridFromAreas(gridAreas) {
  // Calculate the dimensions of the grid based on the areas
  let maxX = 0;
  let maxY = 0;

  Object.values(gridAreas).forEach(area => {
    const areaMaxX = area.x + area.width;
    const areaMaxY = area.y + area.height;

    if (areaMaxX > maxX) maxX = areaMaxX;
    if (areaMaxY > maxY) maxY = areaMaxY;
  });

  // Create the grid with the calculated dimensions
  const grid = [];
  for (let y = 0; y < maxY; y++) {
    const row = [];
    for (let x = 0; x < maxX; x++) {
      row.push(createGridCell(x, y));
    }
    grid.push(row);
  }

  // Mark cells as buildable and assign them to the appropriate areas
  Object.entries(gridAreas).forEach(([areaName, area]) => {
    for (let y = area.y; y < area.y + area.height; y++) {
      for (let x = area.x; x < area.x + area.width; x++) {
        // Special case for areas "b" and "c" - combine them into a single area "bc"
        const effectiveAreaName = (areaName === 'b' || areaName === 'c') ? 'bc' : areaName;

        grid[y][x].area = effectiveAreaName;
        grid[y][x].buildable = true;
      }
    }
  });

  return grid;
}
