import * as firebase from 'firebase'
require('@firebase/firestore')

const firebaseConfig = {
  apiKey: "AIzaSyD9zxHGyudTs-sWYc3kXAEnJ031kbrmknw",
  authDomain: "wireless-library-69676.firebaseapp.com",
  projectId: "wireless-library-69676",
  storageBucket: "wireless-library-69676.appspot.com",
  messagingSenderId: "346879646368",
  appId: "1:346879646368:web:56a3c48294b9ca06fc47c5"
};
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  export default firebase.firestore();