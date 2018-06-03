import React, { Component, Fragment } from 'react';
import Flatpickr from 'react-flatpickr';

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
					<div className="control">
						<Flatpickr
							className="input"
							placeholder="Start date"
							value={start}
							onChange={([start]) => {
								this.onDateChange(start, 'start');
							}}
							options={{
								maxDate: 'today'
							}}
						/>
					</div>
					<div className="control">
						<Flatpickr
							className="input"
							placeholder="End date"
							value={end}
							onChange={([end]) => {
								this.onDateChange(end, 'end');
							}}
							options={{
								maxDate: 'today'
							}}
						/>
					</div>
					<div className="control">
						<button
							className="button"
							onClick={this.resetDateRange}
							disabled={!start && !end}
						>
							Reset
						</button>
					</div>
				</div>
				<div className="is-hidden-tablet">
					<div className="field">
						<div className="control">
							<Flatpickr
								className="input"
								placeholder="Start date"
								value={start}
								onChange={([start]) => {
									this.onDateChange(start, 'start');
								}}
								options={{
									maxDate: 'today'
								}}
							/>
						</div>
					</div>
					<div className="field">
						<div className="control">
							<Flatpickr
								className="input"
								placeholder="End date"
								value={end}
								onChange={([end]) => {
									this.onDateChange(end, 'end');
								}}
								options={{
									maxDate: 'today'
								}}
							/>
						</div>
					</div>
					<div className="field">
						<div className="control">
							<button
								className="button"
								onClick={this.resetDateRange}
								disabled={!start && !end}
							>
								Reset
							</button>
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
