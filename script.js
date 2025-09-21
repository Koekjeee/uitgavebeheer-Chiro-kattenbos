<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Uitgavebeheer</title>
  <link rel="stylesheet" href="style.css">

  <!-- Firebase SDKs (compat) -->
  <script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-auth-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore-compat.js"></script>
</head>
<body>
  <div class="container">
    <h1>💸 Uitgavebeheer</h1>

    <div id="auth-section">
      <input type="email" id="email" placeholder="E-mail">
      <input type="password" id="password" placeholder="Wachtwoord">
      <button onclick="register()">Registreer</button>
      <button onclick="login()">Login</button>
    </div>

    <div id="uitgave-section" style="display:none;">
      <button onclick="logout()">Logout</button>

      <h2>Nieuwe uitgave</h2>
      <input type="number" id="bedrag" placeholder="Bedrag (€)">
      <input type="text" id="categorie" placeholder="Categorie">
      <button onclick="voegUitgaveToe()">Toevoegen</button>

      <h2>📋 Overzicht</h2>
      <ul id="uitgaven-lijst"></ul>
    </div>
  </div>

  <script src="script.js"></script>
</body>
</html>
