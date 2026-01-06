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
const assertIsReachable = (url, errorMessage) =>
  fetch(url, { headers: { "User-Agent": "DoNotBlockMe/1.0" } })
    .then(function (response) {
      if (!response.ok) {
        // Check if access is blocked by a Cloudflare challenge, which is used to
        // prevent automated access. If this is the case, let's assume URL is OK.
        if (
          response.status === 403 &&
          response.headers.get("cf-mitigated") === "challenge"
        ) {
          return;
        }

        throw new Error(`${response.status} ${response.statusText}`);
      }
    })
    .catch(function (error) {
      throw new Error(`${errorMessage}: ${error.message}`);
    });

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
      await assertIsReachable(app.logo, "Logo is unreachable");
    }

    await assertIsReachable(app.url, "URL is unreachable");

    if (app.site) {
      await assertIsReachable(app.site, "Site is unreachable");
    }
    // @ts-ignore
    if (app.github) {
      // @ts-ignore
      await assertIsReachable(app.github, "GitHub link is unreachable");
    }
    // @ts-ignore
    if (app.telegram) {
      // @ts-ignore
      await assertIsReachable(app.telegram, "Telegram link is unreachable");
    }
    // @ts-ignore
    if (app.twitter) {
      // @ts-ignore
      await assertIsReachable(app.twitter, "X (Twitter) link is unreachable");
    }
  });
});
