#!/usr/bin/env node
const path = require('path');
const compress = require('../lib/tasks/compress-images.js').default;
compress(path.resolve(process.argv.slice(2)[0] || '.'))