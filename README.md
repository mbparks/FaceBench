# FACEBENCH v3.0.0

A Maximalist Misfit Maker instrument for designing Steam Machine faceplates and custom panels. Choose a blank → decorate → inspect fabrication findings → export manufacturing files.


## What changed in 3.0

FACEBENCH now includes an editable creative studio and a physical material-sheet workflow. Every tool runs on the device using bundled code and assets.

| Tool | Where to find it | What you can do |
| --- | --- | --- |
| Pattern lab | Create → Creative studio | Generate waves, honeycomb, halftone dots, contour lines, mazes and vents; edit spacing, line width, amplitude, margin and seed |
| Linked symmetry | Inspector → Creative modifiers | Mirror across either axis, use both axes or make 2–16 radial repetitions; adjust the center numerically |
| Remix | Create → Creative studio | Compare four seeded variants, lock layout/colors/text style/patterns independently, apply a variant or save a favorite baseline |
| Trace artwork | Inspector → Creative modifiers | Convert an imported image into vector contours with threshold, invert, speckle cleanup and simplification |
| Combine shapes | Inspector → Creative modifiers | Union, subtract, intersect, offset or form a border; retain source shapes in an editable recipe |
| Curved text | Inspector → Creative modifiers | Use arc, ring, wave or a saved contour path; adjust tracking and outline width while keeping text editable |
| Stamp tray | Create / Inspector | Save a selection, place grouped copies, and export/import a portable personal stamp library |
| Relief brushes | Create → Creative studio | Paint studs, square pixels, diamond facets or ridges; change height/spacing, erase strokes, or add a numeric test patch |
| Material stack | Export | Assign decorations to up to eight physical sheets; set thickness, order, material, color and registration holes; inspect an exploded preview and export each sheet |
| Calibration | Export | Generate five labeled clearance, kerf or relief-height tests; record the measured result and apply it to the project |
| Light-through tools | Export | Turn selected vectors into windows, add a diffuser sheet and define rectangular clearance zones |
| Starter designs | Create | Begin with Contour current, Maker badge or Light garden |

The main workspace keeps Create, Layers and Inspector beside the canvas. Blank setup contains dimensions and mounting; Project contains files, recovery and baselines; Workspace contains appearance and help; Export contains fabrication outputs. Creative dialogs expose additional controls when needed. Native dialogs support Escape and focus return. Select/Draw/Pan have explicit active states, and numeric placement remains available.

Re-edit patterns using **Edit recipe**. Traces and combined shapes retain source data; re-editing preserves the current placement, dimensions, rotation and operation. Changing their recipe fits the new result into those dimensions. **Restore originals at original placement** brings back Boolean sources where they were before combining. **Convert to paths** bakes modifiers into ordinary contours, with Undo to recover the recipe. Subtraction removes later-selected layers from the first selected layer.

Symmetry is linked to the source layer, so editing it updates every repetition. Remix preserves text content; its text lock controls font variation. Locked layers are preserved. Favorites are stored as named baselines. Text on a path stores a snapshot of the selected contour; it does not stay linked to later source-path changes. Curved text warps glyph outlines along the curve.

Brush strokes create discrete extruded geometry, including diamond-shaped prisms for facets. This is a tactile pattern tool, not a continuous sculpting system. Erase removes whole nearby strokes. A layer allows up to 600 impressions; exceeding the budget asks you to increase spacing or remove a stroke. The test-patch button offers an alternative to painting with a pointer.

Matte, metallic, glossy and translucent appearances are illustrative 3D preview settings. They do not simulate lighting, diffusion, material strength or laser/printer settings. Clearance zones preserve the blank by excluding decoration geometry, including cuts. They do not create hardware cavities or prove ventilation adequacy.

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
| Material stack ZIP | Per-sheet STL/SVG/DXF/JSON, front-to-back order CSV and assembly notes |
| Calibration ZIP | Labeled five-step test panel, SVG/DXF/JSON, instructions and separate plugs for the clearance test |
| Manufacturing ZIP | STL/3MF, laser files, applicable coupons/inlays/material stack, portable JSON, fabrication sheet, BOM, assembly notes and manifest |

The front bevel affects the printed blank edge. Laser drawings describe the flat face outline. Positive kerf compensation expands outer cutting contours and reduces hole contours by half the entered kerf; do not compensate twice in machine software. Rear files marked MIRRORED already invert X. ALIGN_GUIDE and POCKET_GUIDE are marking/reference layers, not automatic cut operations. Laser operation depths and printer settings must be assigned manually. CAD-backed STL includes negative Z; drop its lowest surface onto the slicer build plate. The 3MF normalizes its lowest Z to zero.

