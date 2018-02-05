import React, { Component } from 'react';
import Infinite from 'react-infinite';
import firebase from 'firebase/app';

function EntryListItem({ id, timestamp, weight, waist, bf }) {
	return (
		<div className="box" key={id}>
			<div>Date: {timestamp.toDateString()}</div>
			<div>Weight: {weight}</div>
			<div>Waist: {waist}</div>
			<div>Bodyfat: {bf}</div>
		</div>
	);
}

export default class History extends Component {
	state = {
		entries: null
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
		const entrylistItems = entries ? entries.map(EntryListItem) : [];
		return (
			entries && (
				<section className="section">
					<div className="container">
						<Infinite
							onInfiniteLoad={this.loadEntries}
							useWindowAsScrollContainer={true}
							elementHeight={300}
						>
							{entrylistItems}
						</Infinite>
					</div>
				</section>
			)
		);
	}
	loadEntries = async () => {
		const { entries } = this.state;
		const { uid } = firebase.auth().currentUser;

		const query = firebase
			.firestore()
			.collection(`users/${uid}/entries`)
			.orderBy('timestamp', 'desc');
		if (entries) {
			query.startAfter(entries[entries.length - 1]);
		}
		const querySnapshot = await query
			.get()
			.catch(err => console.error(err));

		const newEntries = querySnapshot.docs.map(d =>
			Object.assign(d.data(), { id: d.id })
		);
		this.setState(({ entries }) => ({
			entries: (entries || []).concat(newEntries)
		}));
	};
}
