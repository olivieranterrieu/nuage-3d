// Initialisation de la scène, de la caméra et du renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Position initiale de la caméra
camera.position.z = 5;

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

// Fonction pour parser le fichier XYZ
function parseXYZ(data) {
  const lines = data.split('\n');
  const positions = [];
  lines.forEach(line => {
    line = line.trim();
    if (line !== "") {
      const parts = line.split(/\s+/);
      if (parts.length >= 3) {
        const x = parseFloat(parts[0]);
        const y = parseFloat(parts[1]);
        const z = parseFloat(parts[2]);
        if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
          positions.push(x, y, z);
        }
      }
    }
  });
  return positions;
}

// Fonction pour créer un nuage de points
function createPointCloud(positions) {
  scene.children = scene.children.filter(child => !(child instanceof THREE.Points)); // Supprimer l'ancien nuage

  const geometry = new THREE.BufferGeometry();
  const vertices = new Float32Array(positions);
  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

  const material = new THREE.PointsMaterial({ color: 0xff0000, size: 0.1 });
  const pointCloud = new THREE.Points(geometry, material);
  scene.add(pointCloud);
}

// Animation pour rendre la scène
function animate() {
  requestAnimationFrame(animate);
  scene.rotation.y += 0.001;
  renderer.render(scene, camera);
}
animate();

// Ajustement du rendu au redimensionnement
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
