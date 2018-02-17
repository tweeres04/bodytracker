import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import Loadable from 'react-loadable';
import Loader from './components/Loader';

import BodyTracker from './components/BodyTracker';

import './App.css';

const Progress = Loadable({
	loader: () => import('./components/Progress'),
	loading: Loader
});

const History = Loadable({
	loader: () => import('./components/History'),
	loading: Loader
});

class App extends Component {
	componentDidMount() {
		Progress.preload();
		History.preload();
	}
	render() {
		return (
			<Router>
				<div className="App">
					<div className="navbar">
						<div className="navbar-brand">
							<Link to="/" className="navbar-item">
								Body Tracker
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
					<footer className="footer">
						<div className="container">
							<div className="content has-text-centered">
								<p>&copy; 2018 Tweeres Software</p>
								<p>
									Icon made by{' '}
									<a
										href="http://www.freepik.com"
										title="Freepik"
									>
										Freepik
									</a>{' '}
									from{' '}
									<a
										href="https://www.flaticon.com/"
										title="Flaticon"
									>
										flaticon.com
									</a>
								</p>
							</div>
						</div>
					</footer>
				</div>
			</Router>
		);
	}
}

export default App;
