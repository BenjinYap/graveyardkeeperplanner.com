/**
 * Represents a workstation in the Graveyard Keeper game.
 * @typedef {Object} Workstation
 * @property {string} id - Unique identifier for the workstation
 * @property {string} name - Display name of the workstation
 * @property {number} width - Width of the workstation in grid cells
 * @property {number} height - Height of the workstation in grid cells
 * @property {string} image - Path to the workstation image
 * @property {boolean} canRotate - Whether the workstation can be rotated
 */

/**
 * Creates a new Workstation object.
 * @param {Object} data - The workstation data
 * @param {string} data.id - Unique identifier for the workstation
 * @param {string} data.name - Display name of the workstation
 * @param {number} data.width - Width of the workstation in grid cells
 * @param {number} data.height - Height of the workstation in grid cells
 * @param {string} data.image - Path to the workstation image
 * @param {boolean} data.canRotate - Whether the workstation can be rotated
 * @returns {Workstation} A new Workstation object
 */
export function createWorkstation(data) {
  return {
    id: data.id,
    name: data.name,
    width: data.width,
    height: data.height,
    image: data.image,
    canRotate: data.canRotate || false
  };
}