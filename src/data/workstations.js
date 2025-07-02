import { createWorkstation } from '../models/Workstation';
import placeholder from '../assets/placeholder.svg?inline';

// Import all images as base64 data URLs
import trunkImg from '../assets/trunk.png?inline';
import stoneStockpileImg from '../assets/stone_stockpile.png?inline';
import timberStockpileImg from '../assets/timber_stockpile.png?inline';
import ironStockpileImg from '../assets/iron_stockpile.png?inline';
import stoneCutterImg from '../assets/stone_cutter.png?inline';
import stoneCutterIIImg from '../assets/Stone_cutter_II.png?inline';
import furnaceImg from '../assets/Furnace.png?inline';
import furnaceIIImg from '../assets/Furnace_II.png?inline';
import furnaceIIIImg from '../assets/Furnace_III.png?inline';
import woodenAnvilImg from '../assets/Wooden_anvil.png?inline';
import anvilImg from '../assets/Anvil.png?inline';
import anvilIIImg from '../assets/Anvil_II.png?inline';
import carpentersWorkbenchImg from '../assets/carpenters_workbench.png?inline';
import carpentersWorkbenchIIImg from '../assets/carpenters_workbench_II.png?inline';
import vinePressImg from '../assets/vine_press.png?inline';
import sawHorseImg from '../assets/saw_horse.png?inline';
import circularSawImg from '../assets/Circular_saw.png?inline';
import choppingSpotImg from '../assets/Chopping_spot.png?inline';
import pottersWheelImg from '../assets/potters_wheel.png?inline';
import paperPressImg from '../assets/paper_press.png?inline';
import jewelryTableImg from '../assets/jewelery_table.png?inline';

// Map of image imports
const imageMap = {
  'trunk.png': trunkImg,
  'stone_stockpile.png': stoneStockpileImg,
  'timber_stockpile.png': timberStockpileImg,
  'iron_stockpile.png': ironStockpileImg,
  'stone_cutter.png': stoneCutterImg,
  'Stone_cutter_II.png': stoneCutterIIImg,
  'Furnace.png': furnaceImg,
  'Furnace_II.png': furnaceIIImg,
  'Furnace_III.png': furnaceIIIImg,
  'Wooden_anvil.png': woodenAnvilImg,
  'Anvil.png': anvilImg,
  'Anvil_II.png': anvilIIImg,
  'carpenters_workbench.png': carpentersWorkbenchImg,
  'carpenters_workbench_II.png': carpentersWorkbenchIIImg,
  'vine_press.png': vinePressImg,
  'saw_horse.png': sawHorseImg,
  'Circular_saw.png': circularSawImg,
  'Chopping_spot.png': choppingSpotImg,
  'potters_wheel.png': pottersWheelImg,
  'paper_press.png': paperPressImg,
  'jewelery_table.png': jewelryTableImg,
};

// Workstation definitions with base64 encoded images
const workstationsData = [
  { "name": "Trunk", "width": 3, "height": 2, "image": "trunk.png" },
  { "name": "Stone stockpile", "width": 5, "height": 4, "image": "stone_stockpile.png" },
  { "name": "Timber stockpile", "width": 5, "height": 4, "image": "timber_stockpile.png" },
  { "name": "Iron ore stockpile", "width": 6, "height": 5, "image": "iron_stockpile.png" },
  { "name": "Stone cutter", "width": 5, "height": 3, "image": "stone_cutter.png" },
  { "name": "Stone cutter II", "width": 6, "height": 5, "image": "Stone_cutter_II.png" },
  { "name": "Furnace", "width": 7, "height": 5, "image": "Furnace.png" },
  { "name": "Furnace II", "width": 7, "height": 5, "image": "Furnace_II.png" },
  { "name": "Furnace III", "width": 7, "height": 5, "image": "Furnace_III.png" },
  { "name": "Wooden anvil", "width": 3, "height": 3, "image": "Wooden_anvil.png" },
  { "name": "Anvil", "width": 3, "height": 3, "image": "Anvil.png" },
  { "name": "Anvil II", "width": 3, "height": 3, "image": "Anvil_II.png" },
  { "name": "Carpenter's workbench", "width": 6, "height": 4, "image": "carpenters_workbench.png" },
  { "name": "Carpenter's workbench II", "width": 6, "height": 4, "image": "carpenters_workbench_II.png" },
  { "name": "Vine press", "width": 5, "height": 4, "image": "vine_press.png" },
  { "name": "Sawhorse", "width": 4, "height": 3, "image": "saw_horse.png" },
  { "name": "Circular saw", "width": 5, "height": 4, "image": "Circular_saw.png" },
  { "name": "Chopping spot", "width": 5, "height": 3, "image": "Chopping_spot.png" },
  { "name": "Potter's wheel", "width": 3, "height": 3, "image": "potters_wheel.png" },
  { "name": "Paper press", "width": 4, "height": 3, "image": "paper_press.png" },
  { "name": "Jewelry table", "width": 5, "height": 3, "image": "jewelery_table.png" }
];

/**
 * Workstation data for Graveyard Keeper with base64 encoded images.
 */
export const workstations = workstationsData.map(station => {
  // Generate an ID from the name (lowercase, replace spaces with underscores)
  const id = station.name.toLowerCase().replace(/\s+/g, '_');

  // Get the base64 encoded image
  const imageName = station.image.split('/').pop();
  const image = imageMap[imageName] || placeholder;

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
