# Project Overview

## Introduction
This is a website for the game Graveyard Keeper and all its DLCs.

I want to have a workstation placement planner for the workyard (in its expanded form). This will allow me to plan my final workyard layout before I build it in the game.

## UX Components
The website should have the following components:

### Workyard Grid (Task #1)
This is the grid of the workyard where I can do the planning.

* It should mimic the actual grid and layout appearance in the game itself.

### Workstation Selector (Task #2)
This is a list of all the available workstations.

* It should display every available workstation, in a grid-like format.
  * Multiple workstations per row, multiple rows.
* Every workstation is displayed as a selectable button.
  * It should contain an image of the workstation.
  * It should have the name of the workstation underneath the image.
  * It should have the grid size underneath the name.

### Workstation Placed on the Grid (Task #3)
This is a workstation that has been placed on the grid.

* It should occupy the correct grid area on the workyard grid.
  * For example, a 3x2 workstation when placed on the grid should occupy a 3x2 area of cells.
* It should contain an image of the workstation.
  * It should have the name of the workstation underneath the image.

## UX Experience
This is what the user interaction functionality should look like:

### Selecting a Workstation from the Selector and Placing on the Grid (Task #4)
* Clicking a workstation from the selector should visually activate that workstation button.
* When the cursor is over the workyard grid, a workstation ghost should be following the cursor to indicate the size of the workstation and where it will be placed.
  * The ghost should be green if the placement is valid.
  * The ghost should be red if the placement is invalid.
  * The ghost should be centered about the cursor.
    * For example, the center of a 1x1 workstation is the single cell of the ghost.
    * For example, the center of a 3x3 workstation is the middle cell of the ghost.
    * Any workstation ghosts that don't have a perfectly centered cell can be offset by 1 cell.
* Some workstations support rotating horizontally and/or horizontally.
  * Pressing the R key should rotate the ghost.
  * There should be some visual indication of the ghost as to what rotational orientation it currently is.
* Clicking on a valid location on the grid should place the workstation in that location.
  * This should also deactivate the active workstation in the selector.
  * The user must select another workstation from the selector if they want to place another.

### Interacting with an Existing Workstation on the Grid (Task #5)
* Clicking on a workstation should pick up the workstation and put it in "ghost" mode.
  * This should have all the same behaviors as if it was selected from the selector.
  * This will allow the user to relocate a workstation.
* Pressing the Escape key should cancel this action and place the workstation back in its original location.

## Project Structure
* The project will be built using Svelte (not SvelteKit), Vite, and vanilla CSS.
* When the project is built using the build command, it should produce a single file (with a constant name between builds) for the entry point, script file, and css file.
  * The future intent is to host this website on S3.
* The website must not have a backend functionality. Everything must exist on the frontend.
  * This is to also support the future S3 hosting.

## Running the Project
To run the project, use:
```
npm run dev
```
To build the project, use:
```
npm run build
```

## Agent Guidelines
* If you are missing any information such as location grid sizes or workstation sizes, try and retrieve it yourself before asking me.