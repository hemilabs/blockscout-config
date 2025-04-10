"use strict";

const assert = require("assert");
const { suite, test } = require("node:test");
const { validate } = require("jsonschema");

const footerLinks = require("../footer/links.json");
const schema = require("../schemas/footer-links.json");

const isReachable = (url) =>
  fetch(url, { headers: { "user-agent": "curl/8" } }) // Make x.com happy
    .then((response) => response.ok)
    .catch(() => false);

test("Footer links are well formed", function () {
  const validation = validate(footerLinks, schema);
  assert(validation.valid, validation.errors.map((e) => e.stack).join(", "));
});

footerLinks.forEach(function ({ links, title }) {
  suite(`${title} links`, function () {
    links.forEach(function ({ text, url }) {
      test(text, async function () {
        assert(await isReachable(url), `${url} is unreachable`);
      });
    });
  });
});
