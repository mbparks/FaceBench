# FACEBENCH v2.0.0

A Green Shoe Garage instrument for designing Steam Machine faceplates and custom panels. Choose a blank → decorate → inspect fabrication findings → export manufacturing files.


## GitHub repository package

Upload the **contents of this ZIP** to a new GitHub repository. `index.html` is at repository root; retain `assets/`, `vendor/`, licenses and documentation. No nested release directory, developer node_modules or build output is included.

For **mbparks.com**, copy the root web files plus `assets/` and `vendor/` into the site's `/facebench/` directory. Tests, `.github/`, package files and Python requirements are development-only and need not be uploaded to your web server. Then open https://mbparks.com/facebench/.

For **GitHub Pages**, choose Settings → Pages → Deploy from a branch → main → / (root). `.nojekyll` is included. All runtime paths are relative, so a repository subpath works without rebuilding. The included workflow runs tests; it does not deploy your website automatically.

Development setup and test commands are in CONTRIBUTING.md. Application code is GPL-3.0-or-later; Valve-derived CAD assets, fonts and bundled libraries retain their separate terms.

## Run and self-host

Extract this ZIP and serve its folder using any static HTTP server. There is no build step, account, cloud backend or package installation.

```sh
python3 -m http.server 8080
```

Open http://localhost:8080/. Keep all relative paths intact when copying the folder to a static route such as `/facebench/`. WebAssembly, module workers and WebGL are required for geometry and 3D preview in a modern browser. Directly opening index.html offers editing/JSON only; HTTP is required for geometry exports. HTTPS or localhost enables a service worker that precaches local runtime files after a successful first load. Ordinary remote HTTP hosting does not enable service workers. Refresh once after installing an update; clear site data if an old cache persists.

## Design tools

- Measured Steam outline: 156 × 126.105 mm. Custom blanks: 20–300 mm per side, 1–15 mm front thickness.
- Three attachment choices: flat blank; custom round pockets; original CAD-derived backing shell. Selecting the CAD carrier initializes a 2.3 mm front and adds the original rear profile, reaching 6.701 mm behind the front origin.
- Mount protection clips through-cuts and engravings away from 18 × 18 mm contact regions. Raised details are still allowed there. Protection is a geometric guard, not proof of clearance on a machine.
- Rounded rectangles, ellipses, stars, sans/mono/serif/pixel text, closed SVG outlines, freehand strokes, repeated vent/dot/radial patterns, PNG/JPEG relief.
- SVG curves are flattened to polygons. Convert SVG text, open strokes, clipping and linked assets to closed outlines before import. Source scripts/resources are rejected.
- Imported TTF/OTF/WOFF fonts are converted to project-local outlines. Bundled and imported fonts cover Latin characters U+0020–U+00FF; missing glyphs use `?`. Pixel font has a smaller repertoire. Text fits the entered width/height; it is not a typographic layout engine.
- Raised, engraved and through-cut geometry; stencil bridges, edge bevels, fitted inlay plugs, silhouette and quantized grayscale relief. Images are sampled to at most 128 × 128; grayscale has 4/8/16 height levels.
- Multi-selection, groups, visibility, locks, layer search/order, align/distribute, aspect ratio, numeric placement, undo/redo, pan/zoom and real front/rear solid preview.

Shift-click layer buttons for multi-selection. Arrow keys move 1 mm; Shift+arrows move 0.1 mm. Space pans Design view. Ctrl/Cmd+Z undoes. Numeric inspector controls provide an alternative to dragging. Easy/Advanced modes and dark/light/high-contrast themes are available.

## Manufacturing outputs

| Output | Contents |
| --- | --- |
| STL | Boolean solid in millimeters; no color or machine instructions |
| 3MF | Welded triangle meshes, millimeter units, surface colors and separately positioned inlays; assign materials in your slicer |
| SVG | Merged CUT contours, ENGRAVE and ARTWORK layers; embedded raster artwork; millimeter dimensions |
| DXF | Closed polyline operation layers, millimeter unit header; raster omitted |
| Mount coupons ZIP | Four small intersections of the current printed design around the mounting locations |
| Inlay ZIP | Separate recessed-decoration plugs, shrunk by the chosen radial clearance |
| Laser stack ZIP | Front, spacer and retainer drawings, mirrored rear views and assembly instructions |
| Manufacturing ZIP | STL/3MF, laser files, applicable coupons/inlays, portable JSON, printable fabrication sheet, BOM, assembly notes and manifest |

