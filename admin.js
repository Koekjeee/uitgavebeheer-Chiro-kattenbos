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

function goBack() {
  window.location.href = "index.html";
}

function adminRegistreer() {
  const email = document.getElementById("new-email").value.trim();
  const password = document.getElementById("new-password").value;
  const rol = document.getElementById("new-rol").value;
  const groep = document.getElementById("new-groep").value;

  if (!email || !password || !rol || !groep) {
    return alert("Vul alle velden in");
  }

  fetch("https://jouw-server-url/admin/createUser", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, rol, groep })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      alert("Gebruiker aangemaakt!");
      document.getElementById("new-email").value = "";
      document.getElementById("new-password").value = "";
      document.getElementById("new-rol").value = "gebruiker";
      document.getElementById("new-groep").selectedIndex = 0;
      laadGebruikersBeheer();
    } else {
      alert("Fout: " + data.message);
    }
  })
  .catch(e => alert("Serverfout: " + e.message));
}

  auth.createUserWithEmailAndPassword(email, password)
    .then(({ user }) => {
      console.log("Nieuwe gebruiker aangemaakt:", user.uid);
      return db.collection("gebruikers").doc(user.uid).set({
        email,
        rol,
        groep,
        aangemaaktOp: firebase.firestore.FieldValue.serverTimestamp()
      });
    })
    .then(() => {
      alert("Gebruiker toegevoegd!");
      document.getElementById("new-email").value = "";
      document.getElementById("new-password").value = "";
      document.getElementById("new-rol").value = "gebruiker";
      document.getElementById("new-groep").selectedIndex = 0;
      laadGebruikersBeheer();
    })
    .catch(e => {
      console.error("Fout bij aanmaken:", e);
      alert("Fout: " + e.message);
    });
}

function laadGebruikersBeheer() {
  const lijst = document.getElementById("gebruikers-lijst");
  lijst.innerHTML = "";

  db.collection("gebruikers").get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        const { email, rol, groep } = doc.data();
        const uid = doc.id;
        const item = document.createElement("div");
        item.innerHTML = `
          <strong>${email}</strong><br>
          Rol:
          <select onchange="updateRol('${uid}', this.value)">
            <option value="gebruiker" ${rol === "gebruiker" ? "selected" : ""}>gebruiker</option>
            <option value="admin" ${rol === "admin" ? "selected" : ""}>admin</option>
          </select>
          Groep:
          <select onchange="updateGroep('${uid}', this.value)">
            ${["ribbels","speelclubs","kwiks","tippers","rakkers","aspi","leiding","kokkies","overige"]
              .map(g => `<option value="${g}" ${groep === g ? "selected" : ""}>${g}</option>`).join("")}
          </select>
          <hr>
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

auth.onAuthStateChanged(user => {
  if (!user) return goBack();
  db.collection("gebruikers").doc(user.uid).get()
    .then(doc => {
      if (doc.exists && doc.data().rol === "admin") {
        laadGebruikersBeheer();
      } else {
        goBack();
      }
    });
});
