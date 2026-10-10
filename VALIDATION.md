# FACEBENCH v3.1.0 validation

Baseline software and reference-geometry checks were executed on 2026-10-09, with v3.0.2, v3.0.3 and v3.1.0 checks on 2026-10-10. These results do not establish real-browser behavior or physical fit.

## v3.1.0 focused checks — 2026-10-10

- Actual application pointer handlers detect horizontal, vertical and dual-axis centering. Canvas-command capture verifies both guide lines and confirms dragging bypasses stale cached shape paths.
- Exact center snapping, six-screen-pixel attraction at different zoom/pan settings, Alt bypass, guide toggling, cancellation, one Undo step per drag and no Undo step for an unmoved click.
- Group dragging preserves fractional internal spacing; linked symmetry copies and their axes translate together. Pointer cancellation restores their original positions.
- All six alignment modes are checked with rotated rectangles, stars and asymmetric vector paths. A first-selected locked reference stays fixed. Groups align as units; locked groups stay fixed. Distribution retains end shapes and uses actual bounding-box centers.
- Four distinct ordering commands retain selected/unselected relative ordering, honor locked selections, disable unavailable actions and work through Undo/Redo. Context-menu commands preserve multiple selection. Project order and the guide preference survive a recreated DOM session.
- Existing geometry, fabrication, creative, outer-face thickness, magnetic defaults, application integration and offline-release checks are retained in the full suite.
- These are DOM/application and canvas-command tests with shims, not a real-browser visual check. Browser rendering and physical fit remain unverified.

## v3.0.3 focused checks — 2026-10-10

- The actual DOM starter buttons load Contour current, Maker badge and Light garden with protected magnetic CAD backing. Both Load example and the bundled example JSON do the same.
- All five designs build through the real WASM kernel with `NoError` and one solid component. Mesh bounds and binary STL coordinates retain the original CAD rear extent. The unchanged factory carrier remains 52,946 triangles.
- Disabled dimension/custom-preset controls and guarded event handlers cannot silently remove mounting. Easy mode blocks removal; Advanced requires confirmation. Cancellation, Undo and Redo are exercised.
- Fresh Start restores protected CAD backing after flat/custom or round-pocket projects and old saved preferences. Thickness, material and appearance preferences survive reloads with and without a current autosave. Invalid edits and corrupt/blocked storage are covered.
- Existing custom autosaves retain their dimensions until Restore backing or Fresh Start. Restore backing keeps outer-face thickness; oversized legacy corner radii are limited to the measured outline.
- Full engine, fabrication, creative, thickness, DOM integration and release checks accompany the focused suite. DOM tests use canvas/dialog/viewer shims; real-browser rendering and physical fit are not verified by these checks.

## v3.0.2 focused checks — 2026-10-10

- The new-user factory project is a 156 × 126.105 mm Steam Machine magnetic CAD-backed blank with a 2.3 mm front. Building that exact factory project returns one valid solid with 52,946 triangles and the original rear extent.
- Actual application scripts retain changed dimensions, thickness, radius, material, color, bevel, precision and mounting through Fresh Start. An example can be opened without changing the saved blank preferences.
- DOM sessions were closed and recreated with browser-storage contents to verify reloads both with and without a current autosave. Magnetic/custom preferences survive. Setup Undo/Redo updates the saved settings; invalid edits do not change them.
- Upgrade checks preserve customized older blanks and existing project geometry; Fresh Start replaces the former unmodified flat factory configuration with the magnetic default.
- Corrupt preference data recovers to a valid setup. Blocked storage retains session settings and reports the limitation.
- Existing DOM/export workflows, script syntax and release asset/cache checks passed using freshly installed pinned development dependencies.

These are DOM harness and geometry checks. Real-browser rendering, actual IndexedDB/service-worker restart behavior and physical fit remain unverified.

## v3.0.1 focused checks

