<script>
  import { onMount } from 'svelte';
  import { workstations } from './data/workstations';
  import { selectedWorkstation, placedWorkstations, gridState, ghostState, initializeGrid } from './stores';
  import { createPlacedWorkstation, getEffectiveDimensions } from './models/PlacedWorkstation';

  // Initialize the grid with the desired dimensions
  onMount(() => {
    initializeGrid(15, 15); // Adjust grid size as needed for the workyard

    // Add keyboard event listener for rotation
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
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

    // Clamp x and y to ensure the ghost doesn't go off the right or bottom edge
    const maxX = $gridState[0].length - effectiveDimensions.width;
    const maxY = $gridState.length - effectiveDimensions.height;
    const clampedX = Math.min(Math.max(0, x), maxX);
    const clampedY = Math.min(Math.max(0, y), maxY);

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

        // Clamp x and y to ensure the ghost doesn't go off the right or bottom edge after rotation
        const maxX = $gridState[0].length - effectiveDimensions.width;
        const maxY = $gridState.length - effectiveDimensions.height;
        const clampedX = Math.min(Math.max(0, $ghostState.x), maxX);
        const clampedY = Math.min(Math.max(0, $ghostState.y), maxY);

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

    // Check if cells are occupied
    for (let dy = 0; dy < height; dy++) {
      for (let dx = 0; dx < width; dx++) {
        if ($gridState[y + dy][x + dx].occupied) {
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
    <h1>Graveyard Keeper Workyard Planner</h1>
    <p>Plan your workyard layout before building it in the game</p>
  </header>

  <div class="planner-container">
    <!-- Workyard Grid (Task #1) - Now central and largest element -->
    <section class="workyard-container">
      <h2>Workyard Grid</h2>
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
              data-x={x}
              data-y={y}
            >
              <!-- Grid cell coordinates for debugging -->
              <span class="grid-coordinates">{x},{y}</span>
            </div>
          {/each}
        {/each}

        <!-- Placed Workstations (Task #3) -->
        {#each $placedWorkstations as placed}
          {@const effectiveDimensions = getEffectiveDimensions(placed)}
          <div 
            class="placed-workstation"
            style="
              grid-column: {placed.x + 1} / span {effectiveDimensions.width};
              grid-row: {placed.y + 1} / span {effectiveDimensions.height};
            "
            on:click|stopPropagation={() => handleWorkstationClick(placed)}
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
              <div class="workstation-name">{placed.name}</div>
            </div>
          </div>
        {/each}

        <!-- Ghost Workstation (for placement preview) -->
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
              grid-column: {$ghostState.x + 1} / span {effectiveDimensions.width};
              grid-row: {$ghostState.y + 1} / span {effectiveDimensions.height};
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
              <div class="workstation-name">{$ghostState.workstation.name}</div>
              {#if $ghostState.originalPosition}
                <div class="moving-indicator">Moving</div>
              {/if}
            </div>
          </div>
        {/if}
      </div>
    </section>

    <!-- Workstation Selector (Task #2) - Now a vertical list -->
    <section class="workstation-selector">
      <h2>Available Workstations</h2>
      <div class="workstation-list">
        {#each workstations as workstation}
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
      </div>
    </section>
  </div>

  <footer>
    <p>
      Instructions: Select a workstation from the list, then click on the grid to place it. 
      Click on a placed workstation to pick it up and move it. 
      Press R to rotate. Press Escape to cancel placement or return a workstation to its original position.
    </p>
  </footer>
</main>

<style>
  header, footer {
    text-align: center;
    padding: 1rem;
  }

  .planner-container {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem;
  }

  @media (min-width: 768px) {
    .planner-container {
      flex-direction: row;
      justify-content: center;
      align-items: flex-start;
    }

    .workstation-selector {
      flex: 0 0 250px;
      order: 2; /* Move to the right side */
      margin-left: 1rem;
    }

    .workyard-container {
      flex: 1 1 auto;
      order: 1; /* Move to the left/center */
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
</style>
