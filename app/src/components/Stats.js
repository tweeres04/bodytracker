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

function formatDate(date) {
	return format(date, 'E LLL d y');
}

function formatDateAndTime(date) {
	return format(date, "E LLL d y 'at' h:mmaaa");
}

function Statistic({
	label,
	percentage = null,
	successStyle = false,
	children,
}) {
	const valueClasses = classnames('title is-4 is-marginless', {
		'has-text-success': successStyle,
	});
	const tagClasses = classnames('tag is-rounded', {
		'is-success': successStyle,
	});

	return children !== undefined ? (
		<div className="column has-text-centered">
			<div className="heading has-text-grey-light">{label}</div>
			<div className={valueClasses}>{children}</div>
			{percentage !== null && <div className={tagClasses}>{percentage}%</div>}
		</div>
	) : null;
}

function StatisticsCard({ title, subtitle, children }) {
	return (
		<>
			<div className="box">
				<h3 className="title is-4">{title}</h3>
				{subtitle && <h5 className="subtitle is-7">{subtitle}</h5>}
				<div className="columns is-mobile is-gapless">{children}</div>
			</div>
		</>
	);
}

function StatisticRange({ label, latestEntry, firstEntry }) {
	const value = firstEntry ? _round(latestEntry - firstEntry, 2) : latestEntry;
	const displayValue = firstEntry && value > 0 ? `+${value}` : value;
	const percentage = firstEntry ? _round((value / firstEntry) * 100, 2) : null;

	const successStyle = firstEntry && value < 0;

	return (
		<Statistic
			label={label}
			percentage={percentage}
			successStyle={successStyle}
		>
			{displayValue}
		</Statistic>
	);
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

	const subtitle = `(Since ${formatDate(firstEntry.timestamp.toDate())})`;

	return entriesInTimeframe.length > 0 ? (
		<StatisticsCard title={title} subtitle={subtitle}>
			<StatisticRange label="Entries" latestEntry={entriesInTimeframe.length} />
			<StatisticRange
				label="Weight"
				latestEntry={latestEntry.weight}
				firstEntry={firstEntry.weight}
			/>
			<StatisticRange
				label="Waist"
				latestEntry={latestEntry.waist}
				firstEntry={firstEntry.waist}
			/>
			<StatisticRange
				label="Chest"
				latestEntry={latestEntry.chest}
				firstEntry={firstEntry.chest}
			/>
			<StatisticRange
				label="Hips"
				latestEntry={latestEntry.hips}
				firstEntry={firstEntry.hips}
			/>
			<StatisticRange
				label="Bodyfat Percentage"
				latestEntry={latestEntry.bf}
				firstEntry={firstEntry.bf}
			/>
		</StatisticsCard>
	) : null;
}

export default function Stats() {
	const { data: entries = [], isLoading } = useEntries();

	const firstDate = isLoading
		? null
		: new Date(entries[entries.length - 1].timestamp.toDate());
	const now = new Date();
	const latestEntry = entries[0];

	return isLoading ? (
		<Loader />
	) : (
		<section className="section">
			<div className="container">
				<h1 className="title">Stats</h1>
				{entries && entries.length < 1 ? (
					<div className="box">No entries yet. Add one to get started.</div>
				) : (
					<>
						<StatisticsCard
							title="Latest Entry"
							subtitle={formatDateAndTime(latestEntry.timestamp.toDate())}
						>
							<Statistic label="Weight">{latestEntry.weight}</Statistic>
							<Statistic label="Waist">{latestEntry.waist}</Statistic>
							<Statistic label="Chest">{latestEntry.chest}</Statistic>
							<Statistic label="Hips">{latestEntry.hips}</Statistic>
							<Statistic label="Bodyfat Percentage">{latestEntry.bf}</Statistic>
						</StatisticsCard>
						<StatisticsRange title="Past Week" entries={entries} days={7} />
						<StatisticsRange title="Past Month" entries={entries} days={30} />
						<StatisticsRange
							title="Past 3 Months"
							entries={entries}
							days={91}
						/>
						<StatisticsRange
							title="Past 6 Months"
							entries={entries}
							days={182}
						/>
						<StatisticsRange title="Past Year" entries={entries} days={365} />
						<StatisticsRange
							title={`All Time (${formatDistance(now, firstDate)})`}
							entries={entries}
							days={30000}
						/>
					</>
				)}
			</div>
		</section>
	);
}
