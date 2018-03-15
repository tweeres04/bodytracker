import React from 'react';
import firebase from 'firebase';
import FirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';

const uiConfig = {
	autoUpgradeAnonymousUsers: true,
	signInOptions: [
		firebase.auth.FacebookAuthProvider.PROVIDER_ID,
		{
			provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
			requireDisplayName: false
		}
	],
	signInSuccessUrl: '/',
	callbacks: {
		signInFailure: err => {
			console.error(err);
		}
	}
};

export default function Signin() {
	return <FirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />;
}
