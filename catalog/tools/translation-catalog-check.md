---
title: Translation catalog check
summary: "Checks the project's messages and translations: hard-coded strings, missing keys, placeholders that differ between locales."
sensors: [structure-check, linter]
layer: project
vendors:
  - name: FormatJS
    url: https://formatjs.github.io/
    note: "JavaScript; `formatjs extract` and its ESLint plugin"
  - name: i18next-cli
    url: https://github.com/i18next/i18next-cli
    note: JavaScript, for i18next
  - name: eslint-plugin-i18next
    url: https://github.com/edvardchen/eslint-plugin-i18next
    note: JavaScript; hard-coded strings
  - name: GNU gettext
    url: https://www.gnu.org/software/gettext/
    note: "`msgfmt --check`"
  - name: Android Lint
    url: https://developer.android.com/studio/write/lint
    note: "Android; the `MissingTranslation` check"
---

A message catalog is the file that holds the project's messages for one locale (a language, sometimes with its
region), each under a key. Comparing the catalogs with the code and with each other is a structure check; finding
strings written straight into the code is a lint rule. How the project stores its messages decides which checks
apply.

## Finding it

1. **The message catalogs**, for example a `locales/` directory of JSON or YAML files, gettext's `.po` files and
   their `.pot` template, Android's `strings.xml` per language, iOS `.strings` files or Java `.properties` bundles.
2. **The translation (i18n) library** in the dependencies.
3. **An extract or check step** in the task file or CI.

## Using it

- **Extract and compare**: an extractor (`formatjs extract`, `i18next-parser`, `xgettext`) lists the messages the
  code uses; the project's check step, or a short script, compares that list with each locale's catalog, so missing
  and unused keys show. For gettext, `msgcmp` reports the messages a catalog lacks.
- **Check the placeholders**: `msgfmt --check` for gettext catalogs. For messages in ICU format (placeholders and
  plural forms in braces), parse each locale's text with the library the app uses, and compare its placeholders with
  those of the source message.
- **Find hard-coded strings** with a lint rule, such as `no-literal-string` from eslint-plugin-i18next.
- **Build a pseudo-locale**: accented, lengthened text shows whoever looks at the running app the strings that
  overflow their space or were never translated.
