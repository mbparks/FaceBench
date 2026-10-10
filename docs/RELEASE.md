# INTERFACEBENCH 1.6.0-rc.1 — distance and area measurement

Measure now has a highlighted active button, aria-pressed state, crosshair, canvas border and dedicated control strip. The first click displays a numbered point. Moving the pointer previews the segment and reports distance, ΔX/ΔY, front-reference coordinates and snap target.

Feature/grid/free snapping is explicit. Exact targets include component and cutout centres, physical corners, edge midpoints, circle quadrants, straight and circular edges. Rounded corners do not create false sharp-corner targets. Imported Bézier paths supply endpoint and parameter-midpoint targets, not approximate curve edges. Shift constrains an axis, Alt bypasses snapping, and numeric point entry accepts units.

Area mode accepts multiple clicks and reports polygon area and closed perimeter. Finish via the first point, Finish area, Enter or a double-click. Undo point, Backspace and Ctrl/Command Z correct input; New clears and Done exits. Crossed or degenerate outlines cannot be finalized. Measurements are temporary and cannot alter/export design geometry. Curved areas are approximated by straight segments between picked points.

91 automated checks pass: the previous 76 plus 11 geometry/state/render checks and four application-event workflow checks. Static first-point, live-distance and finished-area renders were reviewed. Real-browser layout, native gestures, mobile controls, IndexedDB and offline acceptance remain pending under the existing Sites restriction.

Upload the complete server ZIP to /interfacebench/. Back up JSON before updating and use Save & reload for the new offline cache. No schema migration or build step is required.
