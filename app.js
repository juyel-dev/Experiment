// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCYflpDZV4prrM-KayHRRwEU1CtiGEa9e0",
  authDomain: "content-promax.firebaseapp.com",
  projectId: "content-promax",
  storageBucket: "content-promax.firebasestorage.app",
  messagingSenderId: "590478958749",
  appId: "1:590478958749:web:8434c03f75273e63607474"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Live fetch graphs
let graphs = [];
db.collection('graphs').onSnapshot(snapshot => {
  graphs = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
  displayGraphs(graphs);
});

// Display function
function displayGraphs(data) {
  const resultsDiv = document.getElementById('results');
  if(data.length === 0){
    resultsDiv.innerHTML = "<p>No graphs found.</p>";
    return;
  }
  resultsDiv.innerHTML = data.map(g => `
    <div class="graph-card">
      <h3>${g.name} (${g.alias})</h3>
      <p><strong>Source:</strong> ${g.source}</p>
      <p>${g.description}</p>
      <p><strong>Subject:</strong> ${g.subject}</p>
      <p><strong>Tags:</strong> ${g.tags.join(', ')}</p>
      <img src="${g.imageUrl}" alt="${g.name}">
    </div>
  `).join('');
}

// Search functionality
document.getElementById('search').addEventListener('input', function(){
  const query = this.value.toLowerCase();
  const filtered = graphs.filter(g => 
    g.name.toLowerCase().includes(query) ||
    g.alias.toLowerCase().includes(query) ||
    g.subject.toLowerCase().includes(query) ||
    g.tags.some(tag => tag.toLowerCase().includes(query))
  );
  displayGraphs(filtered);
});
