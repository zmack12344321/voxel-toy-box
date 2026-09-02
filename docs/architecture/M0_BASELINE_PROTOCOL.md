# M0 Baseline Protocol

This is the repeatable safety check for the M0 milestone in the [architecture roadmap](./ROADMAP.md). Record observations before changing renderer, compiler, physics, or generation code. Do not treat an unmeasured value as a baseline.

## Environment record

Record the date, commit, browser/version, OS, GPU, viewport CSS size, device-pixel ratio, and whether the run is cold (fresh tab and cache) or warm. Use the same machine and viewport for all comparisons. Disable unrelated browser tabs and extensions where practical.

## Manual smoke checklist

Start the app with `npm run dev`, open the Vite URL, and confirm the initial model renders without console errors.

- [ ] Launch and initial load: the app reaches its usable state; Eagle renders; controls respond.
- [ ] Presets: open the library, load Eagle, then load Tropical Island; each replaces the prior model and remains interactive.
- [ ] JSON view/export: open the JSON view for the active model, copy/export it, and confirm it is non-empty and valid JSON.
- [ ] JSON import: import the exported JSON and confirm the model matches the exported model; try malformed JSON and confirm a visible error without losing the current model.
- [ ] Prompt create: submit a small, concrete create prompt; confirm loading, result display, and that the generated model can be viewed/rebuilt.
- [ ] Prompt morph: select a model, submit a morph prompt, and confirm the result applies without a blank scene or uncaught error.
- [ ] Dismantle/rebuild: trigger dismantle, observe the animation, then rebuild the active model; repeat from a stable scene and confirm it returns to stable state.
- [ ] Render modes/settings: switch each available render mode; change exposed quality, theme, lighting, or scene settings; confirm the scene remains visible and controls do not throw errors.
- [ ] Resize/reload: resize the window across desktop and narrow widths, then reload; confirm camera/renderer resize correctly and the initial scene loads again.

Record failures with the exact step, model, prompt, browser console error, and a screenshot if useful. A smoke pass means every checked step completes with no uncaught error and no unrecoverable blank/incorrect scene.

## Fixed performance measurement protocol

Measure three runs per model and report the median and p95. Use a fixed viewport and DPR from the environment record. Measure these representative models: `Eagle`, `Tropical Island`, and the largest/high-detail preset currently shipped (record its exact preset name). Keep render mode and settings constant for the baseline; record any deviations.

For each model, start a fresh page for cold-load measurements. Capture cold load from navigation start until the scene is visible and interactive. Then use the same page for warm rebuild measurements: trigger rebuild three times and measure each from rebuild action to stable completed scene. Capture frame time while the scene is stable for at least 10 seconds, using the browser performance panel or an equivalent profiler. Record `renderer.info` values after stabilization and the browser-reported JS heap when available. Note qualitative issues such as stutter, shader compilation hitch, visual artifacts, console errors, or failed recovery separately from numeric results.

Use the same measurement points after changes. Do not compare results across different viewport, DPR, browser, model revision, or render settings without recording the difference.

## Recording table

Copy one row per run, then add a summary row with median/p95 for each numeric column.

| Date/commit | Browser/OS/GPU | Viewport CSS + DPR | Model + exact revision | Mode/settings | Run type (cold load / rebuild / frame) | Duration ms / frame ms | FPS (if available) | renderer.info: geometries | renderer.info: textures | renderer.info: calls | renderer.info: triangles | JS heap used MB (or N/A) | Qualitative issues / console errors |
|---|---|---|---|---|---|---:|---:|---:|---:|---:|---:|---:|---|
| **NOT YET MEASURED** | — | — | Eagle | — | — | — | — | — | — | — | — | — | Run protocol |
| **NOT YET MEASURED** | — | — | Tropical Island | — | — | — | — | — | — | — | — | — | Run protocol |
| **NOT YET MEASURED** | — | — | High-detail preset: **record name** | — | — | — | — | — | — | — | — | — | Run protocol |

### Summary

| Model | Cold-load median / p95 ms | Rebuild median / p95 ms | Stable frame median / p95 ms | Stable FPS median / p95 | renderer.info summary | Heap summary | Qualitative issues |
|---|---:|---:|---:|---:|---|---|---|
| Eagle | **NOT YET MEASURED** | **NOT YET MEASURED** | **NOT YET MEASURED** | **NOT YET MEASURED** | **NOT YET MEASURED** | **NOT YET MEASURED** | **NOT YET MEASURED** |
| Tropical Island | **NOT YET MEASURED** | **NOT YET MEASURED** | **NOT YET MEASURED** | **NOT YET MEASURED** | **NOT YET MEASURED** | **NOT YET MEASURED** | **NOT YET MEASURED** |
| High-detail preset: **record name** | **NOT YET MEASURED** | **NOT YET MEASURED** | **NOT YET MEASURED** | **NOT YET MEASURED** | **NOT YET MEASURED** | **NOT YET MEASURED** | **NOT YET MEASURED** |

Baseline status: **not yet measured**. M0 exits only when the smoke checklist passes and this table contains three runs plus median/p95 summaries for all three models.
