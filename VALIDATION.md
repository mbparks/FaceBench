# FACEBENCH v2.0.0 validation

Executed in the development environment on 2026-10-08. These results concern software and reference geometry, not physical fit certification.

## Passed

- WASM solid engine: blank, preserved CAD carrier, four mounting coupons, raised outline fonts and beveled plate all return NoError.
- CAD carrier: one component; 52,946 triangles; bounds X ±78 mm, Y ±63.0525 mm, Z −6.700672 to +2.3 mm.
- Independent binary-STL parsing and vertex welding: CAD carrier and decorated sample have zero edges with an incidence other than two, positive signed volume and expected bounds. This independently checks closed surfaces and winding.
- Stencil O: unbridged cut produces disconnected material; a 2 mm bridge reconnects it to one component.
- Overlapping through-cuts merge into one hole contour; positive kerf expands the outside contour. Protected carrier cuts remain valid solids.
- Grayscale image builds stepped solid relief; inverted threshold relief works. Engraved inlay exports carry the correct assembly height.
- 3MF ZIP: required OPC files, millimeter units, material colors, welded vertices, two objects for a panel plus inlay and inlay vertex-height placement. XML/package checks do not prove every slicer's interpretation.
- SVG curve import and flattened closed outlines; rejection of scripts, linked images, event attributes and open paths. Project path-part validation rejects invalid coordinates.
- Laser spacer/retainer geometry and four registration guides; magenta guide layer and mirrored rear exports.
- v1 project schema migrates to v2.
- jsdom integration using the actual application scripts and actual solid engine: sample load, undo/redo, numeric inspector, duplicate, named baseline, 3D renderer handoff, SVG/3MF/manufacturing ZIP, export button reset and local autosave. Canvas and WebGL rendering were stubbed; this is a DOM workflow test, not a browser rendering test.
- Runtime asset inventory and service-worker manifest refer to local existing files; JavaScript syntax checks.

## Not verified

- Real-browser visuals, actual WebGL drawing/OrbitControls, device responsiveness, assistive-technology behavior and service-worker offline reload.
- IndexedDB persistence across browser restarts (the DOM harness exercised localStorage fallback).
- Actual slicer/cutter import, printer material assignments, fabrication settings, heat behavior, airflow, magnet retention or fit on a Steam Machine.

Use mounting coupons and review dimensions/operations in manufacturing software before making the entire panel. Complexity limits are safeguards, not performance guarantees on every device.
