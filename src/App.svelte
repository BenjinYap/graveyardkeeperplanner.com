<script>
  import { onMount } from 'svelte';
  import { selectedWorkstation, placedWorkstations, gridState, ghostState, initializeGrid, savePlacedWorkstations } from './stores';
  import { createPlacedWorkstation, getEffectiveDimensions } from './models/PlacedWorkstation';
  import WorkstationSelector from './lib/WorkstationSelector.svelte';
  import WorkstationDisplay from './lib/WorkstationDisplay.svelte';
  import lawnImage from './assets/lawn.png';
  import cellBorderImage from './assets/cell_border.png';

  // Notification state
  let notificationMessage = '';
  let showNotification = false;
  let notificationTimeout;

  // Auto-save debounce
  let lastAutoSaveTime = 0;
  const AUTO_SAVE_DEBOUNCE_MS = 5000; // Only show auto-save notification every 5 seconds

  // Function to show a notification
  function showNotificationMessage(message) {
    notificationMessage = message;
    showNotification = true;

    // Clear any existing timeout
    if (notificationTimeout) {
      clearTimeout(notificationTimeout);
    }

    // Hide notification after 2 seconds
    notificationTimeout = setTimeout(() => {
      showNotification = false;
    }, 2000);
  }


  // Function to clear the layout
  function clearLayout() {
    // Clear all placed workstations
    $placedWorkstations = [];

    // Reset the grid state
    initializeGrid();
  }

  // Function to get border edges for a cell
  function getBorderEdges(x, y, cell) {
    if (!cell.buildable || !cell.area) return null;
    
    const area = cell.area;
    const rows = $gridState.length;
    const cols = $gridState[0].length;
    
    const borders = {
      top: false,
      right: false,
      bottom: false,
      left: false
    };
    
    // Check each direction
    const directions = [
      { key: 'top', dx: 0, dy: -1 },
      { key: 'right', dx: 1, dy: 0 },
      { key: 'bottom', dx: 0, dy: 1 },
      { key: 'left', dx: -1, dy: 0 }
    ];
    
    for (const dir of directions) {
      const newX = x + dir.dx;
      const newY = y + dir.dy;
      
      // If we're at the edge of the grid, or adjacent cell is different area/non-buildable
      if (newX < 0 || newX >= cols || newY < 0 || newY >= rows) {
        borders[dir.key] = true;
      } else {
        const adjacentCell = $gridState[newY][newX];
        if (!adjacentCell.buildable || adjacentCell.area !== area) {
          borders[dir.key] = true;
        }
      }
    }
    
    // Return border info if any borders exist
    const hasBorders = Object.values(borders).some(border => border);
    return hasBorders ? borders : null;
  }

  // Helper function to check if a cell has any borders (for class application)
  function isBorderCell(x, y, cell) {
    return getBorderEdges(x, y, cell) !== null;
  }

  // Derived value to check if we're in placing mode
  $: isPlacingMode = $ghostState.workstation !== null;

  // Initialize the grid with the grid areas data
  onMount(() => {
    initializeGrid(); // Uses grid_areas.json by default

    // Update grid occupancy for workstations loaded from localStorage
    $placedWorkstations.forEach(workstation => {
      updateGridOccupancy(workstation, true);
    });

    // Add keyboard event listener for rotation
    window.addEventListener('keydown', handleKeyDown);

    // Subscribe to placedWorkstations changes to auto-save
    const unsubscribe = placedWorkstations.subscribe(workstations => {
      // Only save if there are workstations or if we're clearing them intentionally
      if (workstations.length > 0 || document.readyState === 'complete') {
        savePlacedWorkstations(workstations);
      }
    });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      unsubscribe();
      if (notificationTimeout) {
        clearTimeout(notificationTimeout);
      }
    };
  });


  // Handle mouse movement over the grid
  function handleGridMouseMove(event) {
    if (!$ghostState.workstation) return;

    // Get the grid cell element under the cursor
    const gridRect = event.currentTarget.getBoundingClientRect();
    const cellWidth = gridRect.width / $gridState[0].length;
    const cellHeight = gridRect.height / $gridState.length;

    // Calculate the grid coordinates
    const x = Math.floor((event.clientX - gridRect.left) / cellWidth);
    const y = Math.floor((event.clientY - gridRect.top) / cellHeight);

    // Get effective dimensions after rotation
    const effectiveDimensions = getEffectiveDimensions({
      width: $ghostState.workstation.width,
      height: $ghostState.workstation.height,
      rotation: $ghostState.rotation
    });

    // Calculate the offset to center the ghost around the cursor
    const offsetX = Math.floor(effectiveDimensions.width / 2);
    const offsetY = Math.floor(effectiveDimensions.height / 2);

    // Apply the offset to center the ghost
    const centeredX = x - offsetX;
    const centeredY = y - offsetY;

    // Clamp x and y to ensure the ghost doesn't go off the right or bottom edge
    const maxX = $gridState[0].length - effectiveDimensions.width;
    const maxY = $gridState.length - effectiveDimensions.height;
    const clampedX = Math.min(Math.max(0, centeredX), maxX);
    const clampedY = Math.min(Math.max(0, centeredY), maxY);

    // Update ghost position
    $ghostState = {
      ...$ghostState,
      x: clampedX,
      y: clampedY,
      isValid: isValidPlacement(clampedX, clampedY, $ghostState.workstation, $ghostState.rotation)
    };
  }

  // Handle mouse leaving the grid
  function handleGridMouseLeave() {
    if (!$ghostState.workstation) return;

    // Hide the ghost when mouse leaves the grid
    $ghostState = {
      ...$ghostState,
      x: -1000, // Move off-screen
      y: -1000,
      isValid: false
    };
  }

  // Handle click on the grid
  function handleGridClick() {
    if (!$ghostState.workstation || !$ghostState.isValid) return;

    // If we're moving an existing workstation
    if ($ghostState.originalPosition) {
      // Find the workstation in the placed workstations array
      const workstationIndex = $placedWorkstations.findIndex(
        ws => ws.id === $ghostState.workstation.id && 
             ws.x === $ghostState.originalPosition.x && 
             ws.y === $ghostState.originalPosition.y
      );

      // Remove the workstation from its original position
      if (workstationIndex !== -1) {
        $placedWorkstations = $placedWorkstations.filter((_, index) => index !== workstationIndex);
      }

      // Place the workstation at the new position
      const placedWorkstation = createPlacedWorkstation(
        $ghostState.workstation,
        $ghostState.x,
        $ghostState.y,
        $ghostState.rotation
      );

      $placedWorkstations = [...$placedWorkstations, placedWorkstation];
      updateGridOccupancy(placedWorkstation, true);
    } else {
      // Place a new workstation
      const placedWorkstation = createPlacedWorkstation(
        $ghostState.workstation,
        $ghostState.x,
        $ghostState.y,
        $ghostState.rotation
      );

      $placedWorkstations = [...$placedWorkstations, placedWorkstation];
      updateGridOccupancy(placedWorkstation, true);
    }

    // Reset selection and ghost
    $selectedWorkstation = null;
    $ghostState = {
      workstation: null,
      x: 0,
      y: 0,
      rotation: 0,
      isValid: false,
      originalPosition: null
    };
  }

  // Handle click on a placed workstation
  function handleWorkstationClick(placed) {
    // Clear the grid cells occupied by this workstation
    updateGridOccupancy(placed, false);

    // Remove the workstation from the placed workstations array
    $placedWorkstations = $placedWorkstations.filter(
      ws => !(ws.id === placed.id && ws.x === placed.x && ws.y === placed.y)
    );

    // Set the ghost state to the picked-up workstation
    $ghostState = {
      workstation: placed,
      x: placed.x,
      y: placed.y,
      rotation: placed.rotation,
      isValid: true,
      originalPosition: {
        x: placed.x,
        y: placed.y,
        rotation: placed.rotation
      }
    };

    // Also set the selected workstation to match
    $selectedWorkstation = placed;
  }

  // Handle keyboard events
  function handleKeyDown(event) {
    if (event.key === 'r' || event.key === 'R') {
      if ($ghostState.workstation && $ghostState.workstation.canRotate) {
        // Rotate the ghost - only toggle between 0 and 90 degrees
        const newRotation = $ghostState.rotation === 0 ? 90 : 0;

        // Calculate effective dimensions after rotation
        const effectiveDimensions = getEffectiveDimensions({
          width: $ghostState.workstation.width,
          height: $ghostState.workstation.height,
          rotation: newRotation
        });

        // Calculate the offset to center the ghost around the cursor
        const offsetX = Math.floor(effectiveDimensions.width / 2);
        const offsetY = Math.floor(effectiveDimensions.height / 2);

        // Get the current cursor position (we'll use the center of the current ghost)
        const currentCenterX = $ghostState.x + Math.floor(getEffectiveDimensions({
          width: $ghostState.workstation.width,
          height: $ghostState.workstation.height,
          rotation: $ghostState.rotation
        }).width / 2);
        const currentCenterY = $ghostState.y + Math.floor(getEffectiveDimensions({
          width: $ghostState.workstation.width,
          height: $ghostState.workstation.height,
          rotation: $ghostState.rotation
        }).height / 2);

        // Apply the offset to center the ghost with the new dimensions
        const centeredX = currentCenterX - offsetX;
        const centeredY = currentCenterY - offsetY;

        // Clamp x and y to ensure the ghost doesn't go off the right or bottom edge after rotation
        const maxX = $gridState[0].length - effectiveDimensions.width;
        const maxY = $gridState.length - effectiveDimensions.height;
        const clampedX = Math.min(Math.max(0, centeredX), maxX);
        const clampedY = Math.min(Math.max(0, centeredY), maxY);

        $ghostState = {
          ...$ghostState,
          x: clampedX,
          y: clampedY,
          rotation: newRotation,
          isValid: isValidPlacement(clampedX, clampedY, $ghostState.workstation, newRotation)
        };
      }
    } else if (event.key === 'Escape') {
      // Cancel placement
      if ($ghostState.originalPosition) {
        // Return to original position if moving an existing workstation
        const originalIndex = $placedWorkstations.findIndex(
          ws => ws.id === $ghostState.workstation.id && 
               ws.x === $ghostState.originalPosition.x && 
               ws.y === $ghostState.originalPosition.y
        );

        // Create a workstation at the original position
        const returnedWorkstation = createPlacedWorkstation(
          $ghostState.workstation,
          $ghostState.originalPosition.x,
          $ghostState.originalPosition.y,
          $ghostState.originalPosition.rotation
        );

        // Add it back to the placed workstations array
        $placedWorkstations = [...$placedWorkstations, returnedWorkstation];

        // Update grid occupancy to mark cells as occupied
        updateGridOccupancy(returnedWorkstation, true);

        // Reset ghost and selection
        $selectedWorkstation = null;
        $ghostState = {
          workstation: null,
          x: 0,
          y: 0,
          rotation: 0,
          isValid: false,
          originalPosition: null
        };
      } else {
        // Cancel new placement
        $selectedWorkstation = null;
        $ghostState = {
          workstation: null,
          x: 0,
          y: 0,
          rotation: 0,
          isValid: false,
          originalPosition: null
        };
      }
    }
  }

  // Check if placement is valid
  function isValidPlacement(x, y, workstation, rotation) {
    if (!workstation) return false;

    // Get effective dimensions after rotation
    const { width, height } = getEffectiveDimensions({ 
      width: workstation.width, 
      height: workstation.height, 
      rotation 
    });

    // Check if within grid bounds
    if (x < 0 || y < 0 || x + width > $gridState[0].length || y + height > $gridState.length) {
      return false;
    }

    // Check if cells are occupied or not buildable
    for (let dy = 0; dy < height; dy++) {
      for (let dx = 0; dx < width; dx++) {
        const cell = $gridState[y + dy][x + dx];
        if (cell.occupied || !cell.buildable) {
          return false;
        }
      }
    }

    return true;
  }

  // Update grid occupancy
  function updateGridOccupancy(placedWorkstation, occupy) {
    const { width, height } = getEffectiveDimensions(placedWorkstation);
    const { x, y } = placedWorkstation;

    // Create a deep copy of the grid state to avoid unintended side effects
    const newGridState = [];
    for (let i = 0; i < $gridState.length; i++) {
      newGridState[i] = [];
      for (let j = 0; j < $gridState[i].length; j++) {
        newGridState[i][j] = { ...$gridState[i][j] };
      }
    }

    for (let dy = 0; dy < height; dy++) {
      if (y + dy >= 0 && y + dy < newGridState.length) {
        for (let dx = 0; dx < width; dx++) {
          if (x + dx >= 0 && x + dx < newGridState[y + dy].length) {
            // Update only the affected cell, preserving its coordinates
            newGridState[y + dy][x + dx] = {
              ...$gridState[y + dy][x + dx],
              occupied: occupy,
              workstationId: occupy ? placedWorkstation.id : null
            };
          }
        }
      }
    }

    // Update the grid state with the new state
    $gridState = newGridState;
  }
