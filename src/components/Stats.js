import React, { Component } from 'react';
import firebase from 'firebase';

import dateAddDays from 'date-fns/add_days';
import dateClosestIndexTo from 'date-fns/closest_index_to';
import dateIsAfter from 'date-fns/is_after';
import startOfDay from 'date-fns/start_of_day';

import _round from 'lodash/round';

import Loader from './Loader';

function Statistic({ label, value, prefix = true }) {
	const displayValue = prefix && value > 0 ? `+${value}` : value;
	return value ? (
		<div className="column has-text-centered">
			<div className="heading">{label}</div>
			<div className="title is-4">{displayValue}</div>
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
		<div className="columns is-mobile">
			<Statistic
				label="Entries"
				value={entriesInTimeframe.length}
				prefix={false}
			/>
			<Statistic
				label="Weight"
				value={_round(latestEntry.weight - firstEntry.weight, 2)}
			/>
			<Statistic
				label="Waist"
				value={_round(latestEntry.waist - firstEntry.waist, 2)}
			/>
			<Statistic
				label="Chest"
				value={_round(latestEntry.chest - firstEntry.chest, 2)}
			/>
			<Statistic
				label="Hips"
				value={_round(latestEntry.hips - firstEntry.hips, 2)}
			/>
			<Statistic
				label="Bodyfat Percentage"
				value={_round(latestEntry.bf - firstEntry.bf, 2)}
			/>
		</div>
	);
}

function Statistics({ entries }) {
	return (
		<div>
			<h3 className="title is-4">Past Week</h3>
			<StatisticsRange entries={entries} days={7} />
			<h3 className="title is-4">Past Month</h3>
			<StatisticsRange entries={entries} days={30} />
			<h3 className="title is-4">All Time</h3>
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
				<div className="container">
					<h1 className="title">Stats</h1>
					{entries && entries.length < 1 ? (
						<div className="box">
							No entries yet. Add one to get started.
						</div>
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
