import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import 'bulma/css/bulma.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import initializeFirebase from './initializeFirebase';

initializeFirebase();

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
