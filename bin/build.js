#!/usr/bin/env node
console.log(process.argv);
require('../lib/tasks/build.js')(process.cwd());