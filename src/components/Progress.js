import React, { Component } from 'react';
import Chartjs from 'chart.js';
import firebase from 'firebase/app';

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

class Chart extends Component {
	state = {
		loading: true
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
		const times = entries.map(e => e.timestamp);
		const weight = entries.map(e => e.weight);
		const waist = entries.map(e => e.waist);
		const bf = entries.map(e => e.bf);
		this.element &&
			new Chartjs(this.element, {
				type: 'line',
				data: {
					labels: times,
					datasets: [
						{
							label: 'Weight',
							data: weight,
							borderColor: colours[0],
							backgroundColor: backgroundColours[0],
							yAxisID: 'weight-axis'
						},
						{
							label: 'Waist',
							data: waist,
							borderColor: colours[1],
							backgroundColor: backgroundColours[1],
							yAxisID: 'waist-bf-axis'
						},
						{
							label: 'Bodyfat %',
							data: bf,
							borderColor: colours[2],
							backgroundColor: backgroundColours[2],
							yAxisID: 'waist-bf-axis'
						}
					]
				},
				options: {
					scales: {
						xAxes: [
							{
								type: 'time'
							}
						],
						yAxes: [
							{
								id: 'weight-axis'
							},
							{
								id: 'waist-bf-axis',
								position: 'right'
							}
						]
					}
				}
			});
	}
	render() {
		return (
			<canvas
				ref={e => {
					this.element = e;
				}}
			/>
		);
	}
}

export default function Progress() {
	return (
		<section className="section">
			<div className="container">
				<div className="columns">
					<div className="column">
						<h1 className="title">Progress</h1>
						<Chart />
					</div>
				</div>
			</div>
		</section>
	);
}
