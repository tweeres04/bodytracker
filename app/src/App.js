import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import firebase from 'firebase/app';
import Loadable from 'react-loadable';
import classnames from 'classnames';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import amplitude from 'amplitude-js';

import Loader from './components/Loader';
import BodyTracker from './components/BodyTracker';

import './App.scss';

const Progress = Loadable({
	loader: () => import('./components/Progress/Progress'),
	loading: Loader,
});

const History = Loadable({
	loader: () => import('./components/History'),
	loading: Loader,
});

const Stats = Loadable({
	loader: () => import('./components/Stats'),
	loading: Loader,
});

const Signin = Loadable({
	loader: () => import('./components/Signin'),
	loading: Loader,
});

// From https://web.dev/customize-install/#detect-launch-type
function getPWADisplayMode() {
	const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
	if (document.referrer.startsWith('android-app://')) {
		return 'twa';
	} else if (navigator.standalone || isStandalone) {
		return 'standalone';
	}
	return 'browser';
}

const queryClient = new QueryClient();

class App extends Component {
	state = {
		user: 'loading',
		mobileMenu: false,
	};
	componentDidMount() {
		firebase.auth().onAuthStateChanged((user) => {
			this.setState({ user });
			amplitude.getInstance().setUserId(user && user.uid);
		});

		Stats.preload();
		Progress.preload();
		History.preload();
		Signin.preload();

		amplitude.getInstance().init(process.env.REACT_APP_AMPLITUDE_API_KEY);

		window.addEventListener('appinstalled', () => {
			amplitude.getInstance().logEvent('app_installed');
		});

		const displayMode = getPWADisplayMode();
		const identify = new amplitude.Identify().set('display_mode', displayMode);
		amplitude.getInstance().identify(identify);
	}
	render() {
		const { user, mobileMenu } = this.state;
		return (
			<QueryClientProvider client={queryClient}>
				<Router>
					{user === 'loading' ? null : (
						<div className="App">
							<div className="navbar">
								<div className="navbar-brand">
									<Link to="/" className="navbar-item">
										Bodytracker
									</Link>
									{user && (
										<div
											className={classnames('navbar-burger', {
												'is-active': mobileMenu,
											})}
											onClick={() => {
												this.setState(({ mobileMenu }) => ({
													mobileMenu: !mobileMenu,
												}));
											}}
										>
											<span />
											<span />
											<span />
										</div>
									)}
								</div>
								{user && (
									<div
										className={classnames('navbar-menu', {
											'is-active': mobileMenu,
										})}
									>
										<div className="navbar-start">
											<Link to="/stats" className="navbar-item">
												Stats
											</Link>
											<Link to="/progress" className="navbar-item">
												Progress
											</Link>
											<Link to="/history" className="navbar-item">
												History
											</Link>
										</div>
										<div className="navbar-end">
											{user && (
												<a className="navbar-item" onClick={this.logout}>
													Logout
												</a>
											)}
										</div>
									</div>
								)}
							</div>
							{user ? (
								<>
									<Route exact path="/" component={BodyTracker} />
									<Route path="/stats" component={Stats} />
									<Route path="/progress" component={Progress} />
									<Route path="/history" component={History} />
									<Route path="/signin" component={Signin} />
								</>
							) : (
								<Signin />
							)}
							<footer className="footer">
								<div className="container">
									<div className="content has-text-centered">
										<p>
											<a href="https://tweeres.ca">&copy; Tyler Weeres</a>
										</p>
										<p>
											Icon made by{' '}
											<a href="http://www.freepik.com" title="Freepik">
												Freepik
											</a>{' '}
											from{' '}
											<a href="https://www.flaticon.com/" title="Flaticon">
												flaticon.com
											</a>
										</p>
									</div>
								</div>
							</footer>
						</div>
					)}
				</Router>
				<ReactQueryDevtools />
			</QueryClientProvider>
		);
	}
	logout = async (e) => {
		e.preventDefault();
		await firebase.auth().signOut();

		amplitude.getInstance().setUserId(null);
		amplitude.getInstance().regenerateDeviceId();
	};
}

export default App;