- Increased a CAD-backed outer face from 2.3 to 4.8 mm. Rear bounds remained identical, the solid remained one valid component, and volume increased by face area × 2.5 mm.
- Parsed the decorated model's binary STL: the rear stayed fixed, 1.2 mm raised decoration reached Z = 6 mm, and the 0.8 mm engraving floor reached Z = 4 mm.
- Confirmed the control is available without selection; slider, number input and Blank setup stay synchronized. Slider dragging commits one history entry on release; Undo/Redo restores the thickness. Invalid reductions are rejected without changing the project/history.
- Application DOM/export workflows, release asset/cache checks and JavaScript syntax checks passed. Real-browser rendering and physical fit remain unverified.

The broader v3.0 results below are retained; the change uses the existing thickness geometry rather than replacing the solid engine.

## Automated checks

- Original WASM engine: blank, preserved CAD carrier, four mounting coupons, raised outline fonts and bevels return `NoError`.
- CAD carrier remains one component with 52,946 triangles; bounds X ±78 mm, Y ±63.0525 mm, Z −6.700672 to +2.3 mm.
- Fabrication regression: 3MF package structure, millimeter units, colors, welded vertices and inlay placement; stencil continuity; merged cuts; kerf compensation; grayscale/inverted image relief; protected carrier; mirrored rear drawings; flattened SVG curves and rejection of active SVG content.
- Schema 1 and 2 migrate to schema 3. New stacks and recipes round-trip through portable JSON. Invalid stamp data is rejected.
- All six pattern families generate reproducible contours and valid one-component raised solids. Linked symmetry works for separated and overlapping copies and preserves EvenOdd holes. Mirrored hit testing follows the source geometry.
- Remix is deterministic; independent category locks preserve data.
- Boolean operations produce expected areas: union 600 mm², subtraction 200 mm² and intersection 200 mm² for the test rectangles. Border generation remains valid.
- Tracing removes a one-pixel speckle and preserves the expected 100 mm² region. Laser raster SVG includes the clearance/remaining-material clip; private clip contours are not exported as DXF operations.
- Arc, ring, wave and path text produce valid solids; zero-angle arcs remain straight; outlined text retains its contours when converted.
- Texture relief reaches the requested height and remains one connected solid. A full covering clearance zone removes all decoration without removing the blank.
- Material stack thickness/order and exploded offsets are checked. Per-sheet files include STL/SVG/DXF/JSON with an order CSV and assembly notes.
- Clearance, kerf and relief coupons produce valid solids. The five clearance plugs each have the expected 14 × 14 × 1.5 mm volume.
- DOM integration uses actual application scripts and the actual WASM geometry engine: existing editor/undo/inspector/export/autosave workflows; patterns, symmetry, stamps, four Remix cards, brush patches and a pointer-painted stroke, material sheets, calibration records/export, zones and starters. Re-editing moved/resized/rotated Boolean results and moved traces preserves their placement. Text dialogs and physical-stack ZIP round trips are exercised.
- Dialog IDs are unique; focus-return wiring, toolbar mode states, multi-selection controls and export button recovery are checked.
- Runtime asset inventory and service-worker cache logic are checked locally, including per-path cache isolation and current-cache lookup. These are logic checks, not an offline browser test.

## Independent binary STL checks

A separate NumPy parser welds exact output vertices, checks edge incidence, computes signed volume and reads bounds. The CAD carrier, decorated text sample, v3 texture-relief sample and registered material-sheet sample all have zero edges used by anything other than two triangles, positive signed volume and expected bounds.

| Model | Triangles | Non-two-use edges |
| --- | ---: | ---: |
| CAD carrier | 52,946 | 0 |
| Decorated text sample | 6,222 | 0 |
| Texture relief | 732 | 0 |
| Material sheet | 412 | 0 |

## Verification limits

The DOM harness uses dialog/Canvas/WebGL shims and localStorage fallback. It does not verify pixels, actual GPU rendering, mobile layout, assistive technology, IndexedDB persistence or service-worker reload in a browser.

Actual slicer/cutter import, extruder/material assignments, raster clipping support, fabrication settings, lighting behavior, airflow, magnet retention and Steam Machine fit remain unverified. Use the coupon tools and review exported operations before fabrication. Complexity caps do not guarantee performance on every device.
