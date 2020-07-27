#!/usr/bin/env node
console.log(process.argv);
const compress = require('../lib/tasks/compress-images.js').default;
compress(path.resolve(process.argv.slice(2)[0] || '.'))