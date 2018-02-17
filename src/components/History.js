import React, { Component } from 'react';
import Infinite from 'react-infinite';
import firebase from 'firebase/app';

function EntryListItem({ id, timestamp, weight, waist, chest, hips, bf }) {
	return (
		<div className="box" key={id}>
			<div>Date: {timestamp.toDateString()}</div>
			<div>Weight: {weight}</div>
			<div>Waist: {waist}</div>
			<div>Chest: {chest}</div>
			<div>Hips: {hips}</div>
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
							useWindowAsScrollContainer={true}
							elementHeight={136}
						>
							{entrylistItems}
						</Infinite>
						{entries.length < 1 && (
							<div className="box">
								No entries yet. Add one to get started.
							</div>
						)}
					</div>
				</section>
			)
		);
	}
	// Need to add paging, seems like there's a bug in firestore for paging on a timestamp
	loadEntries = async () => {
		const { uid } = firebase.auth().currentUser;

		const querySnapshot = await firebase
			.firestore()
			.collection(`users/${uid}/entries`)
			.orderBy('timestamp', 'desc')
			.get()
			.catch(err => console.error(err));

		const entries = querySnapshot.docs.map(d =>
			Object.assign(d.data(), { id: d.id })
		);
		this.lastEntry = querySnapshot.docs[querySnapshot.docs.length - 1];
		this.setState({ entries });
	};
}
