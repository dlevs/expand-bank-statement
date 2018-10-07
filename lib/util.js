'use strict';

const path = require('path');

exports.rootPath = (...args) => path.join(__dirname, '..', ...args);
exports.getOutputPath = filepath => {
	const { base, ...parts } = path.parse(filepath);

	return path.format({
		...parts,
		name: `${parts.name}-expanded`,
	});
};
