---
title: Size budget
summary: Measures the size of what users download (a bundle, a package, a binary) and fails when it passes its limit.
sensors: [performance-measure]
layer: project
vendors:
  - name: size-limit
    url: https://github.com/ai/size-limit
    note: JavaScript bundles
  - name: Statoscope
    url: https://github.com/statoscope/statoscope
    note: webpack bundles, and how two builds differ
  - name: cargo-bloat
    url: https://github.com/RazrFalcon/cargo-bloat
    note: Rust binaries
---

The program behind a size budget depends on what the project ships: look for it in the project, and do not assume
one.

## Finding it

Look for the limits in the repository. For a JavaScript bundle: a `size-limit` section in `package.json`, a
`.size-limit.json` file or a Statoscope config. For a binary or a package: a step in CI that compares its size with a
limit.

When there is none, measure the current build first: the first limit starts from that size, and a person agrees to it
before the check goes into CI.

## Using it

- **Run it after the build**, whose output it measures: `npx size-limit` measures each entry against its limit; for a
  binary or a package, the CI step compares the file's size with its limit.
- **Keep the limit in the repository**, so raising it is a visible change that a person reviews.
- **Report what grew**: `size-limit --why`, or a Statoscope comparison of two builds, names the modules that grew;
  `cargo bloat` lists what takes the space in a Rust binary.
- **Measure what is sent**: the compressed size (gzip or brotli), when that is what users download.
