import React from 'react';
import classnames from 'classnames';

import dateAddDays from 'date-fns/addDays';
import dateClosestIndexTo from 'date-fns/closestIndexTo';
import dateIsAfter from 'date-fns/isAfter';
import startOfDay from 'date-fns/startOfDay';
import formatDistance from 'date-fns/formatDistance';
import format from 'date-fns/format';

import _round from 'lodash/round';

import Loader from './Loader';
import useEntries from './useEntries';

function Statistic({ label, latestEntry, firstEntry }) {
	const value = firstEntry ? _round(latestEntry - firstEntry, 2) : latestEntry;
	const displayValue = firstEntry && value > 0 ? `+${value}` : value;
	const percentage = firstEntry ? _round((value / firstEntry) * 100, 2) : null;

	const valueClasses = classnames('title is-4 is-marginless', {
		'has-text-success': firstEntry && value < 0,
	});
	const tagClasses = classnames('tag is-rounded', {
		'is-success': firstEntry && value < 0,
	});

	return value !== undefined ? (
		<div className="column has-text-centered">
			<div className="heading has-text-grey-light">{label}</div>
			<div className={valueClasses}>{displayValue}</div>
			{percentage !== null && <div className={tagClasses}>{percentage}%</div>}
		</div>
	) : null;
}

function StatisticsRange({ title, entries, days }) {
	const today = new Date();
	const beginningOfTimeframe = startOfDay(dateAddDays(today, -days));
	const latestEntry = entries[0];
	const entriesInTimeframe = entries.filter((e) =>
		dateIsAfter(e.timestamp.toDate(), beginningOfTimeframe)
	);
	const index = dateClosestIndexTo(
		beginningOfTimeframe,
		entriesInTimeframe.map((e) => e.timestamp.toDate())
	);
	const firstEntry = entries[index];

	return entriesInTimeframe.length > 0 ? (
		<>
			<div className="box">
				<h3 className="title is-4">{title}</h3>
				<h5 className="subtitle is-7">
					(Since {format(firstEntry.timestamp.toDate(), 'E LLL d y')})
				</h5>
				<div className="columns is-mobile is-gapless">
					<Statistic label="Entries" latestEntry={entriesInTimeframe.length} />
					<Statistic
						label="Weight"
						latestEntry={latestEntry.weight}
						firstEntry={firstEntry.weight}
					/>
					<Statistic
						label="Waist"
						latestEntry={latestEntry.waist}
						firstEntry={firstEntry.waist}
					/>
					<Statistic
						label="Chest"
						latestEntry={latestEntry.chest}
						firstEntry={firstEntry.chest}
					/>
					<Statistic
						label="Hips"
						latestEntry={latestEntry.hips}
						firstEntry={firstEntry.hips}
					/>
					<Statistic
						label="Bodyfat Percentage"
						latestEntry={latestEntry.bf}
						firstEntry={firstEntry.bf}
					/>
				</div>
			</div>
		</>
	) : null;
}

function Statistics({ entries }) {
	const firstDate = new Date(
		entries[entries.length - 1].timestamp.seconds * 1000
	);
	const now = new Date();
	return (
		<>
			<StatisticsRange title="Past Week" entries={entries} days={7} />
			<StatisticsRange title="Past Month" entries={entries} days={30} />
			<StatisticsRange title="Past 3 Months" entries={entries} days={91} />
			<StatisticsRange title="Past 6 Months" entries={entries} days={182} />
			<StatisticsRange title="Past Year" entries={entries} days={365} />
			<StatisticsRange
				title={`All Time (${formatDistance(now, firstDate)})`}
				entries={entries}
				days={30000}
			/>
		</>
	);
}

export default function Stats() {
	const { data: entries, isLoading } = useEntries();

	return isLoading ? (
		<Loader />
	) : (
		<section className="section">
			<div className="container">
				<h1 className="title">Stats</h1>
				{entries && entries.length < 1 ? (
					<div className="box">No entries yet. Add one to get started.</div>
				) : (
					<Statistics entries={entries} />
				)}
			</div>
		</section>
	);
}
