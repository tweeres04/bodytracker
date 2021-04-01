import React, { Component } from 'react';
import update from 'immutability-helper';
import classnames from 'classnames';
import firebase from 'firebase/app';
import _findIndex from 'lodash/fp/findIndex';
import _orderBy from 'lodash/fp/orderBy';
import reverse from 'lodash/reverse';
import dateFormat from 'date-fns/format';
import Loader from './Loader';

import differenceInCalendarWeeks from 'date-fns/differenceInCalendarWeeks';
import getDay from 'date-fns/getDay';

function UndoDeleteAlert({ undoDelete }) {
	return (
		<div
			className="notification is-info"
			style={{
				position: 'fixed',
				bottom: 0,
				left: 0,
				width: '100%',
				zIndex: 1,
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

function Stat({ value, label, ...props }) {
	return value ? (
		<div {...props}>
			<div className="has-text-grey-light is-uppercase has-text-8">{label}</div>
			<div>{value}</div>
		</div>
	) : null;
}

function Modal({ entry, closeModal, removeEntry }) {
	return (
		<div className="modal is-active px-2">
			<div className="modal-background" onClick={closeModal}></div>
			<div className="modal-card">
				<header className="modal-card-head">
					<p className="modal-card-title">
						{dateFormat(entry.timestamp.toDate(), 'MMM d Y h:mm a')}
					</p>
					<button
						className="delete"
						aria-label="close"
						onClick={closeModal}
					></button>
				</header>
				<section className="modal-card-body is-flex">
					<Stat
						label="Weight"
						value={entry.weight}
						className="is-flex-grow-1"
					/>
					<Stat label="Waist" value={entry.waist} className="is-flex-grow-1" />
					<Stat label="Chest" value={entry.chest} className="is-flex-grow-1" />
					<Stat label="Hips" value={entry.hips} className="is-flex-grow-1" />
					<Stat label="Bodyfat" value={entry.bf} className="is-flex-grow-1" />
				</section>
				<footer className="modal-card-foot">
					<button
						className="button is-danger"
						onClick={() => {
							closeModal();
							removeEntry();
						}}
					>
						Remove entry
					</button>
					<button className="button" onClick={closeModal}>
						Cancel
					</button>
				</footer>
			</div>
		</div>
	);
}

let deletedEntry, timeoutHandle;

export default class History extends Component {
	state = {
		entries: null,
		undoDeleteAlert: false,
		showModal: null,
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
		const { entries, undoDeleteAlert, showModal } = this.state;
		const entryTable = entries
			? entries.reduce((result, entry) => {
					const timestampDate = entry.timestamp.toDate();
					const week = differenceInCalendarWeeks(
						timestampDate,
						entries[entries.length - 1].timestamp.toDate()
					);
					const day = getDay(timestampDate);

					if (!result[week]) {
						result[week] = Array.from({ length: 7 }).map((_) => []);
					}

					result[week][day] = [...result[week][day], entry];
					return result;
			  }, [])
			: [];

		return (
			<div className="container px-2">
				<h1 className="title">
					History {entries && <span className="tag">{entries.length}</span>}
				</h1>
				{entries ? (
					<table className="table is-narrow is-bordered is-size-7">
						<thead>
							<tr>
								<th>Sun</th>
								<th>Mon</th>
								<th>Tues</th>
								<th>Wed</th>
								<th>Thu</th>
								<th>Fri</th>
								<th>Sat</th>
							</tr>
						</thead>
						<tbody>
							{reverse(entryTable).map((week, i) => (
								<tr key={i}>
									{week.map((day, i) => (
										<td
											key={i}
											className={classnames('has-text-centered', {
												'has-background-info-light': !day,
											})}
										>
											{day
												? day.map(
														({
															timestamp,
															weight,
															waist,
															chest,
															hips,
															bf,
															id,
														}) => (
															<div
																key={timestamp}
																onClick={() => this.showModal(id)}
															>
																<div>
																	{dateFormat(
																		timestamp.toDate(),
																		'MMM d Y h:mm a'
																	)}
																</div>
																<Stat label="Weight" value={weight} />
																<Stat label="Waist" value={waist} />
																<Stat label="Chest" value={chest} />
																<Stat label="Hips" value={hips} />
																<Stat label="Bodyfat" value={bf} />
															</div>
														)
												  )
												: null}
										</td>
									))}
								</tr>
							))}
						</tbody>
					</table>
				) : (
					<Loader />
				)}
				{entries && entries.length < 1 && (
					<div className="box">No entries yet. Add one to get started.</div>
				)}
				{undoDeleteAlert && <UndoDeleteAlert undoDelete={this.undo} />}
				{showModal && (
					<Modal
						entry={entries.find((e) => e.id === showModal)}
						closeModal={() => this.showModal(null)}
						removeEntry={() => this.removeEntry(showModal)}
					/>
				)}
			</div>
		);
	}
	showModal = (id) => {
		this.setState({ showModal: id });
	};
	// Need to add paging, seems like there's a bug in firestore for paging on a timestamp
	loadEntries = async () => {
		const { uid } = firebase.auth().currentUser;

		const querySnapshot = await firebase
			.firestore()
			.collection(`users/${uid}/entries`)
			.orderBy('timestamp', 'desc')
			.get()
			.catch((err) => console.error(err));

		const entries = querySnapshot.docs.map((d) =>
			Object.assign(d.data(), { id: d.id })
		);
		this.setState({ entries });
	};
	removeEntry = async (entryId) => {
		const { entries } = this.state;
		const index = _findIndex((e) => e.id == entryId)(entries);
		deletedEntry = entries[index];
		this.setState((prevState) =>
			update(prevState, {
				entries: { $splice: [[index, 1]] },
				undoDeleteAlert: { $set: true },
			})
		);
		const { uid } = firebase.auth().currentUser;
		timeoutHandle = setTimeout(() => {
			this.setState({ undoDeleteAlert: false });
		}, 7000);
		await firebase.firestore().doc(`users/${uid}/entries/${entryId}`).delete();
	};
	undo = async () => {
		const { uid } = firebase.auth().currentUser;
		const { id: newId } = await firebase
			.firestore()
			.collection(`users/${uid}/entries`)
			.add(deletedEntry);

		this.setState((prevState) => {
			const statePatch = update(prevState, {
				entries: {
					$push: [Object.assign(deletedEntry, { id: newId })],
				},
				undoDeleteAlert: { $set: false },
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
