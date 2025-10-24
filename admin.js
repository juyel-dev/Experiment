<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Graphz Admin</title>
<link rel="stylesheet" href="style.css">
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js"></script>
</head>
<body>

<h1>Admin Panel</h1>

<div id="loginDiv">
  <input type="email" id="email" placeholder="Email">
  <input type="password" id="password" placeholder="Password">
  <button id="loginBtn">Login</button>
</div>

<div id="adminDiv" style="display:none;">
  <h2>Add Graph</h2>
  <input type="text" id="name" placeholder="Name">
  <input type="text" id="alias" placeholder="Alias">
  <input type="text" id="source" placeholder="Source">
  <input type="text" id="subject" placeholder="Subject">
  <input type="text" id="tags" placeholder="Tags comma separated">
  <textarea id="description" placeholder="Description"></textarea>
  <input type="text" id="imageUrl" placeholder="Image URL (Imgur)">
  <button id="addGraph">Add Graph</button>
  <h2>Existing Graphs</h2>
  <div id="existingGraphs"></div>
</div>

<script src="admin.js"></script>
</body>
</html>
