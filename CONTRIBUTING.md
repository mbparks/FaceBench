# Contributing to FACEBENCH

The checked-in root files are the deployable app. No build step is required. Preserve local-first behavior, no telemetry, v1 JSON migration, relative asset paths and accessible numeric alternatives to canvas interactions. Do not replace third-party license notices.

## Development

Use Node.js 22 or newer for tests. Install development dependencies with `npm ci`, then run `npm test`. For independent STL checks run `python3 -m pip install -r requirements-test.txt` and `npm run test:stl` after `npm test`. Python is required only for local serving and optional topology verification, not on the web host.

Serve the repository root with `python3 -m http.server 8080`. Open http://localhost:8080/. Review real-browser rendering, keyboard controls, mobile layouts, project recovery, exports and offline reload before a production release. DOM tests stub Canvas/WebGL and exercise localStorage fallback. Physical mounting remains unverified.

When shipping changes update the displayed version, project version, service-worker cache name, changelog and validation record. Vendor assets are checked in; npm dependencies support testing only.
