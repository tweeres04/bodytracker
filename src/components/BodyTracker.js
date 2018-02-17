import React, { Component } from 'react';

import firebase from 'firebase/app';
import update from 'immutability-helper';

import _pickBy from 'lodash/fp/pickBy';
import _toNumber from 'lodash/fp/toNumber';
import _isEmpty from 'lodash/fp/isEmpty';

function entryData(entry) {
	let result = _pickBy(f => f != '')(entry);
	if (_isEmpty(result)) {
		return null;
	}
	result = Object.assign({}, result, {
		timestamp: firebase.firestore.FieldValue.serverTimestamp()
	});
	return result;
}

function entryFormFactory() {
	return {
		weight: '',
		waist: '',
		chest: '',
		hips: '',
		bf: ''
	};
}

function EntrySuccessNotification({ active }) {
	return (
		active && (
			<div
				style={{
					position: 'absolute',
					left: 0,
					bottom: 0,
					width: '100%'
				}}
			>
				<div className="container">
					<div className="notification is-success has-text-centered">
						New entry added
					</div>
				</div>
			</div>
		)
	);
}

function BodyTrackerField({ label, name, value, handleChange, placeholder }) {
	return (
		<div className="field">
			<label htmlFor="" className="label">
				{label}
			</label>
			<div className="control">
				<input
					type="number"
					className="input"
					name={name}
					placeholder={placeholder}
					value={value}
					onChange={handleChange}
				/>
			</div>
		</div>
	);
}

export default class BodyTracker extends Component {
	state = {
		user: null,
		entry: entryFormFactory(),
		successNotification: false
	};
	componentDidMount() {
		firebase.auth().onAuthStateChanged(user => {
			this.setState({ user });
		});
	}
	render() {
		const {
			user,
			entry: { weight, waist, chest, hips, bf },
			successNotification
		} = this.state;

		return (
			user && (
				<section className="section">
					<div className="container">
						<div className="columns">
							<div className="column">
								<h1 className="title">Body Tracker</h1>
								<BodyTrackerField
									label="Weight"
									name="weight"
									value={weight}
									handleChange={this.handleInputChange}
									placeholder="Your current weight"
								/>
								<BodyTrackerField
									label="Waist"
									name="waist"
									value={waist}
									handleChange={this.handleInputChange}
									placeholder="Your current waist measurement"
								/>
								<BodyTrackerField
									label="Chest"
									name="chest"
									value={chest}
									handleChange={this.handleInputChange}
									placeholder="Your current chest measurement"
								/>
								<BodyTrackerField
									label="Hips"
									name="hips"
									value={hips}
									handleChange={this.handleInputChange}
									placeholder="Your current hips measurement"
								/>
								<BodyTrackerField
									label="Bodyfat Percentage"
									name="bf"
									value={bf}
									handleChange={this.handleInputChange}
									placeholder="Your current bodyfat percentage"
								/>
							</div>
						</div>
						<div className="columns">
							<div className="column">
								<button
									className="button is-large is-fullwidth is-primary"
									onClick={this.handleSubmit}
								>
									Submit
								</button>
							</div>
						</div>
					</div>
					<EntrySuccessNotification active={successNotification} />
				</section>
			)
		);
	}
	handleInputChange = ({ target: { name, value } }) => {
		value = value == '' ? value : _toNumber(value);
		const statePatch = update(this.state, {
			entry: { [name]: { $set: value } }
		});
		this.setState(statePatch);
	};
	handleSubmit = async () => {
		const entry = entryData(this.state.entry);
		if (entry) {
			const { uid } = firebase.auth().currentUser;
			this.setState({ successNotification: true });
			await firebase
				.firestore()
				.collection('users')
				.doc(uid)
				.collection('entries')
				.add(entry)
				.catch(err => {
					console.error(err);
				});
			this.setState(() => ({
				entry: entryFormFactory()
			}));
			this.timeoutHandle = setTimeout(() => {
				this.setState({ successNotification: false });
			}, 3000);
		}
	};
	componentWillUnmount() {
		clearTimeout(this.timeoutHandle);
	}
}
