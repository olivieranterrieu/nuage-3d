// Initialisation de la scène, de la caméra et du renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Position initiale de la caméra
camera.position.z = 5;

// Ajout des contrôles de la souris
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Améliore le mouvement fluide
controls.dampingFactor = 0.05;

// Interface pour changer la couleur des points
const colorPicker = document.createElement('input');
colorPicker.type = 'color';
colorPicker.value = '#ff0000';
colorPicker.style.position = 'absolute';
colorPicker.style.top = '10px';
colorPicker.style.right = '10px';
colorPicker.style.zIndex = '10';
document.body.appendChild(colorPicker);

let pointMaterial;  // Matériau des points

// Gestionnaire de fichiers pour charger un .xyz
document.getElementById('fileInput').addEventListener('change', function(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const content = e.target.result;
      const points = parseXYZ(content);
      createPointCloud(points);
    };
    reader.readAsText(file);
  }
});

// Fonction pour parser le fichier XYZ (en prenant en compte la couleur RGB)
function parseXYZ(data) {
  const lines = data.split('\n');
  const positions = [];
  const colors = [];
  lines.forEach(line => {
    line = line.trim();
    if (line !== "") {
      const parts = line.split(/\s+/);
      if (parts.length >= 6) {
        const x = parseFloat(parts[0]);
        const y = parseFloat(parts[1]);
        const z = parseFloat(parts[2]);
        const r = parseInt(parts[3], 10) / 255;  // Normalisation des couleurs
        const g = parseInt(parts[4], 10) / 255;
        const b = parseInt(parts[5], 10) / 255;
        if (!isNaN(x) && !isNaN(y) && !isNaN(z) && !isNaN(r) && !isNaN(g) && !isNaN(b)) {
          positions.push(x, y, z);
          colors.push(r, g, b);  // Ajout des couleurs RGB
        }
      }
    }
  });

  // Debug : Affiche les positions et les couleurs
  console.log('Positions:', positions);
  console.log('Colors:', colors);

  return { positions, colors };
}
// Fonction pour créer un nuage de points
function createPointCloud(data) {
  // Debug : Vérifie si les données sont correctes
  console.log("Création du nuage de points avec", data.positions.length / 3, "points");

  // Supprimer l'ancien nuage
  scene.children = scene.children.filter(child => !(child instanceof THREE.Points)); 

  const geometry = new THREE.BufferGeometry();
  const vertices = new Float32Array(data.positions);
  const vertexColors = new Float32Array(data.colors);
  
  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(vertexColors, 3));

  pointMaterial = new THREE.PointsMaterial({ vertexColors: true, size: 0.1 });
  const pointCloud = new THREE.Points(geometry, pointMaterial);
  scene.add(pointCloud);

  // Debug : Vérifie que le nuage de points est bien ajouté à la scène
  console.log('Nuage de points ajouté à la scène');
}

// Mise à jour de la couleur en temps réel (en cas de changement via la palette)
colorPicker.addEventListener('input', (event) => {
  const color = new THREE.Color(event.target.value);
  pointMaterial.color.set(color);
});

// Animation et rendu de la scène
function animate() {
  requestAnimationFrame(animate);
  controls.update(); // Met à jour la rotation de la souris

  console.log('Rendu en cours'); // Debug pour vérifier que l'animation se lance
  renderer.render(scene, camera);
}
animate();

// Ajustement du rendu au redimensionnement
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
