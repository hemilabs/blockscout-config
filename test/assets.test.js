"use strict";

const { test } = require("node:test");
const assert = require("assert");
const fs = require("fs");

test("Main Hemi icon exists", function () {
  assert(fs.existsSync("assets/hemi-icon.svg"), "Hemi icon file is missing");
});
test("Main Hemi logo exists", function () {
  assert(fs.existsSync("assets/hemi-logo.svg"), "Hemi logo file is missing");
});
