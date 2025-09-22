// 1. Firebase initialisatie
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


// 2. Gebruikers dropdown vullen
function loadGebruikers() {
  const select = document.getElementById("uitgave-gebruiker");
  select.innerHTML = `<option value="" disabled selected>Kies gebruiker</option>`;
  db.collection("gebruikers").get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        const data = doc.data();
        const option = document.createElement("option");
        option.value = doc.id;
        option.textContent = data.email;
        select.appendChild(option);
      });
    })
    .catch(err => console.error("Fout loadGebruikers:", err));
}


// 3. Inloggen
function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  auth.signInWithEmailAndPassword(email, password)
    .catch(error => alert(error.message));
}


// 4. Uitloggen
function logout() {
  auth.signOut()
    .then(() => {
      document.getElementById("logout-btn").style.display = "none";
      document.getElementById("auth-section").style.display = "block";
      document.getElementById("uitgave-section").style.display = "none";
      document.getElementById("admin-section").style.display = "none";
    });
}


// 5. Nieuwe uitgave toevoegen
function voegUitgaveToe() {
  const titel = document.getElementById("titel").value.trim();
  const bedrag = parseFloat(document.getElementById("bedrag").value);
  const categorie = document.getElementById("categorie").value;
  const gebruikerUid = document.getElementById("uitgave-gebruiker").value;

  if (!titel || !bedrag || !categorie || !gebruikerUid) {
    return alert("Vul alle velden in");
  }

  db.collection("gebruikers").doc(gebruikerUid).get()
    .then(doc => {
      if (!doc.exists) throw new Error("Gebruiker niet gevonden");
      const groep = doc.data().groep;
      return db.collection("uitgaven").add({
        uid: gebruikerUid,
        titel,
        bedrag,
        categorie,
        groep,
        datum: firebase.firestore.FieldValue.serverTimestamp()
      });
    })
    .then(() => {
      alert("Uitgave toegevoegd!");
      document.getElementById("titel").value = "";
      document.getElementById("bedrag").value = "";
      document.getElementById("categorie").value = "";
      document.getElementById("uitgave-gebruiker").value = "";
      haalUitgavenOp();
    })
    .catch(error => alert(error.message));
}


// 6. Uitgaven ophalen en tonen
function haalUitgavenOp() {
  const lijst = document.getElementById("uitgaven-lijst");
  lijst.innerHTML = "";
  const user = auth.currentUser;
  if (!user) return;

  db.collection("gebruikers").doc(user.uid).get()
    .then(doc => {
      const data = doc.data();
      let query = db.collection("uitgaven").orderBy("datum", "desc");
      if (data.rol !== "admin") {
        query = query.where("groep", "==", data.groep);
      }
      return query.get();
    })
    .then(snapshot => {
      snapshot.forEach(doc => {
        const d = doc.data();
        const item = document.createElement("li");
        const ts = d.datum && d.datum.toDate
          ? d.datum.toDate().toLocaleString()
          : "";
        item.textContent = `${d.titel}: €${d.bedrag.toFixed(2)} (${d.categorie}) door ${d.uid} op ${ts}`;
        lijst.appendChild(item);
      });
    })
    .catch(err => console.error("Fout haalUitgavenOp:", err));
}


// 7. Admin-dashboard vullen
function laadAdminDashboard() {
  const lijst = document.getElementById("gebruikers-lijst");
  lijst.innerHTML = "";
  db.collection("gebruikers").get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        const d = doc.data();
        const item = document.createElement("li");
        item.innerHTML = `
          ${d.email} (${d.rol}${d.groep ? `, ${d.groep}` : ""})
          <select onchange="updateRol('${doc.id}', this.value)">
            <option value="gebruiker" ${d.rol==="gebruiker"?"selected":""}>gebruiker</option>
            <option value="admin" ${d.rol==="admin"?"selected":""}>admin</option>
          </select>
        `;
        lijst.appendChild(item);
      });
    })
    .catch(err => console.error("Fout laadAdminDashboard:", err));
}

// 8. Rol updaten
function updateRol(uid, rol) {
  db.collection("gebruikers").doc(uid).update({ rol });
}


// 9. Admin maakt nieuwe gebruiker
function adminRegistreer() {
  const naam = document.getElementById("new-name").value.trim();
  const email = document.getElementById("new-email").value.trim();
  const rol = document.getElementById("new-rol").value;

  if (!naam || !email || !rol) {
    return alert("Vul alle velden in");
  }

  const password = prompt("Voer een tijdelijk wachtwoord in:");
  if (!password) {
    return alert("Wachtwoord is verplicht");
  }

  auth.createUserWithEmailAndPassword(email, password)
    .then(({ user }) => {
      return db.collection("gebruikers").doc(user.uid).set({
        naam,
        email,
        rol,
        groep: rol==="admin" ? "leiding" : "overige",
        aangemaaktOp: firebase.firestore.FieldValue.serverTimestamp()
      });
    })
    .then(() => {
      alert("Nieuwe gebruiker aangemaakt!");
      document.getElementById("new-name").value = "";
      document.getElementById("new-email").value = "";
      document.getElementById("new-rol").value = "gebruiker";
      laadAdminDashboard();
      loadGebruikers();
    })
    .catch(error => alert(error.message));
}


// 10. UI switch op auth-state change
auth.onAuthStateChanged(user => {
  if (user) {
    document.getElementById("logout-btn").style.display = "inline-block";
    document.getElementById("auth-section").style.display = "none";
    document.getElementById("uitgave-section").style.display = "block";
    loadGebruikers();

    db.collection("gebruikers").doc(user.uid).get()
      .then(doc => {
        if (doc.exists && doc.data().rol==="admin") {
          document.getElementById("admin-section").style.display = "block";
          laadAdminDashboard();
        }
      });

    haalUitgavenOp();
  } else {
    document.getElementById("logout-btn").style.display = "none";
    document.getElementById("auth-section").style.display = "block";
    document.getElementById("uitgave-section").style.display = "none";
    document.getElementById("admin-section").style.display = "none";
  }
});
