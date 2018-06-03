import React, { Component } from 'react';
import firebase from 'firebase';
import classnames from 'classnames';

import dateAddDays from 'date-fns/add_days';
import dateClosestIndexTo from 'date-fns/closest_index_to';
import dateIsAfter from 'date-fns/is_after';
import startOfDay from 'date-fns/start_of_day';
import distanceInWords from 'date-fns/distance_in_words';

import _round from 'lodash/round';

import Loader from './Loader';

function Statistic({ label, latestEntry, firstEntry }) {
	const value = firstEntry ? _round(latestEntry - firstEntry, 2) : latestEntry;
	const displayValue = firstEntry && value > 0 ? `+${value}` : value;
	const percentage = firstEntry ? _round(value / firstEntry * 100, 2) : null;

	const valueClasses = classnames('title is-4 is-marginless', {
		'has-text-success': firstEntry && value < 0
	});
	const tagClasses = classnames('tag is-rounded', {
		'is-success': firstEntry && value < 0
	});

	return value ? (
		<div className="column has-text-centered">
			<div className="heading has-text-grey-light">{label}</div>
			<div className={valueClasses}>{displayValue}</div>
			{percentage && <div className={tagClasses}>{percentage}%</div>}
		</div>
	) : null;
}

function StatisticsRange({ entries, days }) {
	const today = new Date();
	const beginningOfTimeframe = startOfDay(dateAddDays(today, -days));
	const latestEntry = entries[0];
	const entriesInTimeframe = entries.filter(e =>
		dateIsAfter(e.timestamp, beginningOfTimeframe)
	);
	const index = dateClosestIndexTo(
		beginningOfTimeframe,
		entriesInTimeframe.map(e => e.timestamp)
	);
	const firstEntry = entries[index];

	return (
		<div className="box">
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
	);
}

function Statistics({ entries }) {
	const firstDate = entries[entries.length - 1].timestamp;
	const now = new Date();
	return (
		<div>
			<h3 className="title is-4">Past Week</h3>
			<StatisticsRange entries={entries} days={7} />
			<h3 className="title is-4">Past Month</h3>
			<StatisticsRange entries={entries} days={30} />
			<h3 className="title is-4">
				All Time ({distanceInWords(now, firstDate)})
			</h3>
			<StatisticsRange entries={entries} days={30000} />
		</div>
	);
}

export default class Stats extends Component {
	state = {
		entries: 'loading'
	};
	async componentDidMount() {
		await new Promise((resolve, reject) => {
			firebase.auth().onAuthStateChanged(({ uid }) => {
				if (uid) {
					resolve();
				}
			});
		});
		this.loadEntries();
	}
	render() {
		const { entries } = this.state;
		return entries == 'loading' ? (
			<Loader />
		) : (
			<section className="section">
				<style>
					{`.container > div > .title {
						margin-bottom: 0.5rem;
					}`}
				</style>
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
	loadEntries = async () => {
		const { uid } = firebase.auth().currentUser;
		const querySnapshot = await firebase
			.firestore()
			.collection(`users/${uid}/entries`)
			.orderBy('timestamp', 'desc')
			.get();

		const entries = querySnapshot.docs.map(d =>
			Object.assign(d.data(), { id: d.id })
		);

		this.setState({ entries });
	};
}
