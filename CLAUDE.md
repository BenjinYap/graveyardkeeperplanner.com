# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Graveyard Keeper Planner** - a web application for planning workstation layouts in the game Graveyard Keeper. It's built with Svelte 5 (using runes mode) and Vite, allowing users to place and arrange workstations on a grid representing different buildable areas of the game world.

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production  
- `npm run preview` - Preview production build

## Architecture Overview

### Core Technology Stack
- **Svelte 5** with runes mode for reactive state management
- **Vite** for build tooling and development server
- **Vanilla JavaScript** models with JSDoc typing
- **CSS** with scoped component styling

### Key Application Structure

**Main App Flow (`src/App.svelte`)**:
- Central orchestrator handling grid interactions, workstation placement, and keyboard controls
- Manages ghost state for placement preview and drag-and-drop functionality  
- Implements complex grid collision detection and rotation logic
- Provides auto-save to localStorage with visual notifications

**State Management (`src/stores/index.js`)**:
- `selectedWorkstation` - Currently selected workstation from sidebar
- `placedWorkstations` - Array of workstations placed on grid, persisted to localStorage
- `gridState` - 2D array representing grid cells with occupancy and buildable area data  
- `ghostState` - Tracks workstation being placed/moved with position and validity

**Models**:
- `Workstation.js` - Base workstation definition with dimensions and properties
- `PlacedWorkstation.js` - Workstation instances placed on grid with position/rotation  
- `GridCell.js` - Individual grid cells with coordinate, occupancy, and area data

**Grid System**:
- Uses `grid_areas.json` to define buildable regions (areas a-k) with specific coordinates and dimensions
- Creates dynamic grid from area definitions rather than fixed dimensions
- Areas "b" and "c" are merged into single area "bc" for gameplay purposes

**Components**:
- `WorkstationSelector.svelte` - Located in `src/lib/`, displays workstation list with thumbnails and search functionality

**Data Management**:
- `workstations.json` contains all available workstation definitions with images and dimensions
- Images stored in `src/assets/` with automatic fallback to placeholder
- Workstation IDs generated from names (lowercase, spaces to underscores)
- Workstation data processed in `src/data/workstations.js`

### Key Interactive Features

**Placement System**:
- Click workstation in sidebar to select, creates ghost preview that follows mouse
- Ghost shows green (valid) or red (invalid) placement preview
- Click grid to place, automatically handles collision detection
- R key rotates workstations (90-degree increments for compatible items)
- Escape cancels placement and returns moved workstations to original position

**Grid Interaction**:  
- Click placed workstations to pick them up and move
- Visual feedback for different buildable areas with color coding
- Coordinate display on grid cells for debugging/development

**Data Persistence**:
- All placed workstations auto-saved to localStorage
- Automatic restoration on page load
- Clear layout button for resetting plans

## Development Notes

- Grid coordinates are 0-indexed with (0,0) at top-left  
- Workstation rotation affects effective width/height dimensions
- Image paths in workstations.json are relative to `src/assets/`
- Grid areas use absolute positioning within percentage-based responsive grid
- Svelte components are stored in `src/lib/`
- State management uses traditional Svelte stores, not Svelte 5 runes syntax
- Main styling is in `src/app.css` with additional component-scoped styles