import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import { FirebaseAppProvider, AuthProvider, FirestoreProvider, useFirebaseApp } from 'reactfire';
import { firebaseConfig } from './firebase-config';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Componente wrapper para obtener los SDKs correctamente
const FirebaseProviders = ({ children }) => {
  const app = useFirebaseApp(); // Obtener la instancia correcta de Firebase
  const auth = getAuth(app);
  const firestore = getFirestore(app);

  return (
    <AuthProvider sdk={auth}>
      <FirestoreProvider sdk={firestore}>
        {children}
      </FirestoreProvider>
    </AuthProvider>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <FirebaseAppProvider firebaseConfig={firebaseConfig} suspense={true}>
    <FirebaseProviders>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </FirebaseProviders>
  </FirebaseAppProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

