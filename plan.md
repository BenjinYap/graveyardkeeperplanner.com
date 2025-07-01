# Graveyard Keeper Workyard Planner - Implementation Plan

## Project Overview
This document outlines the implementation plan for the Graveyard Keeper Workyard Planner, a web application that allows users to plan their workyard layout before building it in the game. The application will be built using Svelte, Vite, and Tailwind CSS, with all functionality implemented on the frontend to support S3 hosting.

## Data Models

### Workstation Model
```typescript
interface Workstation {
  id: string;
  name: string;
  width: number;
  height: number;
  image: string;
  canRotate: boolean;
}
```

### Placed Workstation Model
```typescript
interface PlacedWorkstation extends Workstation {
  x: number;
  y: number;
  rotation: 0 | 90 | 180 | 270; // Degrees of rotation
}
```

### Grid Cell Model
```typescript
interface GridCell {
  x: number;
  y: number;
  occupied: boolean;
  workstationId?: string; // Reference to the placed workstation
}
```

## Component Structure
```
App
├── WorkyardGrid (Task #1)
│   └── GridCell
├── WorkstationSelector (Task #2)
│   └── WorkstationButton
├── PlacedWorkstation (Task #3)
└── WorkstationGhost (Task #4 & #5)
```

## Task Implementation Plans

### Task #1: Workyard Grid
**Objective:** Create a grid representation of the workyard that mimics the game's appearance.

**Implementation Steps:**
1. Research the exact dimensions of the expanded workyard in Graveyard Keeper
2. Create a `WorkyardGrid` component that renders a grid of cells
3. Style the grid to match the game's visual appearance
4. Implement a grid data structure to track cell occupancy
5. Add visual indicators for grid boundaries and cell divisions

**Technical Considerations:**
- Use CSS Grid or Flexbox for precise cell positioning
- Implement responsive design to ensure the grid is usable on different screen sizes
- Store grid state in a Svelte store for global access

**Acceptance Criteria:**
- Grid visually resembles the in-game workyard
- Grid cells are clearly defined and visually distinct
- Grid maintains proper proportions at different screen sizes

### Task #2: Workstation Selector
**Objective:** Create a UI component that displays all available workstations for selection.

**Implementation Steps:**
1. Research and compile a list of all workstations in Graveyard Keeper
2. Gather images and size information for each workstation
3. Create a `WorkstationSelector` component that displays workstations in a grid
4. Implement `WorkstationButton` components for each workstation
5. Style the selector to be visually appealing and user-friendly

**Technical Considerations:**
- Optimize workstation images for web display
- Implement filtering or categorization if the list becomes too long
- Use CSS Grid for the selector layout

**Acceptance Criteria:**
- All workstations are displayed with correct images
- Each workstation shows its name and grid size
- Selector has a grid layout with multiple workstations per row
- Workstations are selectable via clicking

### Task #3: Workstation Placed on the Grid
**Objective:** Implement the visual representation of workstations placed on the grid.

**Implementation Steps:**
1. Create a `PlacedWorkstation` component that renders a workstation on the grid
2. Implement logic to calculate grid cell occupation based on workstation size
3. Ensure workstations visually occupy the correct number of grid cells
4. Add workstation name display beneath the image

**Technical Considerations:**
- Use absolute positioning relative to the grid for accurate placement
- Handle different workstation sizes and rotations
- Implement z-index management for overlapping UI elements

**Acceptance Criteria:**
- Workstations occupy the correct number of grid cells
- Workstation image and name are clearly visible
- Multiple workstations can be placed on the grid without visual issues

### Task #4: Selecting a Workstation from the Selector and Placing on the Grid
**Objective:** Implement the interaction flow for selecting and placing workstations.

**Implementation Steps:**
1. Create a `WorkstationGhost` component that follows the cursor
2. Implement selection logic for the workstation selector
3. Add validation logic to determine if placement is valid
4. Implement color changes for valid/invalid placement
5. Add rotation functionality with the R key
6. Implement placement logic when clicking on a valid grid location

