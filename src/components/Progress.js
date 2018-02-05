import React, { Component } from 'react';
import Chartjs from 'chart.js';
import firebase from 'firebase/app';

const colours = [
	'hsl(217, 71%, 53%)',
	'hsl(348, 100%, 61%)',
	'hsl(48, 100%, 67%)',
	'hsl(141, 71%, 48%)'
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
			.orderBy('timestamp', 'desc')
			.get();
		const entries = querySnapshot.docs.map(ds => ds.data());
		const times = entries.map(e => e.timestamp.toDateString());
		const weight = entries.map(e => e.weight);
		const waist = entries.map(e => e.waist);
		const bf = entries.map(e => e.bf);
		new Chartjs(this.element, {
			type: 'line',
			data: {
				labels: times,
				datasets: [
					{
						label: 'Weight',
						data: weight,
						borderColor: colours[0],
						backgroundColor: 'rgba(0,0,0,0)'
					},
					{
						label: 'Waist',
						data: waist,
						borderColor: colours[1],
						backgroundColor: 'rgba(0,0,0,0)'
					},
					{
						label: 'Bodyfat %',
						data: bf,
						borderColor: colours[2],
						backgroundColor: 'rgba(0,0,0,0)'
					}
				]
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
