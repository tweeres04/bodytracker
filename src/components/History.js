import React, { Component } from 'react';
import update from 'immutability-helper';
import Infinite from 'react-infinite';
import firebase from 'firebase/app';
import _findIndex from 'lodash/fp/findIndex';
import _orderBy from 'lodash/fp/orderBy';
import dateFormat from 'date-fns/format';
import Loader from './Loader';

function EntryListItem({
	id,
	timestamp,
	weight,
	waist,
	chest,
	hips,
	bf,
	remove
}) {
	timestamp = new Date(timestamp.seconds * 1000);
	return (
		<div className="box">
			<div className="level is-mobile">
				<div className="level-left">
					<div className="level-item">
						<div>
							<h1 className="title is-5 is-spaced">
								{timestamp.toDateString()}
							</h1>
							<div>{dateFormat(timestamp, 'h:mm a')}</div>
							{weight && <div>Weight: {weight}</div>}
							{waist && <div>Waist: {waist}</div>}
							{chest && <div>Chest: {chest}</div>}
							{hips && <div>Hips: {hips}</div>}
							{bf && <div>Bodyfat: {bf}</div>}
						</div>
					</div>
				</div>
				<div className="level-right">
					<div className="level-item">
						<button
							className="button is-danger is-outlined"
							onClick={() => {
								remove(id);
							}}
						>
							Remove
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

function UndoDeleteAlert({ undoDelete }) {
	return (
		<div
			className="notification is-info"
			style={{
				position: 'fixed',
				bottom: 0,
				left: 0,
				width: '100%',
				zIndex: 1
			}}
		>
			<div className="level is-mobile">
				<div className="level-left">
					<div className="level-item">
						<p>Entry removed.</p>
					</div>
				</div>
				<div className="level-right">
					<div className="level-item">
						<button onClick={undoDelete} className="button is-inverted is-info">
							Undo
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

let deletedEntry, timeoutHandle;

export default class History extends Component {
	state = {
		entries: null,
		undoDeleteAlert: false
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
		const { entries, undoDeleteAlert } = this.state;
		const entrylistItems = entries
			? entries.map(e => (
					<EntryListItem remove={this.removeEntry} key={e.id} {...e} />
			  ))
			: [];
		return (
			<section className="section">
				<div className="container">
					<h1 className="title">
						History {entries && <span className="tag">{entries.length}</span>}
					</h1>
					{entries ? (
						<Infinite useWindowAsScrollContainer={true} elementHeight={136}>
							{entrylistItems}
						</Infinite>
					) : (
						<Loader />
					)}
					{entries && entries.length < 1 && (
						<div className="box">No entries yet. Add one to get started.</div>
					)}
					{undoDeleteAlert && <UndoDeleteAlert undoDelete={this.undo} />}
				</div>
			</section>
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
	removeEntry = async entryId => {
		const { entries } = this.state;
		const index = _findIndex(e => e.id == entryId)(entries);
		deletedEntry = entries[index];
		this.setState(prevState =>
			update(prevState, {
				entries: { $splice: [[index, 1]] },
				undoDeleteAlert: { $set: true }
			})
		);
		const { uid } = firebase.auth().currentUser;
		timeoutHandle = setTimeout(() => {
			this.setState({ undoDeleteAlert: false });
		}, 7000);
		await firebase
			.firestore()
			.doc(`users/${uid}/entries/${entryId}`)
			.delete();
	};
	undo = async () => {
		const { uid } = firebase.auth().currentUser;
		const { id: newId } = await firebase
			.firestore()
			.collection(`users/${uid}/entries`)
			.add(deletedEntry);

		this.setState(prevState => {
			const statePatch = update(prevState, {
				entries: {
					$push: [Object.assign(deletedEntry, { id: newId })]
				},
				undoDeleteAlert: { $set: false }
			});

			statePatch.entries = _orderBy(['timestamp'])(['desc'])(
				statePatch.entries
			);

			return statePatch;
		});
		deletedEntry = null;
		clearTimeout(timeoutHandle);
	};
	componentWillUnmount = () => {
		clearTimeout(timeoutHandle);
	};
}
