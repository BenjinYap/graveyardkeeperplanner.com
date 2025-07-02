<script>
  import { workstations } from '../data/workstations';
  import { selectedWorkstation, ghostState } from '../stores';

  // Search functionality
  let searchTerm = '';
  $: filteredWorkstations = workstations.filter(workstation => 
    workstation.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
</script>

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

<style>
  /* Workstation Selector Styles */
  .workstation-selector {
    width: 300px;
    background: rgba(139, 69, 19, 0.9);
    border: 3px solid #8B4513;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(5px);
    height: fit-content;
    max-height: 80vh;
    overflow-y: auto;
  }

  .search-container {
    margin-bottom: 15px;
  }

  .search-input {
    width: 100%;
    padding: 8px 12px;
    border: 2px solid #654321;
    border-radius: 4px;
    background: rgba(245, 245, 220, 0.9);
    color: #2F1B14;
    font-size: 14px;
    box-sizing: border-box;
  }

  .search-input:focus {
    outline: none;
    border-color: #8B4513;
    background: rgba(255, 255, 255, 0.95);
  }

  .workstation-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .workstation-button {
    background: rgba(245, 245, 220, 0.9);
    border: 2px solid #654321;
    border-radius: 6px;
    padding: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
    width: 100%;
    box-sizing: border-box;
  }

  .workstation-button:hover {
    background: rgba(255, 255, 255, 0.95);
    border-color: #8B4513;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .workstation-button.active {
    background: rgba(255, 215, 0, 0.9);
    border-color: #DAA520;
    box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
  }

  .workstation-button.active:hover {
    background: rgba(255, 215, 0, 1);
  }

  .info {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
  }

  .name {
    font-weight: bold;
    color: #2F1B14;
    font-size: 14px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
    min-width: 0;
  }

  .size {
    color: #654321;
    font-size: 12px;
    font-style: italic;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .no-results {
    text-align: center;
    color: rgba(245, 245, 220, 0.8);
    font-style: italic;
    padding: 20px;
  }
</style>