# FACEBENCH v3.0.0 validation

Software and reference-geometry checks executed in the development environment on 2026-10-09. These results do not establish real-browser behavior or physical fit.

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
