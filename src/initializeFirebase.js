import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

export default function initializeFirebase() {
	const config = {
		apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
		authDomain: `${
			process.env.REACT_APP_FIREBASE_PROJECT_ID
		}.firebaseapp.com`,
		databaseURL: `https://${
			process.env.REACT_APP_FIREBASE_PROJECT_ID
		}.firebaseio.com`,
		projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
		storageBucket: '',
		messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID
	};

	firebase.initializeApp(config);
}
