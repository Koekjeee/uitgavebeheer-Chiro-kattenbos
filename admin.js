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

// Keer terug naar index
function goBack() {
  window.location.href = "index.html";
}

// Laad gebruikers in dashboard
function laadAdminDashboard() {
  const lijst = document.getElementById("gebruikers-lijst");
  lijst.innerHTML = "";
  db.collection("gebruikers").get()
    .then(snap => {
      snap.forEach(doc => {
        const { email, rol, groep } = doc.data();
        const uid = doc.id;
        const li = document.createElement("li");
        li.innerHTML = `
          ${email}
          <select onchange="updateRol('${uid}', this.value)">
            <option value="gebruiker" ${rol==="gebruiker"?"selected":""}>gebruiker</option>
            <option value="admin" ${rol==="admin"?"selected":""}>admin</option>
          </select>
          <select onchange="updateGroep('${uid}', this.value)">
            ${["ribbels","speelclubs","kwiks","tippers","rakkers","aspi","leiding","kokkies","overige"]
              .map(g => `<option value="${g}" ${groep===g?"selected":""}>${g}</option>`).join("")}
          </select>
        `;
        lijst.appendChild(li);
      });
    })
    .catch(e => console.error(e));
}

// Update rol
function updateRol(uid, rol) {
  db.collection("gebruikers").doc(uid).update({ rol });
}

// Update groep
function updateGroep(uid, groep) {
  db.collection("gebruikers").doc(uid).update({ groep });
}

// Nieuwe gebruiker aanmaken
function adminRegistreer() {
  const email = document.getElementById("new-email").value.trim();
  const password = document.getElementById("new-password").value;
  const rol = document.getElementById("new-rol").value;
  const groep = document.getElementById("new-groep").value;

  if (!email || !password) {
    return alert("E-mail en wachtwoord zijn verplicht");
  }

  auth.createUserWithEmailAndPassword(email, password)
    .then(({ user }) => {
      return db.collection("gebruikers").doc(user.uid).set({
        email, rol, groep,
        aangemaaktOp: firebase.firestore.FieldValue.serverTimestamp()
      });
    })
    .then(() => {
      document.getElementById("new-email").value = "";
      document.getElementById("new-password").value = "";
      laadAdminDashboard();
    })
    .catch(e => alert(e.message));
}

// Alleen admins mogen hier komen
auth.onAuthStateChanged(user => {
  if (!user) return goBack();
  db.collection("gebruikers").doc(user.uid).get()
    .then(doc => {
      if (doc.data().rol !== "admin") {
        goBack();
      } else {
        laadAdminDashboard();
      }
    });
});
