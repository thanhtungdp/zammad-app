#!/bin/sh
{ echo "export default"; npx license-checker --json --customPath src/meta/licenseFormat.json; } > src/meta/licenses.js