Raster laser artwork remains a source image clipped to the remaining material, clearance zones and protected contacts, while printed relief uses threshold/grayscale controls. Confirm that your laser software respects SVG clipping; tracing is available for a vector-only result. Adjust laser raster processing in the laser application. Grayscale is stepped relief, not a continuous sculpted surface. Engravings share the entered front thickness limit; stacked raised details do not form an arbitrary CAD feature history.

## Physical sheets and calibration

The custom material stack is a separate fabrication option from the main plate and the prototype spacer/retainer carrier. Each configured sheet uses a flat outline without the CAD backing, with only its assigned decorations. Depths are limited to leave 0.1 mm of sheet thickness. Registration holes are real cuts; use equal diameters on sheets that must share pins. Layer order is front to back. The exploded preview adds a viewing gap; exported sheets retain their own local origin. Check overlaps, hardware reach and the total assembled thickness. The main STL/3MF does not automatically become the configured sheet assembly; use **Export material stack** or the nested material-stack.zip in the manufacturing bundle.

Clearance calibration provides five sockets and five separate 14 mm square plugs; labels describe radial clearance. Kerf calibration provides openings reduced by the candidate kerf: cut with zero additional compensation, then choose the value whose opening measures closest to 10 mm. Relief calibration provides five labeled raised heights. Measured clearance and kerf update project settings; measured relief updates selected, unlocked raised layers. Notes and results appear in the manufacturing report. These tests do not establish material suitability or Steam Machine fit.

## Data and recovery

Projects autosave locally to IndexedDB, with localStorage fallback. The previous autosave is retained for recovery. The save indicator reports failures. Export JSON for a portable backup; JSON includes image pixels, imported font outlines and up to ten named baselines. Baselines can be compared/restored. v1 and v2 project JSON migrate to schema 3 while preserving design dimensions. Editable recipes, stamps, material stacks, clearance zones and calibration records travel in the JSON. Older FACEBENCH versions cannot open schema 3; retain an original backup if you need to return to v2. Fresh Start resets the current project and can be undone in that session.

There are no accounts, analytics, uploads or third-party runtime requests. Storage belongs to the current browser/site origin and may be cleared by the browser. Moving host/origin does not move autosaved projects; use JSON. Keep a downloaded app copy for recovery. Imports have size/complexity limits; geometry runs in a local worker with a 60-second request limit. A timeout resets the worker so a later attempt can recover. Limits include 150 decoration layers, 400,000 generated path points, six levels of nested recipes, 30 stamps, eight material sheets and one million output triangles. These are complexity limits, not performance guarantees.

## Dimensions and evidence

The geometry was extracted from user-supplied Valve Steam Machine and Inkterface STEP files. The included `assets/valve-backing.json` records the source SHA-256, original solid index, transformation and 0.025 mm tessellation tolerance. Both v3 ZIPs include the derived runtime mesh and attribution; original STEP source files are not bundled.

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
| v2.1 | Focused workspace, dialog flow and interaction cleanup |
| v2.1.1 | Migration/recovery regression checks and geometry timeout recovery |
| v2.2 | Editable pattern recipes and linked symmetry |
| v2.3 | Seeded Remix, independent locks and favorites |
| v2.4 | Image tracing, Boolean shape operations and borders |
| v2.5 | Curved text and portable personal stamps |
| v2.6 | Relief brushes, test patches and material appearances |
| v2.7 | Physical material sheets, exploded preview and per-sheet exports |
| v2.8 | Calibration records, windows, diffuser and clearance zones |
| v3.0 | Integrated starters, schema 3, export/report consistency and release packaging |

See ROADMAP.md for release status and remaining validation work.

## Validation and limitations

See VALIDATION.md for exact checks and limitations. Geometry, exported topology, 3MF package structure, fabrication behavior and DOM workflows were tested. Real-browser rendering, service-worker offline reload, mobile layout and physical fabrication were not verified in this environment. WebGL availability varies by device. Review exports in your slicer/cutter software before manufacture.

## Licenses

FACEBENCH application source is GPL-3.0-or-later (LICENSE). Bundled dependencies retain their own licenses under vendor/. Font outlines retain the DejaVu/Bitstream terms in FONT-LICENSE.txt. Valve-derived assets are separate from application code; see CAD-ATTRIBUTION.md. The ZIP is a self-hosted software delivery, not an already deployed website.
