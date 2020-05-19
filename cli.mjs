#!/usr/bin/env -S node --experimental-modules
import commander from 'commander';
import {execute} from './index.mjs';

function myParseInt(value, dummyPrevious) {
  return parseInt(value);
}

commander
.option('-v, --verbose', 'Increment program verbosity.')
.parse(process.argv);

async function main(options){

  execute(options);

}

const verbose = commander.verbose;
const sources = commander.args;
const destination = sources.pop();

main({
  verbose,
  sources,
  destination,
});
