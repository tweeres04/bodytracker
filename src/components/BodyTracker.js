import React, { useState, useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from 'react-query';

import 'flatpickr/dist/themes/material_green.css';

import firebase from 'firebase/app';
import update from 'immutability-helper';
import classnames from 'classnames';
import Flatpickr from 'react-flatpickr';

import _pickBy from 'lodash/fp/pickBy';
import _toNumber from 'lodash/fp/toNumber';
import _isEmpty from 'lodash/fp/isEmpty';

function entryData(entry) {
	let result = _pickBy((f) => f != '')(entry);
	if (_isEmpty(result)) {
		return null;
	}
	return result;
}

function entryFormFactory() {
	return {
		timestamp: new Date(),
		weight: '',
		waist: '',
		chest: '',
		hips: '',
		bf: '',
	};
}

function EntrySuccessNotification({ active }) {
	return (
		active && (
			<div
				style={{
					position: 'fixed',
					left: 0,
					bottom: 0,
					width: '100%',
					zIndex: 1,
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

function BodyTrackerDateField({
	label,
	name,
	value,
	handleChange,
	placeholder,
}) {
	return (
		<div className="field">
			<label htmlFor="" className="label">
				{label}
			</label>
			<div className="control">
				<Flatpickr
					className="input"
					name={name}
					placeholder={placeholder}
					value={value}
					onChange={handleChange}
					options={{
						enableTime: true,
						altInput: true,
						altFormat: 'M j, Y - h:i K',
					}}
				/>
			</div>
		</div>
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

export default function BodyTracker() {
	const [entry, setEntry] = useState(entryFormFactory());
	const [successNotification, setSuccessNotification] = useState(false);
	const timeoutHandle = useRef(null);
	const queryClient = useQueryClient();

	const { timestamp, weight, waist, chest, hips, bf } = entry;

	useEffect(() => {
		document.addEventListener('visibilitychange', () => {
			if (!document.hidden) {
				setEntry((entry) =>
					update(entry, {
						timestamp: { $set: new Date() },
					})
				);
			}
		});
	}, []);

	useEffect(() => {
		return () => {
			clearTimeout(timeoutHandle.current);
		};
	}, []);

	function handleInputChange({ target: { name, value } }) {
		value = value == '' ? value : _toNumber(value);
		setEntry((entry) =>
			update(entry, {
				[name]: { $set: value },
			})
		);
	}

	const { mutate: handleSubmit, isLoading: isSubmitting } = useMutation(
		async function handleSubmit() {
			const entryToSave = entryData(entry);
			if (entryToSave) {
				const { uid } = firebase.auth().currentUser;
				const docRef = await firebase
					.firestore()
					.collection('users')
					.doc(uid)
					.collection('entries')
					.add(entryToSave)
					.catch((err) => {
						console.error(err);
					});
				setEntry(entryFormFactory());
				setSuccessNotification(true);

				timeoutHandle.current = setTimeout(() => {
					setSuccessNotification(false);
				}, 3000);

				return {
					...entryToSave,
					timestamp: firebase.firestore.Timestamp.fromDate(
						entryToSave.timestamp
					),
					id: docRef.id,
				};
			}
		},
		{
			onSuccess: (newDoc) => {
				queryClient.setQueryData('entries', (entries) => [newDoc, ...entries]);
			},
		}
	);

	const submitButtonClasses = classnames(
		'button is-large is-fullwidth is-primary',
		{
			'is-loading': isSubmitting,
		}
	);

	return (
		<section className="section">
			<div className="container">
				<div className="columns">
					<div className="column">
						<h1 className="title">Bodytracker</h1>
						<BodyTrackerDateField
							label="Date and Time"
							name="timestamp"
							value={timestamp}
							handleChange={(dates) => {
								setEntry((entry) =>
									update(entry, {
										timestamp: { $set: dates[0] },
									})
								);
							}}
							placeholder="Date and time of entry"
						/>
						<BodyTrackerField
							label="Weight"
							name="weight"
							value={weight}
							handleChange={handleInputChange}
							placeholder="Your current weight"
						/>
						<BodyTrackerField
							label="Waist"
							name="waist"
							value={waist}
							handleChange={handleInputChange}
							placeholder="Your current waist measurement"
						/>
						<BodyTrackerField
							label="Chest"
							name="chest"
							value={chest}
							handleChange={handleInputChange}
							placeholder="Your current chest measurement"
						/>
						<BodyTrackerField
							label="Hips"
							name="hips"
							value={hips}
							handleChange={handleInputChange}
							placeholder="Your current hips measurement"
						/>
						<BodyTrackerField
							label="Bodyfat Percentage"
							name="bf"
							value={bf}
							handleChange={handleInputChange}
							placeholder="Your current bodyfat percentage"
						/>
					</div>
				</div>
				<div className="columns">
					<div className="column">
						<button
							disabled={isSubmitting}
							className={submitButtonClasses}
							onClick={handleSubmit}
						>
							Submit
						</button>
					</div>
				</div>
			</div>
			<EntrySuccessNotification active={successNotification} />
		</section>
	);
}
