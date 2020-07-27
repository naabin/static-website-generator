#!/usr/bin/env node
const path = require('path');
const build = require('../lib/tasks/build.js').default;
build(path.resolve(process.argv.slice(2)[0] || '.'))