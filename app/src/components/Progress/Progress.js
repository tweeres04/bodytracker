import React, { useEffect, useState } from 'react';

import isWithinInterval from 'date-fns/isWithinInterval';
import endOfDay from 'date-fns/endOfDay';

import _range from 'lodash/range';
import _orderBy from 'lodash/orderBy';

import Loader from '../Loader';
import useEntries from '../useEntries';
import ChartControls from './ChartControls';
import Chart from './Chart';

const colours = [
	'rgb(50,115,220)',
	'rgb(255,56,96)',
	'rgb(255,221,87)',
	'rgb(35,209,96)',
];

const backgroundColours = [
	'rgba(50,115,220, 0.2)',
	'rgba(255,56,96, 0.2)',
	'rgba(255,221,87, 0.2)',
	'rgba(35,209,96, 0.2)',
];

const minDate = new Date(1900, 0);

/**
 * For when there's a gap in a dataset, finds the most recently entered value
 * @param {number[]} values
 * @returns number
 */
function findPrevValue(values) {
	return values[values.length - 1] ?? findPrevValue(values.slice(0, -1));
}

function useDateRange() {
	const [{ start, end }, setDateRange] = useState(() => {
		const { start, end } =
			JSON.parse(localStorage.getItem('chartControlsState')) || {};

		return {
			start: start && new Date(start),
			end: end && new Date(end),
		};
	});

	function resetDateRange() {
		setDateRange({
			start: null,
			end: null,
		});
	}

	useEffect(() => {
		localStorage.setItem('chartControlsState', JSON.stringify({ start, end }));
	}, [start, end]);

	return { start, end, setDateRange, resetDateRange };
}

