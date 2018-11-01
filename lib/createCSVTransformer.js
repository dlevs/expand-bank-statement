'use strict';

const { promisify } = require('util');
const parseCSV = promisify(require('csv-parse'));
const stringifyCSV = promisify(require('csv-stringify'));
const sortBy = require('lodash/sortBy');
const format = require('date-fns/format');
const Big = require('big.js');
const pPipe = require('p-pipe');

/**
 * Parse a CSV string into an array of objects representing each row.
 *
 * @param {String} data
 * @returns {Promise<Object[]>}
 */
const parse = data =>
	parseCSV(data, {
		columns: true,
		trim: true,
		skip_empty_lines: true,
		cast: (value, { column }) => {
			if (column === 'Amount') {
				return new Big(value);
			}

			return value;
		}
	});

/**
 * Construct a CSV string from an array of objects.
 *
 * @param {Object[]} data
 * @returns {Promise<String>}
 */
const stringify = data =>
	stringifyCSV(data, {
		header: true,
		columns: ['Date', 'Reference', 'Amount', 'Balance'],
		formatters: {
			object: obj => {
				if (obj instanceof Big) {
					return obj.toFixed(2);
				}
				return obj;
			}
		}
	});

/**
 * Returns a function which expands object values in an array.
 *
 * @param {Number} initialBalance
 * @returns {Function}
 */
const createExpander = initialBalance => data => sortBy(data, 'Date')
	.reduce((transactions, current, i) => {
		const lastTransaction = transactions[i - 1];
		const lastBalance = lastTransaction
			? lastTransaction.Balance
			: new Big(initialBalance);
		const description = current['Transaction description'];
		const referenceParts = [description];

		if (current.Reference && !description.includes(current.Reference)) {
			referenceParts.push(`(ref: ${current.Reference})`);
		}

		return transactions.concat({
			...current,
			Reference: referenceParts.join(' '),
			Date: format(current.Date, 'DD/MM/YYYY'),
			Balance: lastBalance.add(current.Amount),
		});
	}, []);

/**
 * Returns a function for converting a CSV string from one
 * format to another. This is done asynchronously.
 *
 * @param {Object} options
 * @param {Number} options.initialBalance
 * @returns {Function}
 */
module.exports = ({ initialBalance }) => pPipe(
	parse,
	createExpander(initialBalance),
	stringify,
);