**Technical Considerations:**
- Use event listeners for mouse movement and keyboard input
- Implement collision detection with existing workstations
- Handle edge cases like grid boundaries
- Add visual indicators for rotation state

**Acceptance Criteria:**
- Clicking a workstation in the selector activates it
- Ghost follows cursor when over the grid
- Ghost changes color based on placement validity
- Pressing R rotates the ghost with visual indication
- Clicking places the workstation and deactivates selection
- Placement validation works correctly

### Task #5: Interacting with an Existing Workstation on the Grid
**Objective:** Implement the ability to move already-placed workstations.

**Implementation Steps:**
1. Add click handlers to placed workstations
2. Implement "pick up" functionality to convert a placed workstation to ghost mode
3. Reuse the ghost functionality from Task #4 for movement
4. Add Escape key handling to cancel movement
5. Implement logic to return workstation to original position on cancel

**Technical Considerations:**
- Track original position for cancellation
- Handle state transitions between placed and ghost modes
- Ensure consistent behavior with the workstation selector interaction

**Acceptance Criteria:**
- Clicking a placed workstation picks it up
- Ghost behavior matches that of selector-chosen workstations
- Escape key cancels movement and returns workstation to original position
- Clicking on a valid location places the workstation in the new position

## State Management
We'll use Svelte stores to manage the application state:

```typescript
// Selected workstation store
export const selectedWorkstation = writable<Workstation | null>(null);

// Placed workstations store
export const placedWorkstations = writable<PlacedWorkstation[]>([]);

// Grid state store
export const gridState = writable<GridCell[][]>([]);

// Ghost state store
export const ghostState = writable({
  workstation: null,
  x: 0,
  y: 0,
  rotation: 0,
  isValid: false,
  originalPosition: null // For cancellation
});
```

## Implementation Timeline and Prioritization

### Phase 1: Foundation (Week 1)
- Set up project with Svelte, Vite, and Tailwind
- Implement basic data models and state management
- Research and gather workstation data and images

### Phase 2: Core Components (Week 2)
- Implement Task #1: Workyard Grid
- Implement Task #2: Workstation Selector
- Create basic styling and layout

### Phase 3: Basic Functionality (Week 3)
- Implement Task #3: Workstation Placed on the Grid
- Implement basic placement without ghost functionality
- Set up state management between components

### Phase 4: Advanced Interactions (Week 4)
- Implement Task #4: Selecting and Placing with Ghost
- Add rotation functionality
- Implement placement validation

### Phase 5: Refinement (Week 5)
- Implement Task #5: Interacting with Existing Workstations
- Add keyboard shortcuts
- Polish UI and interactions
- Optimize performance

### Phase 6: Testing and Deployment (Week 6)
- Test on different browsers and devices
- Fix any bugs or issues
- Prepare for S3 deployment
- Document usage instructions

## Technical Challenges and Solutions

### Challenge: Accurate Grid Representation
**Solution:** Research the exact dimensions and appearance of the in-game workyard. Use CSS Grid with precise sizing to ensure accuracy.

### Challenge: Ghost Positioning and Validation
**Solution:** Implement a shadow grid system that calculates occupied cells in real-time. Use this to validate ghost placement.

### Challenge: Rotation Handling
**Solution:** Store workstation dimensions and implement matrix transformation for rotation. Update the visual representation and collision detection accordingly.

### Challenge: Performance with Many Workstations
**Solution:** Implement efficient rendering using Svelte's reactivity. Only update components that need to change.

## Conclusion
This implementation plan provides a structured approach to building the Graveyard Keeper Workyard Planner. By breaking down the project into discrete tasks and phases, we can ensure systematic progress and a high-quality final product. The plan addresses all requirements specified in the project guidelines while providing technical details for implementation.