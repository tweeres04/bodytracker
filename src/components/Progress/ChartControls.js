import React, { Component, Fragment } from 'react';
import Flatpickr from 'react-flatpickr';

const datepickerCommonProps = {
	className: 'input',
	options: {
		maxDate: 'today'
	}
};

function StartDatepicker({ start, onDateChange }) {
	return (
		<div className="control">
			<Flatpickr
				placeholder="Start date"
				value={start}
				onChange={([start]) => {
					onDateChange(start, 'start');
				}}
				{...datepickerCommonProps}
			/>
		</div>
	);
}

function EndDatepicker({ end, onDateChange }) {
	return (
		<div className="control">
			<Flatpickr
				placeholder="End date"
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
					<div className="field">
						<StartDatepicker onDateChange={this.onDateChange} start={start} />
					</div>
					<div className="field">
						<EndDatepicker onDateChange={this.onDateChange} end={end} />
					</div>
					<div className="field">
						<ResetButton
							start={start}
							end={end}
							resetDateRange={this.resetDateRange}
						/>
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
