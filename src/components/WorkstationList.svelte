<script>
  import { createEventDispatcher } from 'svelte';
  import { getWorkstationsForLocation } from '../data/workstations';
  
  export let workstations = [];
  export let selectedLocation = 'workyard';
  
  const dispatch = createEventDispatcher();
  
  // Filter workstations by location
  $: availableWorkstations = getWorkstationsForLocation(selectedLocation);
  
  // Handle workstation selection
  function selectWorkstation(workstation) {
    dispatch('select', workstation);
  }
</script>

<div class="workstation-list">
  <h2 class="text-xl font-semibold mb-4">Available Workstations</h2>
  
  {#if availableWorkstations.length === 0}
    <p class="text-gray-500">No workstations available for this location.</p>
  {:else}
    <ul class="space-y-2">
      {#each availableWorkstations as workstation (workstation.id)}
        <li 
          class="workstation-item"
          on:click={() => selectWorkstation(workstation)}
        >
          <div class="workstation-image" style="background-image: url({workstation.image})"></div>
          <div class="workstation-details">
            <h3 class="workstation-name">{workstation.name}</h3>
            <div class="workstation-meta">
              <span class="size">{workstation.width}x{workstation.height}</span>
              {#if workstation.canRotate}
                <span class="rotate-badge">Can rotate</span>
              {/if}
            </div>
          </div>
        </li>
      {/each}
    </ul>
  {/if}
  
  <div class="mt-6 p-4 bg-gray-100 rounded-md">
    <h3 class="text-lg font-medium mb-2">Instructions</h3>
    <ul class="list-disc pl-5 text-sm">
      <li>Click on a workstation to select it</li>
      <li>Click on the grid to place the selected workstation</li>
      <li>Click on a placed workstation to move it</li>
      <li>Press 'R' to rotate a workstation (if allowed)</li>
    </ul>
  </div>
</div>

<style>
  .workstation-list {
    width: 100%;
  }
  
  .workstation-item {
    display: flex;
    align-items: center;
    padding: 0.75rem;
    background-color: white;
    border-radius: 0.375rem;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .workstation-item:hover {
    background-color: #f9fafb;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .workstation-image {
    width: 3rem;
    height: 3rem;
    background-color: #e5e7eb;
    background-size: cover;
    background-position: center;
    border-radius: 0.25rem;
    margin-right: 0.75rem;
    flex-shrink: 0;
  }
  
  .workstation-details {
    flex: 1;
  }
  
  .workstation-name {
    font-weight: 500;
    margin-bottom: 0.25rem;
  }
  
  .workstation-meta {
    display: flex;
    align-items: center;
    font-size: 0.75rem;
    color: #6b7280;
  }
  
  .size {
    margin-right: 0.5rem;
  }
  
  .rotate-badge {
    background-color: #dbeafe;
    color: #1e40af;
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    font-size: 0.625rem;
    font-weight: 500;
  }
</style>