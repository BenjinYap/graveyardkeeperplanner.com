<script>
  import { createEventDispatcher } from 'svelte';
  import { locationGrids } from '../data/workstations';

  export let draggedWorkstation = null;
  export let gridData = [];
  export let selectedLocation = 'workyard'; // Default, but should be passed from parent

  $: gridSize = locationGrids[selectedLocation] || { width: 8, height: 8 };

  const dispatch = createEventDispatcher();

  // Track mouse position for hover effect
  let hoverX = -1;
  let hoverY = -1;
  let isRotated = false;

  // Handle cell click
  function handleCellClick(x, y) {
    if (draggedWorkstation) {
      // Place workstation
      dispatch('place', {
        x,
        y,
        workstation: {
          ...draggedWorkstation,
          isRotated
        }
      });
    } else {
      // Check if there's a workstation at this position
      const existingWorkstation = gridData.find(item => item.x === x && item.y === y);

      if (existingWorkstation) {
        // Select for dragging
        draggedWorkstation = { ...existingWorkstation };
        // Remove the workstation from the grid
        dispatch('remove', { x, y });
      }
    }
  }

  // Handle mouse enter on cell
  function handleMouseEnter(x, y) {
    hoverX = x;
    hoverY = y;
  }

  // Handle mouse leave on cell
  function handleMouseLeave() {
    hoverX = -1;
    hoverY = -1;
  }

  // Handle key press for rotation
  function handleKeyDown(event) {
    if (event.key === 'r' && draggedWorkstation && draggedWorkstation.canRotate) {
      isRotated = !isRotated;
    }
  }

  // Check if a cell is occupied by a workstation
  function isCellOccupied(x, y) {
    return gridData.some(item => {
      const width = item.isRotated ? item.height : item.width;
      const height = item.isRotated ? item.width : item.height;

      return (
        x >= item.x && 
        x < item.x + width && 
        y >= item.y && 
        y < item.y + height
      );
    });
  }

  // Check if the dragged workstation can be placed at the current hover position
  function canPlaceWorkstation(x, y) {
    if (!draggedWorkstation) return true;

    const width = isRotated ? draggedWorkstation.height : draggedWorkstation.width;
    const height = isRotated ? draggedWorkstation.width : draggedWorkstation.height;

    // Check if the workstation would go out of bounds
    if (x + width > gridSize.width || y + height > gridSize.height) {
      return false;
    }

    // Check if any of the cells are already occupied
    for (let dx = 0; dx < width; dx++) {
      for (let dy = 0; dy < height; dy++) {
        if (isCellOccupied(x + dx, y + dy)) {
          return false;
        }
      }
    }

    return true;
  }

  // Get the workstation at a specific cell
  function getWorkstationAt(x, y) {
    return gridData.find(item => {
      const width = item.isRotated ? item.height : item.width;
      const height = item.isRotated ? item.width : item.height;

      return (
        x >= item.x && 
        x < item.x + width && 
        y >= item.y && 
        y < item.y + height
      );
    });
  }
</script>

<svelte:window on:keydown={handleKeyDown} />

<div class="grid-container">
  <div class="grid" style="grid-template-columns: repeat({gridSize.width}, 1fr); grid-template-rows: repeat({gridSize.height}, 1fr);">
    {#each Array(gridSize.height) as _, y}
      {#each Array(gridSize.width) as _, x}
        {@const workstation = getWorkstationAt(x, y)}
        {@const isHovered = hoverX === x && hoverY === y}
        {@const canPlace = canPlaceWorkstation(x, y)}
        {@const isOrigin = workstation && workstation.x === x && workstation.y === y}

        <div 
          class="cell"
          class:occupied={workstation}
          class:hovered={isHovered}
          class:invalid={isHovered && !canPlace}
          class:valid={isHovered && canPlace && draggedWorkstation}
          class:origin={isOrigin}
          on:click={() => handleCellClick(x, y)}
          on:mouseenter={() => handleMouseEnter(x, y)}
          on:mouseleave={handleMouseLeave}
        >
          {#if isOrigin}
            <div 
              class="workstation" 
              style="
                width: {(workstation.isRotated ? workstation.height : workstation.width) * 100}%; 
                height: {(workstation.isRotated ? workstation.width : workstation.height) * 100}%;
                background-image: url({workstation.image});
                transform: {workstation.isRotated ? 'rotate(90deg)' : 'none'};
              "
            >
              <span class="workstation-name">{workstation.name}</span>
            </div>
          {/if}

          <!-- Preview of dragged workstation -->
          {#if isHovered && draggedWorkstation && canPlace && x === hoverX && y === hoverY}
            <div 
              class="workstation preview" 
              style="
                width: {(isRotated ? draggedWorkstation.height : draggedWorkstation.width) * 100}%; 
                height: {(isRotated ? draggedWorkstation.width : draggedWorkstation.height) * 100}%;
                background-image: url({draggedWorkstation.image});
                transform: {isRotated ? 'rotate(90deg)' : 'none'};
              "
            >
              <span class="workstation-name">{draggedWorkstation.name}</span>
            </div>
          {/if}

          <span class="cell-coords">{x},{y}</span>
        </div>
      {/each}
    {/each}
  </div>

  {#if draggedWorkstation}
    <div class="drag-info">
      <p>Dragging: {draggedWorkstation.name}</p>
      {#if draggedWorkstation.canRotate}
        <p>Press 'R' to rotate</p>
      {/if}
      <button on:click={() => draggedWorkstation = null} class="cancel-btn">Cancel</button>
    </div>
  {/if}
</div>

<style>
  .grid-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .grid {
    display: grid;
    gap: 1px;
    background-color: #333;
    border: 2px solid #333;
    width: 100%;
    max-width: 600px;
    aspect-ratio: 1;
  }

  .cell {
    background-color: #f0f0f0;
    position: relative;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;
  }

  .cell:hover {
    background-color: #e0e0e0;
  }

  .cell.occupied {
    background-color: #d0d0d0;
  }

  .cell.hovered.valid {
    background-color: rgba(0, 255, 0, 0.2);
  }

  .cell.hovered.invalid {
    background-color: rgba(255, 0, 0, 0.2);
  }

  .cell.origin {
    z-index: 1;
  }

  .workstation {
    position: absolute;
    top: 0;
    left: 0;
    background-size: cover;
    background-position: center;
    background-color: #999;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #666;
  }

  .workstation.preview {
    opacity: 0.7;
  }

  .workstation-name {
    font-size: 0.7rem;
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 2px 4px;
    border-radius: 2px;
  }

  .cell-coords {
    position: absolute;
    bottom: 2px;
    right: 2px;
    font-size: 0.6rem;
    color: #999;
  }

  .drag-info {
    background-color: #f0f0f0;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    margin-top: 1rem;
    text-align: center;
  }

  .cancel-btn {
    background-color: #f44336;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 0.5rem;
  }

  .cancel-btn:hover {
    background-color: #d32f2f;
  }
</style>
