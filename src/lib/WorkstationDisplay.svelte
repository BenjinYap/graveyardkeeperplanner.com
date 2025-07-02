<script>
  /**
   * Reusable component for displaying workstations (both placed and ghost)
   * @typedef {Object} Props
   * @property {Object} workstation - The workstation data
   * @property {number} x - Grid X position
   * @property {number} y - Grid Y position  
   * @property {number} rotation - Rotation in degrees
   * @property {number} width - Width in grid cells
   * @property {number} height - Height in grid cells
   * @property {boolean} isGhost - Whether this is a ghost (placement preview)
   * @property {boolean} isValid - Whether ghost placement is valid (only used for ghosts)
   * @property {boolean} isMoving - Whether ghost is moving an existing workstation
   * @property {Function} onClick - Click handler (only used for placed workstations)
   */
  
  export let workstation;
  export let x;
  export let y;
  export let rotation = 0;
  export let width;
  export let height;
  export let isGhost = false;
  export let isValid = true;
  export let isMoving = false;
  export let onClick = () => {};

  import { getEffectiveDimensions } from '../models/PlacedWorkstation';
  
  // Create unique identifier for this component instance
  const componentId = `${isGhost ? 'ghost' : 'placed'}-${workstation.id || workstation.name}-${Math.random().toString(36).substr(2, 9)}`;

  let workstationElement;
  let tooltipElement;
  let isHovered = false;

  $: effectiveDimensions = getEffectiveDimensions({ width, height, rotation });
  
  // Update tooltip position when ghost position changes
  $: if (isGhost && isHovered && x !== undefined && y !== undefined) {
    setTimeout(updateTooltipPosition, 0);
  }

  function updateTooltipPosition() {
    if (!workstationElement || !tooltipElement || !isHovered) return;
    
    const rect = workstationElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const topY = rect.top;
    
    tooltipElement.style.left = `${centerX}px`;
    tooltipElement.style.top = `${topY}px`;
    tooltipElement.style.opacity = '1'; // Make visible after positioning
  }

  // Always start tooltip off-screen to prevent flickering
  function getInitialTooltipStyle() {
    return 'left: -9999px; top: -9999px; opacity: 0;';
  }

  function handleMouseEnter() {
    isHovered = true;
    setTimeout(updateTooltipPosition, 0); // Next tick to ensure DOM is updated
  }

  function handleMouseLeave() {
    isHovered = false;
  }

  // Cleanup on component destruction
  import { onDestroy } from 'svelte';
  onDestroy(() => {
    isHovered = false; // Ensure tooltip is hidden when component is destroyed
  });
</script>

<div 
  bind:this={workstationElement}
  class="placed-workstation"
  class:workstation-ghost={isGhost}
  class:valid={isGhost && isValid}
  class:invalid={isGhost && !isValid}
  class:moving={isGhost && isMoving}
  style="
    position: absolute;
    left: calc({x} * (100% / var(--grid-cols)));
    top: calc({y} * (100% / var(--grid-rows)));
    width: calc({effectiveDimensions.width} * (100% / var(--grid-cols)));
    height: calc({effectiveDimensions.height} * (100% / var(--grid-rows)));
  "
  on:mouseenter={handleMouseEnter}
  on:mouseleave={handleMouseLeave}
>
  <div 
    class="workstation-content"
    style="
      width: 100%;
      height: 100%;
      transform: rotate({rotation}deg);
      transform-origin: center center;
    "
  >
    <div 
      class="workstation-clickable-area"
      on:click|stopPropagation={(e) => {
        // Hide tooltip immediately when clicked to prevent flashing
        isHovered = false;
        onClick(e);
      }}
      role={isGhost ? "none" : "button"}
      tabindex={isGhost ? -1 : 0}
    >
      {#if workstation.image}
        <img 
          src={workstation.image} 
          alt={workstation.name}
          class="workstation-image"
        />
      {/if}
    </div>
    <div class="workstation-name">{workstation.name}</div>
  </div>
</div>

<!-- Fixed tooltip that appears above everything -->
{#if isHovered}
  <div 
    bind:this={tooltipElement}
    class="workstation-tooltip visible"
    data-component-id={componentId}
    style="{getInitialTooltipStyle()}"
  >
    {workstation.name}
  </div>
{/if}

<style>
  /* Base workstation styles */
  .placed-workstation {
    position: absolute;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 5;
    box-sizing: border-box;
    background-color: transparent; /* Ensure no background by default */
  }

  .workstation-content {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
  }

  /* Enhanced hover effect - only for actual placed workstations, not ghosts */
  .placed-workstation:hover:not(.workstation-ghost) {
    background-color: rgba(0, 0, 0, 0.2);
    z-index: 6;
  }

  .placed-workstation:hover:not(.workstation-ghost) .workstation-content {
    transform: scale(1.05);
  }

  /* Hide workstation names inside workstations (use fixed tooltip instead) */
  .workstation-name {
    display: none;
  }


  /* Fixed tooltip for placed workstations */
  .workstation-tooltip {
    position: fixed;
    font-size: 0.8rem;
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    white-space: nowrap;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    z-index: 1000;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.2s ease;
    transform: translate(-50%, -100%);
    margin-top: -5px;
  }

  .workstation-tooltip.visible {
    /* Opacity controlled by JavaScript to prevent flickering */
  }

  /* Ghost-specific overrides */
  .workstation-ghost {
    pointer-events: auto; /* Allow hover events for tooltips */
    z-index: 10;
  }


  .workstation-ghost.valid {
    background-color: rgba(0, 255, 0, 0.4);
  }

  .workstation-ghost.invalid {
    background-color: rgba(255, 0, 0, 0.4);
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
  
  /* Drop shadow that follows the image shape - only for placed workstations */
  .placed-workstation:not(.workstation-ghost) .workstation-image {
    filter: drop-shadow(2px 2px 3px rgba(0, 0, 0, 1));
  }

  /* Ensure the clickable area covers the full workstation */
  .workstation-clickable-area {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 5;
    cursor: pointer;
    background-color: transparent;
  }

  .workstation-ghost .workstation-clickable-area {
    cursor: default;
    pointer-events: none; /* Keep clickable area non-interactive for ghosts */
  }
</style>