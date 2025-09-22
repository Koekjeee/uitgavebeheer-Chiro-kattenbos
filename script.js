// Firebase init
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

// Navigeer naar admin-pagina
function goToAdmin() {
  window.location.href = "admin.html";
}

// Login
function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  auth.signInWithEmailAndPassword(email, password)
    .catch(e => alert(e.message));
}

// Logout
function logout() {
  auth.signOut();
}

// Voeg uitgave toe (gebruik huidige user)
function voegUitgaveToe() {
  const titel = document.getElementById("titel").value.trim();
  const bedrag = parseFloat(document.getElementById("bedrag").value);
  const categorie = document.getElementById("categorie").value;
  const user = auth.currentUser;
  if (!user || !titel || !bedrag || !categorie) {
    return alert("Vul alle velden in en log in.");
  }

  // Haal groep van ingelogde gebruiker
  db.collection("gebruikers").doc(user.uid).get()
    .then(doc => {
      const groep = doc.data().groep;
      return db.collection("uitgaven").add({
        uid: user.uid,
        titel,
        bedrag,
        categorie,
        groep,
        datum: firebase.firestore.FieldValue.serverTimestamp()
      });
    })
    .then(() => {
      document.getElementById("titel").value = "";
      document.getElementById("bedrag").value = "";
      document.getElementById("categorie").selectedIndex = 0;
      haalUitgavenOp();
    })
    .catch(e => alert(e.message));
}

// Haal uitgaven op
function haalUitgavenOp() {
  const user = auth.currentUser;
  if (!user) return;
  document.getElementById("uitgaven-lijst").innerHTML = "";

  db.collection("gebruikers").doc(user.uid).get()
    .then(doc => {
      const { rol, groep } = doc.data();
      let q = db.collection("uitgaven").orderBy("datum", "desc");
      if (rol !== "admin") {
        q = q.where("groep", "==", groep);
      }
      return q.get();
    })
    .then(snap => {
      snap.forEach(doc => {
        const d = doc.data();
        const li = document.createElement("li");
        const tijd = d.datum?.toDate().toLocaleString() || "";
        li.textContent = `${d.titel}: €${d.bedrag.toFixed(2)} (${d.categorie}) op ${tijd}`;
        document.getElementById("uitgaven-lijst").appendChild(li);
      });
    });
}

// UI-switch op auth-state change
auth.onAuthStateChanged(user => {
  if (user) {
    document.getElementById("auth-section").style.display = "none";
    document.getElementById("uitgave-section").style.display = "block";
    document.getElementById("logout-btn").style.display = "inline-block";

    // Zet rol & groep in beeld
    db.collection("gebruikers").doc(user.uid).get()
      .then(doc => {
        const { rol, groep } = doc.data();
        document.getElementById("user-info")
          .textContent = `Ingelogd als ${rol} | groep: ${groep}`;

        if (rol === "admin") {
          document.getElementById("admin-btn").style.display = "inline-block";
        }
      });

    haalUitgavenOp();
  } else {
    document.getElementById("auth-section").style.display = "block";
    document.getElementById("uitgave-section").style.display = "none";
    document.getElementById("logout-btn").style.display = "none";
    document.getElementById("admin-btn").style.display = "none";
    document.getElementById("user-info").textContent = "";
  }
});
