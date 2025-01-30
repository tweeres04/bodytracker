import React from 'react';
import firebase from 'firebase/app';
import FirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';

export default function Signin() {
	return (
		<div className="hero is-large">
			<div className="container">
				<div className="hero-body">
					<div className="columns">
						<div className="column">
							<h1 className="title">Sign in or create an account</h1>
							<div className="subtitle">Control your body goals</div>
						</div>
						<div className="column">
							<FirebaseAuth
								uiConfig={{
									autoUpgradeAnonymousUsers: true,
									signInOptions: [
										{
											provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
											requireDisplayName: false,
										},
									],
									signInSuccessUrl: '/',
									callbacks: {
										signInFailure: async (err) => {
											if (
												err.code ==
												'firebaseui/anonymous-upgrade-merge-conflict'
											) {
												const firestore = firebase.firestore();
												const anonymousUser = firebase.auth().currentUser;
												const cred = err.credential;
												const querySnapshot = await firestore
													.collection(`users/${anonymousUser.uid}/entries`)
													.get();
												const documentSnapshots = querySnapshot.docs || [];
												const entries = documentSnapshots.map((d) => d.data());
												const newUser = await firebase
													.auth()
													.signInWithCredential(cred);
												if (entries.length > 0) {
													const batch = firestore.batch();
													const newUserEntriesRef = firestore.collection(
														`users/${newUser.uid}/entries`
													);
													entries.forEach((e) => {
														const entryRef = newUserEntriesRef.doc();
														batch.set(entryRef, e);
													});
													await batch.commit();
													console.log(
														'Data migrated from',
														anonymousUser,
														'to',
														newUser
													);
												} else {
													console.log(
														'No data to migrate. Signed in as ',
														newUser
													);
												}
												await anonymousUser.delete();
												window.location = '/';
											} else {
												console.error(err);
											}
										},
									},
								}}
								firebaseAuth={firebase.auth()}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
