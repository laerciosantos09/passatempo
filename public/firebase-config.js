<script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
</script>