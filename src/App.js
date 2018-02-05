import React, { Component } from 'react';
import './App.css';

// import BodyTracker from './components/BodyTracker';
import Progress from './components/Progress';

class App extends Component {
	render() {
		return (
			<div className="App">
				<div className="navbar">
					<div className="navbar-brand">
						<div className="navbar-item">Entry</div>
						<div className="navbar-item">Progress</div>
						<div className="navbar-item">History</div>
					</div>
				</div>
				{/* <BodyTracker /> */}
				<Progress />
			</div>
		);
	}
}

export default App;
