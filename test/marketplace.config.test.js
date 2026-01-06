"use strict";

const { test } = require("node:test");
const { validate } = require("jsonschema");
const assert = require("assert");
const fs = require("fs");

const marketplaceConfig = require("../marketplace/config.json");
const schema = require("../schemas/marketplace-config.json");

// Disable TLS certificate validation for testing purposes only!
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// Check if a URL is reachable. The User-Agent header is set to avoid being
// blocked by some services' security policies that block `fetch`, `curl`, etc.
const isReachable = (url) =>
  fetch(url, { headers: { "User-Agent": "DoNotBlockMe/1.0" } })
    .then((response) => response.ok)
    .catch(() => false);

test("Marketplace config is well formed", function () {
  const validation = validate(marketplaceConfig, schema);
  assert(validation.valid, validation.errors.map((e) => e.stack).join(", "));
});

marketplaceConfig.forEach(function (app, i) {
  test(`App ${i}: ${app.id}`, async function () {
    const duplicateApps = marketplaceConfig.filter((a) => a.id === app.id);
    assert(duplicateApps.length === 1, `Duplicate app id: ${app.id}`);

    const githubBaseUrl =
      "https://raw.githubusercontent.com/hemilabs/blockscout-config" +
      "/refs/heads/master/";
    if (app.logo.startsWith(githubBaseUrl)) {
      const path = app.logo.replace(githubBaseUrl, "");
      assert(fs.existsSync(path), "Logo file is missing in the repo");
    } else {
      assert(await isReachable(app.logo), "Logo is unreachable");
    }

    assert(await isReachable(app.url), "URL is unreachable");

    if (app.site) {
      assert(await isReachable(app.site), "Site is unreachable");
    }
    // @ts-ignore
    if (app.github) {
      // @ts-ignore
      assert(await isReachable(app.github), "GitHub link is unreachable");
    }
    // @ts-ignore
    if (app.telegram) {
      // @ts-ignore
      assert(await isReachable(app.telegram), "Telegram link is unreachable");
    }
    // @ts-ignore
    if (app.twitter) {
      // @ts-ignore
      assert(await isReachable(app.twitter), "X (Twitter) link is unreachable");
    }
  });
});
