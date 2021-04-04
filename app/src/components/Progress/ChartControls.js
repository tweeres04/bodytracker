import React, { Component, Fragment } from 'react';
import Flatpickr from 'react-flatpickr';

const datepickerCommonProps = {
	className: 'input',
	options: {
		maxDate: 'today'
	}
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

export default class ChartControls extends Component {
	state = {
		start: null,
		end: null
	};
	componentDidMount() {
		const { onDateRangeChange } = this.props;
		const { start, end } =
			JSON.parse(localStorage.getItem('chartControlsState')) || {};

		const newState = {
			start: start && new Date(start),
			end: end && new Date(end)
		};
		this.setState(newState);
		onDateRangeChange(newState);
	}
	componentDidUpdate() {
		const { start, end } = this.state;
		localStorage.setItem('chartControlsState', JSON.stringify({ start, end }));
	}
	render() {
		const { start, end } = this.state;
		return (
			<Fragment>
				<div className="field is-grouped is-hidden-mobile">
					<StartDatepicker onDateChange={this.onDateChange} start={start} />
					<EndDatepicker onDateChange={this.onDateChange} end={end} />
					<ResetButton
						start={start}
						end={end}
						resetDateRange={this.resetDateRange}
					/>
				</div>
				<div className="is-hidden-tablet">
					<div className="columns">
						<div className="column">
							<div className="field">
								<StartDatepicker
									onDateChange={this.onDateChange}
									start={start}
									mobile={true}
								/>
							</div>
							<div className="field">
								<EndDatepicker
									onDateChange={this.onDateChange}
									end={end}
									mobile={true}
								/>
							</div>
							<div className="field">
								<ResetButton
									start={start}
									end={end}
									resetDateRange={this.resetDateRange}
								/>
							</div>
						</div>
					</div>
				</div>
			</Fragment>
		);
	}
	onDateChange = (value, field) => {
		const { onDateRangeChange } = this.props;
		const statePatch = { [field]: value };
		this.setState(statePatch);
		onDateRangeChange(statePatch);
	};
	resetDateRange = () => {
		const { onDateRangeChange } = this.props;
		const statePatch = { start: null, end: null };
		this.setState(statePatch);
		onDateRangeChange(statePatch);
	};
}
