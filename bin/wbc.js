#!/usr/bin/env node
const Wbc = require('./wbc_lib').Wbc;
const path = require('path');
const fs = require('fs');
const { program } = require('commander');
const packageConfig = require('../package.json');
const Qjsc = require('../index');

program
  .version(packageConfig.version)
  .description('The WBC file generator')
  .requiredOption('-s, --source <source>', 'the Javascript source file path')
  .requiredOption('-d, --dist <dist>', 'the generated bytecode file path')
  .option('--legacy_kbc1', 'generate legacy kbc1 file, (compact with openkraken project)')
  .parse(process.argv);

let options = program.opts();
let source = options.source;
let dist = options.dist;

let type = "wbc";
if (options.legacy_kbc1) {
  type = 'kbc1';
}

if (!path.isAbsolute(source)) {
  source = path.join(process.cwd(), source);
}
if (!path.isAbsolute(dist)) {
  dist = path.join(process.cwd(), dist);
}

const qjsc = new Qjsc();

const sourceFileName = source.split('/').slice(-1)[0].split('.')[0];
const sourceCode = fs.readFileSync(source, {encoding: 'utf-8'});

let buffer = qjsc.compile(sourceCode);

if (type == 'kbc1') {
  let distPath = path.join(dist, sourceFileName + '.kbc1');
  fs.writeFileSync(distPath, buffer);
  console.log('Quickjs bytecode generated kbc1 at: \n' + distPath);
} else if (type == 'wbc') {
  const wbc = new Wbc();
  let wbcBytecode = wbc.generateWbcBytecode(buffer);
  let distPath = path.join(dist, sourceFileName + '.wbc1');
  fs.writeFileSync(distPath, wbcBytecode);
  console.log('Quickjs bytecode generated wbc1 at: \n' + distPath);
}
