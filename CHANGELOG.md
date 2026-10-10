# Changelog

## 3.1.0 — 2026-10-10

- Live center-axis guides, exact center snapping, an accessible centered-status badge, a persistent guide toggle and Alt to bypass snapping while dragging.
- Explicit faceplate centering on either/both axes; edge/center alignment to selection bounds or the first selected shape; equal-center distribution of three or more selections.
- Rotated/asymmetric geometry determines alignment. Groups retain spacing; locked groups remain fixed; linked symmetry axes move with the artwork.
- Distinct Send to back, Backward, Forward and Bring to front controls in the Inspector and context menu, with stable ordering for multiple selections and Undo/Redo.
- Drag previews use current geometry instead of stale cached paths. Grid-snapped group drags preserve fractional offsets; clicks without movement do not create undo steps.
- Automated interaction checks cover guide draw commands, snapping/cancellation, zoom and pan, rotated/grouped/locked alignment, distribution, all ordering actions and persistence.

## 3.0.3 — 2026-10-10

- All three starter cards, the built-in example and bundled example JSON now include the magnetic CAD backing and mounting protection.
- Fresh Start always restores the Steam outline and protected CAD backing, including after older flat/custom preferences or a project-specific opt-out. Compatible face preferences still save across restarts.
- Width/height controls stay locked while mounted. The flat option requires Advanced mode, an expanded custom-plate section and confirmation; ordinary dimensions/presets cannot silently remove mounting.
- Unmounted projects have a visible status and one-click Restore magnetic backing. Existing project files retain their geometry; restoring the backing preserves thickness and decorations.
- Regression coverage exercises every starter's actual UI and generated STL backing, opt-out cancellation/Undo, legacy preferences, project restoration and saved-settings recovery.

## 3.0.2 — 2026-10-10

- New user projects default to the Steam Machine magnetic CAD backing, measured outline, protected mounting regions and 2.3 mm outer face. Generic calibration and geometry helpers remain flat by design.
- Blank setup is saved separately from the current project and retained by Fresh Start, including Inspector thickness changes. Examples/imports/starters do not replace those preferences.
- Added saved-status feedback, validation before saving, session-only fallback when browser storage is unavailable, and setup-aware undo/redo.
- Upgrade recovery preserves customized blanks while replacing the old unmodified flat factory blank for future fresh starts. Existing project geometry is preserved.
- Added regression checks for fresh starts, full application reloads, magnetic backing geometry, preference isolation, invalid edits and damaged/blocked storage.
- Restored the exact development dependency pins and regenerated the test dependency lockfile. App version changes now leave dependency versions intact.

## 3.0.1 — 2026-10-09

- Added a persistent Outer face thickness control in Inspector → Faceplate, available without selecting a layer.
- Synchronized its slider and numeric input with Blank setup, preview, project JSON and print exports. Slider changes commit as one undo step.
- Explained rejected thickness reductions that conflict with engravings, bevels or magnet pockets.
- Prevented an older geometry preview from replacing a newer revision after an edit.
- Verified unchanged CAD backing, expected front-volume increase and decoration placement in binary STL; exercised synchronization, undo/redo and validation in the DOM harness.

## 3.0.0 — 2026-10-09

Completed the creative-development batches after v2.1:

- Six editable pattern families, linked axis/radial symmetry and reproducible Remix with four candidates, independent locks and favorites.
- Local image tracing, speckle cleanup, simplification, Boolean operations, offsets/borders and source-preserving recipes. Re-editing preserves transformed placement and fabrication properties.
- Curved/outlined text and portable personal stamps. Text remains editable; saved paths remain available when reopening the dialog.
- Four relief brushes, per-stroke undo/erase, numeric test patches and illustrative material finishes.
- Physical sheet assignments, thickness/order/registration controls, exploded preview and per-sheet STL/SVG/DXF/JSON exports.
- Labeled clearance/kerf/relief calibration and project records; window, diffuser and clearance-zone tools; three editable starter designs.
- Schema 3 with v1/v2 migration, bounded recipes, complexity limits and worker recovery after timeout.
- Shared contour processing for conversion and exports; overlapping symmetry unions correctly and preserves holes. Raster SVG respects clearance zones; reports/BOM include physical sheets and calibration.
- Per-installation offline cache names, all new runtime assets bundled, expanded geometry/DOM/topology checks and server/GitHub release packages.

Real-browser rendering, offline reload, slicer/cutter interoperability and physical fit remain unverified; see VALIDATION.md.

## 2.1.0

- Focused canvas workspace with Create, Layers and contextual Inspector.
- Blank setup, Project, Workspace and Export dialogs; consolidated manufacturing choices and in-dialog status.
- Empty-state entry points, quick swatches, clearer tool modes and canvas shortcuts.
- Multi-selection common edits, locked-layer handling, selection-aware buttons and focus restoration.
- Repaired malformed vent-row menu; retained baseline selection and export-button markup.
- Updated responsive panel behavior, local offline asset manifest and creative-tool proposals.
- DOM workflow validation passes; real-browser visual/physical validation remains outstanding.

## 2.0.0

- CAD-derived carrier, protected mounting regions and four fit coupons.
- Closed SVG/freehand drawing, outline fonts and font import.
- Precision editing, grouping, alignment/distribution and layer controls.
- Stepped grayscale relief, fitted inlays, bevels and stencil bridges.
- Color 3MF, merged laser contours, kerf compensation and mirrored laminate carrier drawings.
- Complete manufacturing package, printable report, BOM and assembly instructions.
- v1 JSON migration, local autosave/recovery, named baselines and offline asset manifest.
- Static server package and GitHub repository packaging; no production build step.

See VALIDATION.md for tested behavior and remaining browser/physical checks.
