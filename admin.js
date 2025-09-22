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

function adminVoegUitgaveToe() {
  const titel = document.getElementById("admin-titel").value.trim();
  const bedrag = parseFloat(document.getElementById("admin-bedrag").value);
  const categorie = document.getElementById("admin-categorie").value.trim();
  const groep = document.getElementById("admin-groep").value;
  const betaald = document.getElementById("admin-betaald").checked;
  const uid = auth.currentUser?.uid;

  if (!titel || !bedrag || !categorie || !groep) {
    return alert("Vul alle velden in");
  }

  db.collection("uitgaven").add({
    uid,
    titel,
    bedrag,
    categorie,
    groep,
    betaald,
    datum: firebase.firestore.FieldValue.serverTimestamp()
  })
  .then(() => {
    alert("Uitgave toegevoegd!");
    document.getElementById("admin-titel").value = "";
    document.getElementById("admin-bedrag").value = "";
    document.getElementById("admin-categorie").value = "";
    document.getElementById("admin-groep").selectedIndex = 0;
    document.getElementById("admin-betaald").checked = false;
    laadUitgavenBeheer();
  });
}

function laadUitgavenBeheer() {
  const lijst = document.getElementById("uitgaven-beheer");
  lijst.innerHTML = "";

  db.collection("uitgaven").orderBy("datum", "desc").get()
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
            <th>Betaald</th>
            <th>Acties</th>
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
          <td>
            <input type="checkbox" ${d.betaald ? "checked" : ""} onchange="toggleBetaald('${doc.id}', this.checked)">
          </td>
          <td>
            <button onclick="verwijderUitgave('${doc.id}')">🗑️</button>
          </td>
        `;
        tbody.appendChild(row);
      });

      lijst.appendChild(table);
    });
}

function toggleBetaald(id, status) {
  db.collection("uitgaven").doc(id).update({ betaald: status });
}

function verwijderUitgave(id) {
  if (confirm("Weet je zeker dat je deze uitgave wilt verwijderen?")) {
    db.collection("uitgaven").doc(id).delete()
      .then(() => laadUitgavenBeheer());
  }
}

auth.onAuthStateChanged(user => {
  if (!user) return goBack();
  db.collection("gebruikers").doc(user.uid).get()
    .then(doc => {
      if (doc.exists && doc.data().rol === "admin") {
        laadUitgavenBeheer();
      } else {
        goBack();
      }
    });
});
