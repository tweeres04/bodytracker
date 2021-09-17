import React, { Fragment } from 'react';
import Flatpickr from 'react-flatpickr';

const datepickerCommonProps = {
	className: 'input',
	options: {
		maxDate: 'today',
	},
};

function MobileLabel({ label }) {
	return <label className="label">{label}</label>;
}

function StartDatepicker({ start, onDateChange, mobile }) {
	const label = 'Start date';
	return (
		<div className="control">
			{mobile && <MobileLabel label={label} />}
			<Flatpickr
				placeholder={label}
				value={start}
				onChange={([start]) => {
					onDateChange(start, 'start');
				}}
				{...datepickerCommonProps}
			/>
		</div>
	);
}

function EndDatepicker({ end, onDateChange, mobile }) {
	const label = 'End date';
	return (
		<div className="control">
			{mobile && <MobileLabel label={label} />}
			<Flatpickr
				placeholder={label}
				value={end}
				onChange={([end]) => {
					onDateChange(end, 'end');
				}}
				{...datepickerCommonProps}
			/>
		</div>
	);
}

function ResetButton({ start, end, resetDateRange }) {
	return (
		<div className="control">
			<button
				className="button"
				onClick={resetDateRange}
				disabled={!start && !end}
			>
				Reset
			</button>
		</div>
	);
}

export default function ChartControls({
	setDateRange,
	start,
	end,
	resetDateRange,
}) {
	function handleDateChange(value, field) {
		setDateRange((prevDateRange) => ({
			...prevDateRange,
			[field]: value,
		}));
	}

	return (
		<Fragment>
			<div className="field is-grouped is-hidden-mobile">
				<StartDatepicker onDateChange={handleDateChange} start={start} />
				<EndDatepicker onDateChange={handleDateChange} end={end} />
				<ResetButton start={start} end={end} resetDateRange={resetDateRange} />
			</div>
			<div className="is-hidden-tablet">
				<div className="columns">
					<div className="column">
						<div className="field">
							<StartDatepicker
								onDateChange={handleDateChange}
								start={start}
								mobile={true}
							/>
						</div>
						<div className="field">
							<EndDatepicker
								onDateChange={handleDateChange}
								end={end}
								mobile={true}
							/>
						</div>
						<div className="field">
							<ResetButton
								start={start}
								end={end}
								resetDateRange={resetDateRange}
							/>
						</div>
					</div>
				</div>
			</div>
		</Fragment>
	);
}
