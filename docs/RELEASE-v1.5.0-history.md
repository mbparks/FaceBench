# INTERFACEBENCH 1.5.0-rc.1 — precision placement

Select a component in Arrange to enter exact distances from the panel bounds, or select a fixed reference component and apply a horizontal or vertical gap. Choose the front face, mounting holes/cutouts, rear body or mounting reference as the measurement basis. Rotations, local offsets and curve extrema are included.

On-canvas dimensions support click, Enter and Space to edit. Two-component reference distances move the second selected component. Units, component/layer locks, autosave, import/export and Undo/Redo use the established project flow. No schema change is needed. Spacing is applied once rather than retained as a constraint; only the selected component moves.

76 automated tests pass. New coverage includes analytic geometry, placement in every direction, units, invalid input, locks, reference preservation, Undo, JSON round-trips, rear presentation and DOM event activation. Front/rear canvas geometry was rasterized and visually reviewed. Real-browser QA remains pending under the existing Sites restriction; static rendering and DOM contracts do not certify layout or native pointer behavior.

Distances measure axis-aligned bounds, not shortest diagonal clearances. Curved/irregular panels use their outer bounds; review actual outline clearance in Checks. Overlays are not fabrication artwork. The two independent label checkboxes and matching front/rear text appearance are preserved.

Upload the complete server ZIP to /interfacebench/. Back up project JSON before updating, then use Save & reload for the new offline cache. No build step is required.
