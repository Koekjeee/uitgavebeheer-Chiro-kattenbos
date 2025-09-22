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

function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.signInWithEmailAndPassword(email, password)
    .catch(error => alert(error.message));
}

function logout() {
  auth.signOut()
    .then(() => {
      document.getElementById("auth-section").style.display = "block";
      document.getElementById("uitgave-section").style.display = "none";
      document.getElementById("admin-section").style.display = "none";
    });
}

function voegUitgaveToe() {
  const bedrag = parseFloat(document.getElementById("bedrag").value);
  const categorie = document.getElementById("categorie").value;
  const gebruiker = auth.currentUser;

  if (!gebruiker) return alert("Niet ingelogd");

  db.collection("gebruikers").doc(gebruiker.uid).get()
    .then(doc => {
      const groep = doc.data().groep;

      return db.collection("uitgaven").add({
        uid: gebruiker.uid,
        bedrag,
        categorie,
        groep,
        datum: new Date()
      });
    })
    .then(() => {
      alert("Uitgave toegevoegd!");
      haalUitgavenOp();
    })
    .catch(error => alert(error.message));
}

function haalUitgavenOp() {
  const gebruiker = auth.currentUser;
  const lijst = document.getElementById("uitgaven-lijst");
  lijst.innerHTML = "";

  db.collection("gebruikers").doc(gebruiker.uid).get()
    .then(doc => {
      const groep = doc.data().groep;

      return db.collection("uitgaven")
        .where("groep", "==", groep)
        .orderBy("datum", "desc")
        .get();
    })
    .then(snapshot => {
      snapshot.forEach(doc => {
        const data = doc.data();
        const item = document.createElement("li");
        item.textContent = `${data.categorie}: €${data.bedrag.toFixed(2)} op ${new Date(data.datum.toDate()).toLocaleDateString()}`;
        lijst.appendChild(item);
      });
    });
}

function laadAdminDashboard() {
  const lijst = document.getElementById("gebruikers-lijst");
  lijst.innerHTML = "";

  db.collection("gebruikers").get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        const data = doc.data();
        const item = document.createElement("li");
        item.innerHTML = `
          ${data.email} (${data.rol}, ${data.groep})
          <select onchange="updateRol('${doc.id}', this.value)">
            <option value="gebruiker" ${data.rol === "gebruiker" ? "selected" : ""}>gebruiker</option>
            <option value="admin" ${data.rol === "admin" ? "selected" : ""}>admin</option>
          </select>
          <select onchange="updateGroep('${doc.id}', this.value)">
            ${["ribbels","speelclubs","kwiks","tippers","rakkers","aspi","leiding","kokkies","overige"].map(g => 
              `<option value="${g}" ${data.groep === g ? "selected" : ""}>${g}</option>`).join("")}
          </select>
        `;
        lijst.appendChild(item);
      });
    });
}

function updateRol(uid, rol) {
  db.collection("gebruikers").doc(uid).update({ rol });
}

function updateGroep(uid, groep) {
  db.collection("gebruikers").doc(uid).update({ groep });
}

function adminRegistreer() {
  const email = document.getElementById("new-email").value;
  const password = document.getElementById("new-password").value;
  const groep = document.getElementById("new-groep").value;

  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const newUser = userCredential.user;

      return db.collection("gebruikers").doc(newUser.uid).set({
        email: newUser.email,
        rol: "gebruiker",
        groep,
        aangemaaktOp: new Date()
      });
    })
    .then(() => {
      alert("Nieuwe gebruiker aangemaakt!");
      document.getElementById("new-email").value = "";
      document.getElementById("new-password").value = "";
    })
    .catch(error => alert(error.message));
}

auth.onAuthStateChanged((user) => {
  if (user) {
    document.getElementById("auth-section").style.display = "none";
    document.getElementById("uitgave-section").style.display = "block";

    db.collection("gebruikers").doc(user.uid).get()
          .then(doc => {
        const data = doc.data();
        if (data.rol === "admin") {
          document.getElementById("admin-section").style.display = "block";
          laadAdminDashboard();
        }
      });

    haalUitgavenOp();
  } else {
    document.getElementById("auth-section").style.display = "block";
    document.getElementById("uitgave-section").style.display = "none";
    document.getElementById("admin-section").style.display = "none";
  }
});
     
