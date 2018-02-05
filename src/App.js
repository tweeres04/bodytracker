import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';

import './App.css';

import BodyTracker from './components/BodyTracker';
import Progress from './components/Progress';
import History from './components/History';

class App extends Component {
	render() {
		return (
			<Router>
				<div className="App">
					<div className="navbar">
						<div className="navbar-brand">
							<Link to="/" className="navbar-item">
								Entry
							</Link>
							<Link to="/progress" className="navbar-item">
								Progress
							</Link>
							<Link to="/history" className="navbar-item">
								History
							</Link>
						</div>
					</div>
					<Route exact path="/" component={BodyTracker} />
					<Route path="/progress" component={Progress} />
					<Route path="/history" component={History} />
				</div>
			</Router>
		);
	}
}

export default App;
