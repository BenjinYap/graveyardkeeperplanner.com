<script>
  import { onMount } from 'svelte';
  import { workstations } from './data/workstations';
  import { selectedWorkstation, placedWorkstations, gridState, ghostState, initializeGrid, savePlacedWorkstations } from './stores';
  import { createPlacedWorkstation, getEffectiveDimensions } from './models/PlacedWorkstation';

  // Search functionality
  let searchTerm = '';
  $: filteredWorkstations = workstations.filter(workstation => 
    workstation.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  // Handle workstation selection
  function selectWorkstation(workstation) {
    $selectedWorkstation = workstation;

    // Initialize ghost state when a workstation is selected
    if (workstation) {
      $ghostState = {
        workstation,
        x: 0,
        y: 0,
        rotation: 0,
        isValid: false,
        originalPosition: null
      };
    }
  }

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
    <!-- Workstation Selector (Task #2) - Now a vertical list -->
    <section class="workstation-selector">
      <!-- Search bar -->
      <div class="search-container">
        <input 
          type="text" 
          placeholder="Search workstations..." 
          bind:value={searchTerm}
          class="search-input"
        />
      </div>

      <div class="workstation-list">
        {#if filteredWorkstations.length === 0}
          <div class="no-results">No workstations found</div>
        {:else}
          {#each filteredWorkstations as workstation}
            <button
              class="workstation-button"
              class:active={$selectedWorkstation?.id === workstation.id}
              on:click={() => selectWorkstation(workstation)}
            >
              <div class="info">
                <div class="name">{workstation.name}</div>
                <div class="size">{workstation.width}x{workstation.height}</div>
              </div>
            </button>
          {/each}
        {/if}
      </div>
    </section>

    <!-- Workyard Grid (Task #1) - Now central and largest element -->
    <section class="workyard-container">
      <div 
        class="workyard-grid"
        style="--grid-cols: {$gridState[0]?.length}; --grid-rows: {$gridState.length};"
        on:mousemove={handleGridMouseMove}
        on:mouseleave={handleGridMouseLeave}
        on:click={handleGridClick}
      >
        <!-- Grid background with texture -->
        <div class="grid-background"></div>

        <!-- Grid cells -->
        {#each $gridState as row, y}
          {#each row as cell, x}
            <div 
              class="grid-cell"
              class:occupied={cell.occupied}
              class:buildable={cell.buildable}
              class:area-a={cell.area === 'a'}
              class:area-bc={cell.area === 'bc'}
              class:area-d={cell.area === 'd'}
              class:area-e={cell.area === 'e'}
              class:area-f={cell.area === 'f'}
              class:area-g={cell.area === 'g'}
              class:area-i={cell.area === 'i'}
              class:area-j={cell.area === 'j'}
              class:area-k={cell.area === 'k'}
              data-x={x}
              data-y={y}
              data-area={cell.area}
            >
              <!-- Grid cell coordinates for debugging -->
              <span class="grid-coordinates">{x},{y}</span>
            </div>
          {/each}
        {/each}

        <!-- Placed Workstations (Task #3) - Absolutely positioned -->
        {#each $placedWorkstations as placed}
          {@const effectiveDimensions = getEffectiveDimensions(placed)}
          <div 
            class="placed-workstation"
            style="
              position: absolute;
              left: calc({placed.x} * (100% / var(--grid-cols)));
              top: calc({placed.y} * (100% / var(--grid-rows)));
              width: calc({effectiveDimensions.width} * (100% / var(--grid-cols)));
              height: calc({effectiveDimensions.height} * (100% / var(--grid-rows)));
            "
          >
            <div 
              class="workstation-content"
              style="
                width: 100%;
                height: 100%;
                transform: rotate({placed.rotation}deg);
                transform-origin: center center;
              "
            >
              <!-- Clickable area that excludes the name -->
              <div 
                class="workstation-clickable-area"
                on:click|stopPropagation={() => handleWorkstationClick(placed)}
              >
                {#if placed.image}
                  <img 
                    src={placed.image} 
                    alt={placed.name}
                    class="workstation-image"
                  />
                {/if}
              </div>
              <div class="workstation-name">{placed.name}</div>
            </div>
          </div>
        {/each}

        <!-- Ghost Workstation (for placement preview) - Absolutely positioned -->
        {#if $ghostState.workstation && $ghostState.x >= 0 && $ghostState.y >= 0}
          {@const effectiveDimensions = getEffectiveDimensions({
            width: $ghostState.workstation.width,
            height: $ghostState.workstation.height,
            rotation: $ghostState.rotation
          })}
          <div 
            class="workstation-ghost"
            class:valid={$ghostState.isValid}
            class:invalid={!$ghostState.isValid}
            class:moving={$ghostState.originalPosition !== null}
            style="
              position: absolute;
              left: calc({$ghostState.x} * (100% / var(--grid-cols)));
              top: calc({$ghostState.y} * (100% / var(--grid-rows)));
              width: calc({effectiveDimensions.width} * (100% / var(--grid-cols)));
              height: calc({effectiveDimensions.height} * (100% / var(--grid-rows)));
            "
          >
            <div 
              class="ghost-content"
              style="
                width: 100%;
                height: 100%;
                transform: rotate({$ghostState.rotation}deg);
                transform-origin: center center;
              "
            >
              {#if $ghostState.workstation.image}
                <img 
                  src={$ghostState.workstation.image} 
                  alt={$ghostState.workstation.name}
                  class="workstation-image"
                />
              {/if}
              <div class="workstation-name">{$ghostState.workstation.name}</div>
            </div>
          </div>
        {/if}
      </div>
    </section>
  </div>
</main>

<style>
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
    position:relative;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  /* Search bar styles */
  .search-container {
    margin-bottom: 1rem;
  }

  .search-input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 0.9rem;
    background-color: #f5f5f5;
  }

  .search-input:focus {
    outline: none;
    border-color: #646cff;
    box-shadow: 0 0 0 2px rgba(100, 108, 255, 0.2);
  }

  .no-results {
    padding: 1rem;
    text-align: center;
    color: #666;
    font-style: italic;
    background-color: #f5f5f5;
    border-radius: 4px;
    margin-top: 0.5rem;
  }

  @media (min-width: 768px) {
    .planner-container {
      flex-direction: row;
      justify-content: center;
      align-items: flex-start;
    }

    .workstation-selector {
      position:absolute;
      top:0;
      bottom:0;
      right:100%;
      overflow:auto;
    }

    .workyard-container {
      flex: 1 1 auto;
      max-width: 800px;
    }
  }

  h2 {
    margin-bottom: 1rem;
  }

  .workstation-button.active {
    border-color: #646cff;
    background-color: rgba(100, 108, 255, 0.1);
  }

  /* Grid cell styling */
  .grid-cell {
    background-color: #333; /* Default color for non-buildable areas */
    border: 1px solid #444;
  }

  .grid-cell.buildable {
    background-color: #4a5; /* Default color for buildable areas */
  }

  /* Different colors for different areas */
  .grid-cell.area-a {
    background-color: #f94;
  }

  .grid-cell.area-bc {
    background-color: #9af;
  }

  .grid-cell.area-d {
    background-color: #f9a;
  }

  .grid-cell.area-e {
    background-color: #af9;
  }

  .grid-cell.area-f {
    background-color: #a9f;
  }

  .grid-cell.area-g {
    background-color: #fa9;
  }

  .grid-cell.area-i {
    background-color: #9fa;
  }

  .grid-cell.area-j {
    background-color: #f99;
  }

  .grid-cell.area-k {
    background-color: #99f;
  }

  .grid-cell.occupied {
    background-color: #777;
  }

  /* Workstation image styling */
  .workstation-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
  }

  /* Ensure the workstation name is above the image */
  .workstation-name {
    position: relative;
    z-index: 2;
    background-color: rgba(0, 0, 0, 0.5);
    color: white;
    padding: 2px 4px;
    border-radius: 2px;
    font-size: 0.8rem;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* Ensure the clickable area covers the full workstation */
  .workstation-clickable-area {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
  }
</style>
