import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import initializeFirebase from './initializeFirebase';

initializeFirebase();

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
