<script>
  import { onMount } from 'svelte';
  import Grid from './components/Grid.svelte';
  import WorkstationList from './components/WorkstationList.svelte';
  import { workstations } from './data/workstations';
  
  let selectedLocation = 'workyard'; // Default location
  let draggedWorkstation = null;
  let gridData = [];
  
  // Load saved grid data from localStorage if available
  onMount(() => {
    const savedData = localStorage.getItem(`gridData_${selectedLocation}`);
    if (savedData) {
      gridData = JSON.parse(savedData);
    }
  });
  
  // Save grid data to localStorage whenever it changes
  $: {
    if (gridData.length > 0) {
      localStorage.setItem(`gridData_${selectedLocation}`, JSON.stringify(gridData));
    }
  }
  
  // Handle workstation selection for dragging
  function handleWorkstationSelect(event) {
    draggedWorkstation = event.detail;
  }
  
  // Handle workstation placement on grid
  function handlePlaceWorkstation(event) {
    const { x, y, workstation } = event.detail;
    
    // Check if there's already a workstation at this position
    const existingIndex = gridData.findIndex(item => item.x === x && item.y === y);
    
    if (existingIndex >= 0) {
      // Replace existing workstation
      gridData[existingIndex] = { ...workstation, x, y };
      gridData = [...gridData]; // Trigger reactivity
    } else {
      // Add new workstation
      gridData = [...gridData, { ...workstation, x, y }];
    }
    
    // Reset dragged workstation
    draggedWorkstation = null;
  }
  
  // Handle workstation removal
  function handleRemoveWorkstation(event) {
    const { x, y } = event.detail;
    gridData = gridData.filter(item => !(item.x === x && item.y === y));
  }
</script>

<main class="flex h-screen bg-gray-100">
  <div class="w-1/4 p-4 bg-gray-200 overflow-y-auto">
    <h1 class="text-2xl font-bold mb-4">Graveyard Keeper Planner</h1>
    
    <div class="mb-4">
      <label for="location" class="block text-sm font-medium text-gray-700">Location</label>
      <select 
        id="location" 
        bind:value={selectedLocation} 
        class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
      >
        <option value="workyard">Workyard</option>
        <option value="morgue">Morgue</option>
        <option value="garden">Kitchen Garden</option>
        <!-- Add more locations as needed -->
      </select>
    </div>
    
    <WorkstationList 
      {workstations} 
      {selectedLocation}
      on:select={handleWorkstationSelect}
    />
  </div>
  
  <div class="flex-1 p-4 flex items-center justify-center">
    <Grid 
      {draggedWorkstation}
      {gridData}
      on:place={handlePlaceWorkstation}
      on:remove={handleRemoveWorkstation}
    />
  </div>
</main>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
  }
</style>