<script>
  import { onMount } from 'svelte';
  import { workstations } from './data/workstations';
  import { selectedWorkstation, placedWorkstations, gridState, ghostState, initializeGrid } from './stores';

  // Initialize the grid with the desired dimensions
  onMount(() => {
    initializeGrid(15, 15); // Adjust grid size as needed for the workyard
  });

  // Handle workstation selection
  function selectWorkstation(workstation) {
    $selectedWorkstation = workstation;
  }
</script>

<main>
  <header>
    <h1>Graveyard Keeper Workyard Planner</h1>
    <p>Plan your workyard layout before building it in the game</p>
  </header>

  <div class="planner-container">
    <!-- Workstation Selector (Task #2) -->
    <section class="workstation-selector">
      <h2>Available Workstations</h2>
      <div class="grid-container">
        {#each workstations as workstation}
          <button 
            class="workstation-button" 
            class:active={$selectedWorkstation?.id === workstation.id}
            on:click={() => selectWorkstation(workstation)}
          >
            <img src={workstation.image} alt={workstation.name} />
            <div class="name">{workstation.name}</div>
            <div class="size">{workstation.width}x{workstation.height}</div>
          </button>
        {/each}
      </div>
    </section>

    <!-- Workyard Grid (Task #1) -->
    <section class="workyard-container">
      <h2>Workyard Grid</h2>
      <div 
        class="workyard-grid"
        style="--grid-cols: {$gridState[0]?.length}; --grid-rows: {$gridState.length};"
      >
        {#each $gridState as row, y}
          {#each row as cell, x}
            <div 
              class="grid-cell"
              class:occupied={cell.occupied}
              data-x={x}
              data-y={y}
            ></div>
          {/each}
        {/each}

        <!-- Placed Workstations (Task #3) -->
        {#each $placedWorkstations as placed}
          <div 
            class="placed-workstation"
            style="
              grid-column: {placed.x + 1} / span {placed.width};
              grid-row: {placed.y + 1} / span {placed.height};
              transform: rotate({placed.rotation}deg);
            "
          >
            <img src={placed.image} alt={placed.name} />
            <div class="name">{placed.name}</div>
          </div>
        {/each}
      </div>
    </section>
  </div>

  <footer>
    <p>Instructions: Select a workstation from the list, then click on the grid to place it. Press R to rotate.</p>
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
    }

    .workstation-selector {
      flex: 1;
    }

    .workyard-container {
      flex: 2;
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