export default function Progress() {
	const { start, end, setDateRange, resetDateRange } = useDateRange();
	let { data: entries = [], isLoading } = useEntries();

	entries = _orderBy(entries, 'timestamp');

	const interval = {
		start: start || minDate,
		end: endOfDay(end || new Date()),
	};

	entries =
		start || end
			? entries.filter((e) =>
					isWithinInterval(new Date(e.timestamp.toDate()), interval)
			  )
			: entries;

	const times = entries.map((e) => new Date(e.timestamp.toDate()));
	const weight = entries.map((e) => e.weight);
	const waist = entries.map((e) => e.waist);
	const weightToWaist = entries.map(
		(e, i) =>
			(e.weight ??
				findPrevValue(entries.map((e) => e.weight).slice(entries.length - 1))) /
			(e.waist ??
				findPrevValue(entries.map((e) => e.waist).slice(entries.length - 1)))
	);
	const chest = entries.map((e) => e.chest);
	const hips = entries.map((e) => e.hips);
	const bf = entries.map((e) => e.bf);

	const movingAverageInterval = Math.round(entries.length / 5);
	const movingAverageSampleInterval = Math.round(Math.log2(entries.length)); // Plot one of every n entries to smooth the line

	const weightMovingAverageRemainder =
		(weight.length - 1) % movingAverageSampleInterval;
	const weightMovingAverageDataset = {
		label: `Weight (${movingAverageInterval} Entry Average)`,
		data: weight.map((w, i) =>
			i < movingAverageInterval ||
			i % movingAverageSampleInterval !== weightMovingAverageRemainder
				? null
				: _range(i - movingAverageInterval + 1, i + 1).reduce(
						(sum, i) => sum + (weight[i] ?? findPrevValue(weight.slice(0, i))),
						0
				  ) / movingAverageInterval
		),
		yAxisID: 'weight-axis',
		spanGaps: true,
	};

	const waistMovingAverageRemainder =
		(waist.length - 1) % movingAverageSampleInterval;
	const waistMovingAverageDataset = {
		label: `Waist (${movingAverageInterval} Entry Average)`,
		data: waist.map((w, i) =>
			i < movingAverageInterval ||
			i % movingAverageSampleInterval !== waistMovingAverageRemainder
				? null
				: _range(i - movingAverageInterval + 1, i + 1).reduce(
						(sum, i) => sum + (waist[i] ?? findPrevValue(waist.slice(0, i))),
						0
				  ) / movingAverageInterval
		),
		yAxisID: 'other-axis',
		spanGaps: true,
	};

	const weightToWaistMovingAverageRemainder =
		(waist.length - 1) % movingAverageSampleInterval;
	const weightToWaistMovingAverageDataset = {
		label: `Weight to waist (${movingAverageInterval} Entry Average)`,
		data: weightToWaist.map((w, i) =>
			i < movingAverageInterval ||
			i % movingAverageSampleInterval !== weightToWaistMovingAverageRemainder
				? null
				: _range(i - movingAverageInterval + 1, i + 1).reduce(
						(sum, i) =>
							sum +
							(weightToWaist[i] ?? findPrevValue(weightToWaist.slice(0, i))),
						0
				  ) / movingAverageInterval
		),
		yAxisID: 'other-axis',
		spanGaps: true,
	};

	const datasets = [
		{
			label: 'Weight',
			data: weight,
			borderColor: colours[0],
			backgroundColor: backgroundColours[0],
			yAxisID: 'weight-axis',
			lineTension: 0,
			spanGaps: true,
		},
		{
			label: 'Waist',
			data: waist,
			borderColor: colours[1],
			backgroundColor: backgroundColours[1],
			yAxisID: 'other-axis',
			lineTension: 0,
			spanGaps: true,
		},
		{
			label: 'Weight to waist ratio',
			data: weightToWaist,
			borderColor: colours[2],
			backgroundColor: backgroundColours[2],
			yAxisID: 'other-axis',
			lineTension: 0,
			spanGaps: true,
		},
		{
			label: 'Chest',
			data: chest,
			borderColor: colours[3],
			backgroundColor: backgroundColours[3],
			yAxisID: 'other-axis',
			lineTension: 0,
			spanGaps: true,
		},
		{
			label: 'Hips',
			data: hips,
			borderColor: colours[0],
			backgroundColor: backgroundColours[0],
			yAxisID: 'other-axis',
			lineTension: 0,
			spanGaps: true,
		},
		{
			label: 'Bodyfat %',
			data: bf,
			borderColor: colours[1],
			backgroundColor: backgroundColours[1],
			yAxisID: 'other-axis',
			lineTension: 0,
			spanGaps: true,
		},
	];

	const yAxes = {
		weightAxis: {
			id: 'weight-axis',
		},
		otherAxis: {
			id: 'other-axis',
		},
	};

	return isLoading ? (
		<Loader />
	) : (
		<section className="section">
			<div className="container">
				<h1 className="title">Progress</h1>
				<ChartControls
					setDateRange={setDateRange}
					resetDateRange={resetDateRange}
					start={start}
					end={end}
				/>
				<div className="columns" key="all">
					<div className="column">
						<Chart
							times={times}
							datasets={datasets.filter(
								(d) => d.label !== 'Weight to waist ratio'
							)}
							yAxes={[yAxes.weightAxis, yAxes.otherAxis]}
						/>
					</div>
				</div>
				{datasets.map((d) =>
					d.data.some((d) => d) ? (
						<div className="columns" key={d.label}>
							<div className="column">
								<h2 className="title is-5">{d.label}</h2>
								<Chart
									times={times}
									datasets={
										d.label === 'Weight'
											? [d, weightMovingAverageDataset]
											: d.label === 'Waist'
											? [d, waistMovingAverageDataset]
											: d.label === 'Weight to waist ratio'
											? [d, weightToWaistMovingAverageDataset]
											: [d]
									}
									yAxes={[
										d.label == 'Weight' ? yAxes.weightAxis : yAxes.otherAxis,
									]}
								/>
							</div>
						</div>
					) : null
				)}
			</div>
		</section>
	);
}
