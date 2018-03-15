import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import firebase from 'firebase';
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

const Stats = Loadable({
	loader: () => import('./components/Stats'),
	loading: Loader
});

const Signin = Loadable({
	loader: () => import('./components/Signin'),
	loading: Loader
});

class App extends Component {
	state = {
		user: 'loading'
	};
	componentDidMount() {
		firebase.auth().onAuthStateChanged(user => {
			if (user) {
				this.setState({ user });
			} else {
				firebase
					.auth()
					.signInAnonymously()
					.catch(err => {
						console.error(err);
					});
			}
		});

		Stats.preload();
		Progress.preload();
		History.preload();
		Signin.preload();
	}
	render() {
		const { user } = this.state;
		return (
			<Router>
				<div className="App">
					<div className="navbar">
						<div className="navbar-brand">
							<Link to="/" className="navbar-item">
								Body Tracker
							</Link>
							<Link to="/stats" className="navbar-item">
								Stats
							</Link>
							<Link to="/progress" className="navbar-item">
								Progress
							</Link>
							<Link to="/history" className="navbar-item">
								History
							</Link>
							{user != 'loading' &&
								user &&
								user.isAnonymous && (
									<Link to="/signin" className="navbar-item">
										Sign In
									</Link>
								)}
						</div>
					</div>
					<Route exact path="/" component={BodyTracker} />
					<Route path="/stats" component={Stats} />
					<Route path="/progress" component={Progress} />
					<Route path="/history" component={History} />
					<Route path="/signin" component={Signin} />
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
