import React, { Component } from 'react';
import firebase from 'firebase/app';

import isWithinRange from 'date-fns/is_within_range';

import Loader from '../Loader';
import ChartControls from './ChartControls';
import Chart from './Chart';

const colours = [
	'rgb(50,115,220)',
	'rgb(255,56,96)',
	'rgb(255,221,87)',
	'rgb(35,209,96)'
];

const backgroundColours = [
	'rgba(50,115,220, 0.2)',
	'rgba(255,56,96, 0.2)',
	'rgba(255,221,87, 0.2)',
	'rgba(35,209,96, 0.2)'
];

const minDate = new Date(1900, 0);

export default class Progress extends Component {
	state = {
		loading: true,
		entries: [],
		start: null,
		end: null
	};
	async componentDidMount() {
		const userPromise = new Promise((resolve, reject) => {
			firebase.auth().onAuthStateChanged(user => {
				if (user) {
					resolve(user);
				}
			});
		});
		const { uid } = await userPromise;
		const querySnapshot = await firebase
			.firestore()
			.collection(`users/${uid}/entries`)
			.orderBy('timestamp')
			.get();
		const entries = querySnapshot.docs.map(ds => ds.data());
		this.setState({ entries, loading: false });
	}
	render() {
		const { loading, start, end } = this.state;
		let { entries } = this.state;

		entries =
			start || end
				? entries.filter(e =>
						isWithinRange(e.timestamp, start || minDate, end || new Date())
				  )
				: entries;

		const times = entries.map(e => e.timestamp);
		const weight = entries.map(e => e.weight);
		const waist = entries.map(e => e.waist);
		const chest = entries.map(e => e.chest);
		const hips = entries.map(e => e.hips);
		const bf = entries.map(e => e.bf);

		const datasets = [
			{
				label: 'Weight',
				data: weight,
				borderColor: colours[0],
				backgroundColor: backgroundColours[0],
				yAxisID: 'weight-axis',
				lineTension: 0,
				spanGaps: true
			},
			{
				label: 'Waist',
				data: waist,
				borderColor: colours[1],
				backgroundColor: backgroundColours[1],
				yAxisID: 'other-axis',
				lineTension: 0,
				spanGaps: true
			},
			{
				label: 'Chest',
				data: chest,
				borderColor: colours[2],
				backgroundColor: backgroundColours[2],
				yAxisID: 'other-axis',
				lineTension: 0,
				spanGaps: true
			},
			{
				label: 'Hips',
				data: hips,
				borderColor: colours[3],
				backgroundColor: backgroundColours[3],
				yAxisID: 'other-axis',
				lineTension: 0,
				spanGaps: true
			},
			{
				label: 'Bodyfat %',
				data: bf,
				borderColor: colours[0],
				backgroundColor: backgroundColours[0],
				yAxisID: 'other-axis',
				lineTension: 0,
				spanGaps: true
			}
		];

		const yAxes = {
			weightAxis: {
				id: 'weight-axis'
			},
			otherAxis: {
				id: 'other-axis'
			}
		};

		return loading ? (
			<Loader />
		) : (
			<section className="section">
				<div className="container">
					<h1 className="title">Progress</h1>
					<ChartControls onDateRangeChange={this.onDateRangeChange} />
					<div className="columns" key="all">
						<div className="column">
							<Chart
								times={times}
								datasets={datasets}
								yAxes={[yAxes.weightAxis, yAxes.otherAxis]}
							/>
						</div>
					</div>
					{datasets.map(d => (
						<div className="columns" key={d.label}>
							<div className="column">
								<h2 className="title is-5">{d.label}</h2>
								<Chart
									times={times}
									datasets={[d]}
									yAxes={[
										d.label == 'Weight' ? yAxes.weightAxis : yAxes.otherAxis
									]}
								/>
							</div>
						</div>
					))}
				</div>
			</section>
		);
	}
	onDateRangeChange = statePatch => {
		this.setState(statePatch);
	};
}
