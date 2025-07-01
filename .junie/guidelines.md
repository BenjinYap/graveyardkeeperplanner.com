# Project Overview

## Introduction
This is a website for the game Graveyard Keeper.

The purpose is to be a grid-based workstation planner for the various locations in the game where you can build workstations, like the workyard, kitchen garden, morgue, etc.

* The grid should be displayed in the center of the page.
* The list of all available workstations for that location should be displayed in a list on the left.
  * It should display each workstation's name and image.
* The user should be able to drag and drop a workstation from the list and place it on the grid.
  * Dragging and dropping an existing workstation on the grid should also be possible.
    * Instead of having to hold down the mouse to drag, left clicking once should place it in "drag" mode.
* Not every workstation can be rotated, ensure this is respected.
* A workstation should occupy the correct number of cells in the grid based on its size.
  * It should display its name inside its bounding box on the grid.

## Project Structure
* The project will be built using Svelte (not SvelteKit), Vite, and Tailwind.
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