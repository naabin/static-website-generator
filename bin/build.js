#!/usr/bin/env node
console.log(process.argv);
require('../lib/tasks/build')(process.cwd());