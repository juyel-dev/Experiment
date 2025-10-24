// Firebase config same as app.js
const app = firebase.initializeApp({
  apiKey: "AIzaSyCYflpDZV4prrM-KayHRRwEU1CtiGEa9e0",
  authDomain: "content-promax.firebaseapp.com",
  projectId: "content-promax",
  storageBucket: "content-promax.firebasestorage.app",
  messagingSenderId: "590478958749",
  appId: "1:590478958749:web:8434c03f75273e63607474"
});

const db = firebase.firestore();
const auth = firebase.auth();

let graphs = [];

// Admin login
document.getElementById('loginBtn').addEventListener('click', () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      document.getElementById('loginDiv').style.display = 'none';
      document.getElementById('adminDiv').style.display = 'block';
      loadGraphs();
    })
    .catch(err => alert(err.message));
});

// Add graph
document.getElementById('addGraph').addEventListener('click', () => {
  const name = document.getElementById('name').value;
  const alias = document.getElementById('alias').value;
  const source = document.getElementById('source').value;
  const subject = document.getElementById('subject').value;
  const tags = document.getElementById('tags').value.split(',').map(t=>t.trim());
  const description = document.getElementById('description').value;
  const imageUrl = document.getElementById('imageUrl').value;

  db.collection('graphs').add({name, alias, source, subject, tags, description, imageUrl})
    .then(()=> {
      alert('Graph added!');
      clearForm();
    });
});

function clearForm(){
  document.getElementById('name').value = "";
  document.getElementById('alias').value = "";
  document.getElementById('source').value = "";
  document.getElementById('subject').value = "";
  document.getElementById('tags').value = "";
  document.getElementById('description').value = "";
  document.getElementById('imageUrl').value = "";
}

// Load graphs for admin panel
function loadGraphs(){
  db.collection('graphs').onSnapshot(snapshot => {
    graphs = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
    displayAdminGraphs();
  });
}

function displayAdminGraphs(){
  const div = document.getElementById('existingGraphs');
  div.innerHTML = graphs.map(g => `
    <div class="graph-card">
      <h4>${g.name} (${g.alias})</h4>
      <button onclick="editGraph('${g.id}')">Edit</button>
      <button onclick="deleteGraph('${g.id}')">Delete</button>
    </div>
  `).join('');
}

// Delete graph
function deleteGraph(id){
  if(confirm("Are you sure to delete this graph?")){
    db.collection('graphs').doc(id).delete();
  }
}

// Edit graph (simple prompt)
function editGraph(id){
  const g = graphs.find(x=>x.id===id);
  if(!g) return;
  const name = prompt("Name:", g.name);
  const alias = prompt("Alias:", g.alias);
  const source = prompt("Source:", g.source);
  const subject = prompt("Subject:", g.subject);
  const tags = prompt("Tags comma separated:", g.tags.join(','));
  const description = prompt("Description:", g.description);
  const imageUrl = prompt("Image URL:", g.imageUrl);

  db.collection('graphs').doc(id).update({
    name, alias, source, subject, tags: tags.split(',').map(t=>t.trim()), description, imageUrl
  });
}
