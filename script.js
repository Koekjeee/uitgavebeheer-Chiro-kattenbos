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

function goToAdmin() {
  window.location.href = "admin.html";
}

function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  auth.signInWithEmailAndPassword(email, password)
    .catch(e => alert(e.message));
}

function logout() {
  auth.signOut();
}

function voegUitgaveToe() {
  const titel = document.getElementById("titel").value.trim();
  const bedrag = parseFloat(document.getElementById("bedrag").value);
  const categorie = document.getElementById("categorie").value.trim();
  const user = auth.currentUser;
  if (!user || !titel || !bedrag || !categorie) return alert("Vul alle velden in");

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
      document.getElementById("categorie").value = "";
      haalUitgavenOp();
    })
    .catch(e => alert(e.message));
}

function haalUitgavenOp() {
  const user = auth.currentUser;
  if (!user) return;
  const lijst = document.getElementById("uitgaven-lijst");
  lijst.innerHTML = "";

  db.collection("gebruikers").doc(user.uid).get()
    .then(doc => {
      const { rol, groep } = doc.data();
      let query = db.collection("uitgaven").orderBy("datum", "desc");
      if (rol !== "admin") query = query.where("groep", "==", groep);
      return query.get();
    })
    .then(snapshot => {
      const table = document.createElement("table");
      table.innerHTML = `
        <thead>
          <tr>
            <th>Titel</th>
            <th>Bedrag</th>
            <th>Categorie</th>
            <th>Groep</th>
            <th>Datum</th>
          </tr>
        </thead>
        <tbody></tbody>
      `;
      const tbody = table.querySelector("tbody");

      snapshot.forEach(doc => {
        const d = doc.data();
        const datum = d.datum?.toDate().toLocaleString() || "";
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${d.titel}</td>
          <td>€${d.bedrag.toFixed(2)}</td>
          <td>${d.categorie}</td>
          <td>${d.groep}</td>
          <td>${datum}</td>
        `;
        tbody.appendChild(row);
      });

      lijst.appendChild(table);
    });
}

auth.onAuthStateChanged(user => {
  if (user) {
    document.getElementById("auth-section").style.display = "none";
    document.getElementById("uitgave-section").style.display = "block";
    document.getElementById("logout-btn").style.display = "inline-block";

    db.collection("gebruikers").doc(user.uid).get()
      .then(doc => {
        const { rol, groep } = doc.data();
        document.getElementById("user-info").textContent = `Ingelogd als ${rol} | groep: ${groep}`;
        if (rol === "admin") {
          document.getElementById("admin-btn").style.display = "inline-block";
        }
        haalUitgavenOp();
      });
  } else {
    document.getElementById("auth-section").style.display = "block";
    document.getElementById("uitgave-section").style.display = "none";
    document.getElementById("logout-btn").style.display = "none";
    document.getElementById("admin-btn").style.display = "none";
    document.getElementById("user-info").textContent = "";
  }
});