The front bevel affects the printed blank edge. Laser drawings describe the flat face outline. Positive kerf compensation expands outer cutting contours and reduces hole contours by half the entered kerf; do not compensate twice in machine software. Rear files marked MIRRORED already invert X. ALIGN_GUIDE and POCKET_GUIDE are marking/reference layers, not automatic cut operations. Laser operation depths and printer settings must be assigned manually. CAD-backed STL includes negative Z; drop its lowest surface onto the slicer build plate. The 3MF normalizes its lowest Z to zero.

Raster laser artwork remains a source image, while printed relief uses threshold/grayscale controls. Adjust laser raster processing in the laser application. Grayscale is stepped relief, not a continuous sculpted surface. Engravings share the entered front thickness limit; stacked raised details do not form an arbitrary CAD feature history.

## Data and recovery

Projects autosave locally to IndexedDB, with localStorage fallback. The previous autosave is retained for recovery. The save indicator reports failures. Export JSON for a portable backup; JSON includes image pixels, imported font outlines and up to ten named baselines. Baselines can be compared/restored. v1 project JSON migrates to schema 2 while preserving its design dimensions. Fresh Start resets the current project and can be undone in that session.

There are no accounts, analytics, uploads or third-party runtime requests. Storage belongs to the current browser/site origin and may be cleared by the browser. Moving host/origin does not move autosaved projects; use JSON. Keep a downloaded app copy for recovery. Imports have size/complexity limits; geometry runs in a local worker with a 60-second request limit.

## Dimensions and evidence

The geometry was extracted from user-supplied Valve Steam Machine and Inkterface STEP files. The included `assets/valve-backing.json` records the source SHA-256, original solid index, transformation and 0.025 mm tessellation tolerance. The server package omits the optional STEP reference; the full release ZIP includes it.

Both references yield 134 × 105.3 mm mounting spacing, X = ±67 mm. The Inkterface screen-coordinate rows are −52.46039 and +52.83961 mm. The preserved CAD carrier uses its own transformed rows −52.4025 and +52.8975 mm. These origins are intentionally not silently conflated. The 6.5 mm Inkterface shell depth is not a prescribed replacement thickness.

The laser laminate stack and round magnet pockets are adapted prototypes. They do not reproduce Valve's complete stock alignment profile. The native CAD carrier preserves its backing geometry but requires a physical fit check and appropriate magnets. Do not substitute round magnets for stepped hardware without checking the actual sockets. No generated design is physically fit-certified. Print coupons, check contact reach, airflow, retention and kerf before producing a full part.

## Completed development batches

| Batch | Delivered |
| --- | --- |
| v1.1 | CAD-derived backing, protected contacts, mounting coupons |
| v1.2 | Closed SVG/freehand tools, bundled and imported outline fonts |
| v1.3 | Precision placement, grouping, alignment, distribution, locks, layer search |
| v1.4 | Layered laser carrier, mirrored rear drawings, registration guides |
| v1.5 | Color 3MF, grayscale relief, fitted inlays, bevels and stencil bridges |
| v1.6 | Manufacturing ZIP, fabrication report, BOM and assembly instructions |
| v2.0 | Integrated UI, v1 migration, local recovery/baselines, offline asset manifest and validation |

Next milestones: v2.1 physical fit results and browser/device QA; v2.2 calibrated hardware profiles, material/kerf presets and export interoperability refinements. No release beyond v2.0 is included here.

## Validation and limitations

See VALIDATION.md for exact checks and limitations. Geometry, exported topology, 3MF package structure, fabrication behavior and DOM workflows were tested. Real-browser rendering, service-worker offline reload, mobile layout and physical fabrication were not verified in this environment. WebGL availability varies by device. Review exports in your slicer/cutter software before manufacture.

## Licenses

FACEBENCH application source is GPL-3.0-or-later (LICENSE). Bundled dependencies retain their own licenses under vendor/. Font outlines retain the DejaVu/Bitstream terms in FONT-LICENSE.txt. Valve-derived assets are separate from application code; see CAD-ATTRIBUTION.md. The ZIP is a self-hosted software delivery, not an already deployed website.
