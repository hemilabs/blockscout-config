"use strict";

const stringify = require("json-stable-stringify");
const fs = require("fs");

fs.writeFileSync(
  "marketplace/config.json",
  /** @type {string} */ (
    stringify(
      JSON.parse(fs.readFileSync("marketplace/config.json", "utf-8"))
        // Sort apps by id
        .sort((a, b) => a.id.localeCompare(b.id))
        // Sort app categories
        .map((app) => ({ ...app, categories: app.categories.sort() })),
      {
        // Sort app properties leaving "id" at the top
        cmp: (a, b) =>
          a.key === "id" ? -1 : b.key === "id" ? 1 : a.key.localeCompare(b.key),
        space: 2,
      },
    )
  ),
  "utf-8",
);
