Utility Studio
v0.1.0

Install:
1. Close Premiere Pro.
2. Run install.bat.
3. Fully restart Premiere Pro.
4. Open Window > Extensions > Utility Studio.

Required template:
1. In Premiere, create a new empty project.
2. New Item > Adjustment Layer.
3. Save the project as:
   utility-studio-adjustment.prproj
4. Put it in:
   client/assets/utility-studio-adjustment.prproj

Important:
- Panel and host both use US_BUILD.
- If the build mismatch remains after install, the panel shows the stale-banner.
- You must fully restart Premiere after a new extension install.
- This plugin is CEP-based and uses native ExtendScript bridging.

Current functionality:
- Panel shell
- Stale build detection
- Fit/fill placeholders
- Gaps placeholder
- Motion preset application
- Transition placeholder API
- Media download/search placeholder API
- Carousel preset placeholder API
- Adjustment layer template handling
