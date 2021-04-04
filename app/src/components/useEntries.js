import firebase from 'firebase/app';
import { useQuery } from 'react-query';

export default function useEntries() {
	return useQuery(
		'entries',
		async () => {
			const { uid } = firebase.auth().currentUser;

			const querySnapshot = await firebase
				.firestore()
				.collection(`users/${uid}/entries`)
				.orderBy('timestamp', 'desc')
				.get()
				.catch((err) => console.error(err));

			const entries = querySnapshot.docs.map((d) => ({
				...d.data(),
				id: d.id,
			}));
			return entries;
		},
		{
			staleTime: 1000 * 60 * 10,
		}
	);
}