</script>

<main>
  <header>
    <div class="header-content">
      <h1>Graveyard Keeper Planner</h1>
      <div class="header-controls">
        <button class="clear-button" on:click={clearLayout}>
          Clear Layout
        </button>
        {#if showNotification}
          <div class="notification">{notificationMessage}</div>
        {/if}
      </div>
    </div>
  </header>

  <div class="planner-container">
    <!-- Workstation Selector (Task #2) - Now a separate component -->
    <WorkstationSelector />

    <!-- Workyard Grid (Task #1) - Now central and largest element -->
    <section class="workyard-container">
      <div 
        class="workyard-grid"
        class:placing-mode={isPlacingMode}
        style="--grid-cols: {$gridState[0]?.length}; --grid-rows: {$gridState.length}; --lawn-bg: url({lawnImage}); --border-bg: url({cellBorderImage});"
        on:mousemove={handleGridMouseMove}
        on:mouseleave={handleGridMouseLeave}
        on:click={handleGridClick}
      >
        <!-- Grid cells -->
        {#each $gridState as row, y}
          {#each row as cell, x}
            {@const borderEdges = getBorderEdges(x, y, cell)}
            <div 
              class="grid-cell"
              class:occupied={cell.occupied}
              class:buildable={cell.buildable}
              class:border-cell={borderEdges !== null}
              class:border-top={borderEdges?.top}
              class:border-right={borderEdges?.right}
              class:border-bottom={borderEdges?.bottom}
              class:border-left={borderEdges?.left}
              data-x={x}
              data-y={y}
              data-area={cell.area}
            >
            </div>
          {/each}
        {/each}

        <!-- Placed Workstations -->
        {#each $placedWorkstations as placed}
          <WorkstationDisplay
            workstation={placed}
            x={placed.x}
            y={placed.y}
            rotation={placed.rotation}
            width={placed.width}
            height={placed.height}
            onClick={() => handleWorkstationClick(placed)}
          />
        {/each}

        <!-- Ghost Workstation (placement preview) -->
        {#if $ghostState.workstation && $ghostState.x >= 0 && $ghostState.y >= 0}
          <WorkstationDisplay
            workstation={$ghostState.workstation}
            x={$ghostState.x}
            y={$ghostState.y}
            rotation={$ghostState.rotation}
            width={$ghostState.workstation.width}
            height={$ghostState.workstation.height}
            isGhost={true}
            isValid={$ghostState.isValid}
            isMoving={$ghostState.originalPosition !== null}
          />
        {/if}
      </div>
    </section>
  </div>
</main>

<style>
  main {
    display:flex;
    flex-direction: column;
    align-items: center;
  }

  header, footer {
    text-align: center;
  }

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 1rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .header-controls {
    display: flex;
    align-items: center;
    gap: 1rem;
  }


  .clear-button {
    padding: 0.5rem 1rem;
    background-color: #f44336;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    transition: background-color 0.2s;
  }

  .clear-button:hover {
    background-color: #d32f2f;
  }

  .notification {
    padding: 0.5rem 1rem;
    background-color: #4caf50;
    color: white;
    border-radius: 4px;
    animation: fadeIn 0.3s ease-in-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .planner-container {
    position: relative;
  }

  /* Workstation selector positioned absolutely on the left */
  .planner-container :global(.workstation-selector) {
    position: absolute;
    top: 0;
    right:100%;
    z-index: 100
  }

  .workyard-container {
    width: 100%;
    height: 100%;
  }

  h2 {
    margin-bottom: 1rem;
  }




  /* Workyard grid styles */
  .workyard-container {
    position: relative;
    height: 100%;
    border: 8px solid #7c654a; /* Wooden border */
  }

  .workyard-grid {
    display: grid;
    grid-template-columns: repeat(var(--grid-cols, 10), minmax(0, 1fr));
    grid-template-rows: repeat(var(--grid-rows, 10), minmax(0, 1fr));
    grid-auto-columns: 0;
    grid-auto-rows: 0;
    grid-auto-flow: dense;
    width: calc(var(--cell-size) * var(--grid-width));
    height: calc(var(--cell-size) * var(--grid-height));
    position: relative; /* Important for absolute positioning of children */
    box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.5);
    aspect-ratio: 1;
    overflow: hidden;
    
    /* Tileable lawn background */
    background-image: var(--lawn-bg);
    background-repeat: repeat;
    background-size: contain;
  }


  .grid-cell {
    background-color: transparent; /* Let the grid background show through */
    aspect-ratio: 1;
    position: relative;
    border: 1px solid transparent; /* Hidden by default */
    z-index: 1;
  }

  /* Show prominent grid lines in buildable areas when in placing mode */
  .workyard-grid.placing-mode .grid-cell.buildable {
    border: 1px solid rgb(71 47 3 / 60%); /* Prominent white lines */
  }


  .grid-cell.occupied {
    background-color: rgba(0, 0, 0, 0.2); /* Darker overlay when occupied */
  }

  /* Border cells with edge-specific borders using background-image positioning */
  .grid-cell.border-cell {
    background-image: var(--border-bg);
    background-repeat: no-repeat;
    background-size: 35% 35%;
  }

  /* Top border */
  .grid-cell.border-top {
    background-image: var(--border-bg);
    background-repeat: repeat-x;
    background-size: auto 35%;
    background-position: 0 0;
  }

  /* Right border */
  .grid-cell.border-right {
    background-image: var(--border-bg);
    background-repeat: repeat-y;
    background-size: 35% auto;
    background-position: 100% 0;
  }

  /* Bottom border */
  .grid-cell.border-bottom {
    background-image: var(--border-bg);
    background-repeat: repeat-x;
    background-size: auto 35%;
    background-position: 0 100%;
  }

  /* Left border */
  .grid-cell.border-left {
    background-image: var(--border-bg);
    background-repeat: repeat-y;
    background-size: 35% auto;
    background-position: 0 0;
  }

  /* Multiple borders - combine background images */
  .grid-cell.border-top.border-right {
    background-image: var(--border-bg), var(--border-bg);
    background-repeat: repeat-x, repeat-y;
    background-size: auto 35%, 35% auto;
    background-position: 0 0, 100% 0;
  }

  .grid-cell.border-top.border-left {
    background-image: var(--border-bg), var(--border-bg);
    background-repeat: repeat-x, repeat-y;
    background-size: auto 35%, 35% auto;
    background-position: 0 0, 0 0;
  }

  .grid-cell.border-bottom.border-right {
    background-image: var(--border-bg), var(--border-bg);
    background-repeat: repeat-x, repeat-y;
    background-size: auto 35%, 35% auto;
    background-position: 0 100%, 100% 0;
  }

  .grid-cell.border-bottom.border-left {
    background-image: var(--border-bg), var(--border-bg);
    background-repeat: repeat-x, repeat-y;
    background-size: auto 35%, 35% auto;
    background-position: 0 100%, 0 0;
  }



  .rotation-indicator {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 24px;
    height: 24px;
    background-color: rgba(0, 0, 0, 0.7);
    border: 2px solid rgba(255, 255, 255, 0.8);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: bold;
    color: white;
    transform: rotate(0deg) !important;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
  }

  .moving-indicator {
    position: absolute;
    top: 10px;
    left: 10px;
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: bold;
    z-index: 20;
    transform: rotate(0deg) !important;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
  }


  .debug-info {
    position: absolute;
    bottom: 10px;
    left: 10px;
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 5px;
    border-radius: 4px;
    font-size: 10px;
    z-index: 20;
    transform: rotate(0deg) !important;
  }

  @keyframes pulse {
    0% { opacity: 0.7; }
    50% { opacity: 1; }
    100% { opacity: 0.7; }
  }

  @keyframes moving-glow {
    0% { box-shadow: 0 0 10px rgba(255, 255, 255, 0.3); }
    50% { box-shadow: 0 0 20px rgba(255, 255, 255, 0.6); }
    100% { box-shadow: 0 0 10px rgba(255, 255, 255, 0.3); }
  }
</style>
