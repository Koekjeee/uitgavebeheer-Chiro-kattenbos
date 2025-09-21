// Firebase configuratie
const firebaseConfig = {
  apiKey: "AIzaSyC-UaXhh5juhV4raXWnzku9fSZZD75-y9w",
  authDomain: "uitgavebeheerch.firebaseapp.com",
  projectId: "uitgavebeheerch",
  messagingSenderId: "461673562296",
  appId: "1:461673562296:web:d90a026cd685400139f44d"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// 🔐 Authenticatie
function register() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;

      // Voeg gebruiker toe aan Firestore
      return db.collection("gebruikers").doc(user.uid).set({
        email: user.email,
        aangemaaktOp: new Date(),
        rol: "lid" // optioneel, pas aan voor Chiro-structuur
      });
    })
    .then(() => {
      alert("Geregistreerd en opgeslagen in Firestore!");
    })
    .catch(error => alert(error.message));
}

function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      document.getElementById("auth-section").style.display = "none";
      document.getElementById("uitgave-section").style.display = "block";
      haalUitgavenOp();
    })
    .catch(error => alert(error.message));
}

// 💰 Uitgave toevoegen
function voegUitgaveToe() {
  const bedrag = parseFloat(document.getElementById("bedrag").value);
  const categorie = document.getElementById("categorie").value;
  const gebruiker = auth.currentUser;

  if (!gebruiker) return alert("Niet ingelogd");

  db.collection("uitgaven").add({
    uid: gebruiker.uid,
    bedrag,
    categorie,
    datum: new Date()
  }).then(() => {
    alert("Uitgave toegevoegd!");
    haalUitgavenOp();
  }).catch(error => alert(error.message));
}

// 📋 Uitgaven ophalen
function haalUitgavenOp() {
  const gebruiker = auth.currentUser;
  const lijst = document.getElementById("uitgaven-lijst");
  lijst.innerHTML = "";

  db.collection("uitgaven")
    .where("uid", "==", gebruiker.uid)
    .orderBy("datum", "desc")
    .get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        const data = doc.data();
        const item = document.createElement("li");
        item.textContent = `${data.categorie}: €${data.bedrag.toFixed(2)} op ${new Date(data.datum.toDate()).toLocaleDateString()}`;
        lijst.appendChild(item);
      });
    });
}
