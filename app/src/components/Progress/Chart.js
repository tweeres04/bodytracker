import React, { Component } from 'react';

import Chartjs from 'chart.js';
import _cloneDeep from 'lodash/fp/cloneDeep';

export default class Chart extends Component {
	componentDidMount() {
		this.makeChart();
	}
	componentDidUpdate() {
		this.makeChart();
	}
	makeChart = () => {
		const { datasets, times } = this.props;
		let { yAxes } = this.props;

		yAxes = _cloneDeep(yAxes);

		if (yAxes.length > 1) {
			yAxes[1].position = 'right';
		}

		if (this.chart) {
			this.chart.destroy();
		}

		datasets.forEach((ds) => {
			ds.pointBorderColor = '#00000000';
			ds.pointBackgroundColor = '#00000000';
			ds.pointHitRadius = 50;
			ds.borderCapStyle = 'square';
			ds.spanGaps = true;

			if (!ds.label.includes('trendline') && !ds.label.includes('Average')) {
				ds.lineTension = 0;
			}
			if (ds.label.includes('trendline')) {
				ds.backgroundColor = '#00000000';
				ds.borderColor = 'rgba(100,100,100,0.2)';
			}
			if (ds.label.includes('Average')) {
				const newBorderColor = datasets[0].borderColor
					.replace('rgb', 'rgba')
					.replace(')', ',0.2)');
				ds.borderColor = newBorderColor;

				const newBackgroundColor = datasets[0].backgroundColor;
				ds.backgroundColor = newBackgroundColor;
			}
		});

		this.chart = new Chartjs(this.element, {
			type: 'line',
			data: {
				labels: times,
				datasets,
			},
			options: {
				scales: {
					xAxes: [
						{
							type: 'time',
						},
					],
					yAxes,
				},
				animation: null,
				maintainAspectRatio: false,
			},
		});
	};
	render() {
		return (
			<div
				style={{
					height: '95dvh',
				}}
			>
				<canvas
					ref={(e) => {
						this.element = e;
					}}
				/>
			</div>
		);
	}
}
