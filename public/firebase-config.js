// firebase-config.js
// Configuração do Firebase para Passatempo

const firebaseConfig = {
    apiKey: "AIzaSyBfSkOG7AIXQUfRL5Qzr476o4y3ygeh9QQ",
    authDomain: "passatempo-298d7.firebaseapp.com",
    projectId: "passatempo-298d7",
    storageBucket: "passatempo-298d7.firebasestorage.app",
    messagingSenderId: "602501762720",
    appId: "1:602501762720:web:d18eb2151ef497805303c5",
    measurementId: "G-84F799X06X"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Export para usar em outros arquivos
const auth = firebase.auth();
const db = firebase.firestore();
