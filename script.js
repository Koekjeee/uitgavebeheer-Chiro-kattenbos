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
