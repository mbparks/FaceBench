# Contributing to FACEBENCH

The checked-in root files are the deployable app. No build step is required. Preserve local-first behavior, no telemetry, v1/v2 JSON migration to schema 3, relative asset paths and accessible numeric alternatives to canvas interactions. Do not replace third-party license notices.

## Development

Use Node.js 22 or newer for tests. Install development dependencies with `npm ci`, then run `npm test`. For independent STL checks run `python3 -m pip install -r requirements-test.txt` and `npm run test:stl` after `npm test`. Python is required only for local serving and optional topology verification, not on the web host.

Serve the repository root with `python3 -m http.server 8080`. Open http://localhost:8080/. Review real-browser rendering, keyboard controls, mobile layouts, project recovery, exports and offline reload before a production release. DOM tests stub Canvas/WebGL and exercise localStorage fallback. Physical mounting remains unverified.

When shipping changes update the displayed version, project version, service-worker cache name, changelog and validation record. Vendor assets are checked in; npm dependencies support testing only.

## Creative geometry

`creative.js` owns deterministic recipes and geometry transforms. `studio.js` owns creative dialogs and interactions. `engine.js` resolves contours and solid geometry in the worker; vector edits and exports share this kernel. Keep outlines, holes and overlapping symmetry consistent. New schema fields need validation and portable JSON round-trip coverage.

`tests/creative-check.mjs` covers geometry and metadata. `tests/integration.cjs` exercises actual application scripts and the actual WASM engine with DOM/Canvas/WebGL shims. `tests/check-stl.py` independently verifies closed, positively wound exported meshes. Do not label these as browser or physical tests.
