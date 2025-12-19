// firebase-config.js
// Configuração do Firebase - JavaScript puro (sem ES6 modules)

const firebaseConfig = {
    apiKey: "AIzaSyBfSkOG7AIXQUfRL5Qzr476o4y3ygeh9QQ",
    authDomain: "passatempo-298d7.firebaseapp.com",
    projectId: "passatempo-298d7",
    storageBucket: "passatempo-298d7.firebasestorage.app",
    messagingSenderId: "602501762720",
    appId: "1:602501762720:web:d18eb2151ef497805303c5"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Referências globais
const auth = firebase.auth();
const db = firebase.firestore();

console.log('Firebase iniciado com sucesso!');
