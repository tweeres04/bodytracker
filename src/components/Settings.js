import React, { Component } from 'react';
import firebase from 'firebase';

import 'react-toggle/style.css';
import Toggle from 'react-toggle';

// Might want to stick this in an env var
const availableMeasurements = {
	weight: {
		label: 'Weight'
	},
	waist: {
		label: 'Waist'
	},
	chest: {
		label: 'Chest'
	},
	hips: {
		label: 'Hips'
	},
	bf: {
		label: 'Bodyfat Percentage'
	}
};

function defaultState() {
	return Object.keys(availableMeasurements).reduce(
		(result, measurement) => ({
			[measurement]: true,
			...result
		}),
		{}
	);
}

export default class Settings extends Component {
	state = defaultState();
	componentDidMount(){
		const settingsSnapshot = await firebase.firestore().collection(`users/${uid}/settings`).get();
	}
	render() {
		return (
			<div className="section">
				<div className="container">
					<h1 className="title">Settings</h1>
					<h2 className="title is-4">Your Measurements</h2>
					{Object.keys(availableMeasurements).map(id => (
						<label className="label" key={id}>
							<div className="level is-mobile">
								<div className="level-left">
									<span>{availableMeasurements[id].label}</span>
								</div>
								<div className="level-right">
									<Toggle />
								</div>
							</div>
						</label>
					))}
				</div>
			</div>
		);
	}
}
