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
        x: -1000, // Start off-screen
        y: -1000,
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
        <div
          class="workstation-item"
          class:active={$selectedWorkstation?.id === workstation.id}
          on:click={() => selectWorkstation(workstation)}
          role="button"
          tabindex="0"
          on:keydown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              selectWorkstation(workstation);
            }
          }}
        >
          <img 
            src={workstation.image} 
            alt={workstation.name}
            class="thumbnail"
          />
          <div class="info">
            <div class="name">{workstation.name}</div>
            <div class="size">{workstation.width}x{workstation.height}</div>
          </div>
        </div>
      {/each}
    {/if}
  </div>
</section>

<style>
  /* Workstation Selector Styles */
  .workstation-selector {
    background: rgba(139, 69, 19, 0.9);
    border: 3px solid #8B4513;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(5px);
    overflow-y: auto;
    position: absolute;
    top: 0;
    bottom: 20px;
    right:100%;
    z-index: 100
  }

  .search-container {

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
  }

  .workstation-item {
    background: rgba(245, 245, 220, 0.9);
    border: 2px solid #654321;
    border-radius: 6px;
    cursor: pointer;
    text-align: left;
    width: 100%;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .workstation-item:hover {
    background: rgba(255, 255, 255, 0.95);
    border-color: #8B4513;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .workstation-item.active {
    background: rgba(255, 215, 0, 0.9);
    border-color: #DAA520;
    box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
  }

  .workstation-item.active:hover {
    background: rgba(255, 215, 0, 1);
  }

  .thumbnail {
    width: 32px;
    height: 32px;
    object-fit: contain;
    flex-shrink: 0;
    border-radius: 4px;
    padding: 2px;
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
    flex: 1;
    min-width: 0;
  }

  .size {
    color: #654321;
    font-size: 12px;
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