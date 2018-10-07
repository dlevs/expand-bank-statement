#!/usr/bin/env node
'use strict';

const yargs = require('yargs');
const fs = require('fs-extra');
const createCSVTransformer = require('./lib/createCSVTransformer');
const { rootPath, getOutputPath } = require('./lib/util');

const { _: filepaths, balance } = yargs
	.usage('Usage: $0 --balance [num] ./statement.csv')
	.option('balance', {
		alias: 'b',
		describe: 'The account balance before the first transaction took place',
		default: 0,
	})
	.argv;

if (filepaths.length) {
	const transformCSV = createCSVTransformer({ initialBalance: balance });

	filepaths.forEach(async filepath => {
		const input = await fs.readFile(filepath, 'utf8');
		const output = await transformCSV(input);
		const outputPath = getOutputPath(filepath);

		await fs.writeFile(outputPath, output);
	});
} else {
	yargs.showHelp();
}
