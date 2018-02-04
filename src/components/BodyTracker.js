import React, { Component } from 'react';

import firebase from 'firebase/app';

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

export default class BodyTracker extends Component {
	state = {
		user: null,
		entry: {
			weight: '',
			waist: '',
			bf: ''
		}
	};
	componentDidMount() {
		firebase.auth().onAuthStateChanged(user => {
			this.setState({ user });
		});
	}
	render() {
		const { user, entry: { weight, waist, bf } } = this.state;
		return (
			user && (
				<section className="section">
					<div className="container">
						<div className="columns">
							<div className="column">
								<h1 className="title">Body Tracker</h1>
								<div className="field">
									<label htmlFor="" className="label">
										Weight
									</label>
									<div className="control">
										<input
											type="number"
											className="input"
											name="weight"
											placeholder="Your current weight"
											value={weight}
											onChange={this.handleInputChange}
										/>
									</div>
								</div>
								<div className="field">
									<label htmlFor="" className="label">
										Waist
									</label>
									<div className="control">
										<input
											type="number"
											className="input"
											name="waist"
											placeholder="Your waist circumference"
											value={waist}
											onChange={this.handleInputChange}
										/>
									</div>
								</div>
								<div className="field">
									<label htmlFor="" className="label">
										Bodyfat percentage
									</label>
									<div className="control">
										<input
											type="number"
											className="input"
											name="bf"
											placeholder="Your bodyfat percentage"
											value={bf}
											onChange={this.handleInputChange}
										/>
									</div>
								</div>
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
				</section>
			)
		);
	}
	handleInputChange = ({ target: { name, value } }) => {
		if (['weight', 'waist', 'bf'].some(f => f == name)) {
			value = value == '' ? value : _toNumber(value);
		}
		this.setState({ [name]: value });
	};
	handleSubmit = async () => {
		const entry = entryData(this.state.entry);
		if (entry) {
			const { uid } = firebase.auth().currentUser;
			await firebase
				.firestore()
				.collection('users')
				.doc(uid)
				.collection('entries')
				.add(entry)
				.catch(err => {
					console.error(err);
				});
			console.log('Added ', entry);
		}
	};
}
