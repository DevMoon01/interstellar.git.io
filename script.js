const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 5);

const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("warpCanvas"), alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Creazione stelle
const starGeometry = new THREE.BufferGeometry();
const starCount = 1500;
const positions = new Float32Array(starCount * 3);
const velocities = new Float32Array(starCount * 3);

for (let i = 0; i < starCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 20; // X - dispersione orizzontale
    positions[i + 1] = (Math.random() - 0.5) * 10; // Y - dispersione verticale
    positions[i + 2] = Math.random() * -10; // Z - profondità iniziale

    velocities[i] = 0;
    velocities[i + 1] = 0;
    velocities[i + 2] = Math.random() * 0.05 + 0.02; // Velocità warp
}

starGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

const starMaterial = new THREE.PointsMaterial({
    size: 0.02,
    color: "#ffffff",
    transparent: true,
    opacity: 0.8
});

const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

// Seleziona elementi HTML
const title = document.querySelector(".title");
const button = document.querySelector(".button");

let mouseX = 0, mouseY = 0;
let velocityX = 0, velocityY = 0;
let damping = 0.95;
let warpSpeed = 0.02;

// Funzione per interazione con mouse e touch
function updateMotion(event) {
    let x = ((event.clientX || event.touches[0].clientX) / window.innerWidth - 0.5) * 2;
    let y = ((event.clientY || event.touches[0].clientY) / window.innerHeight - 0.5) * 2;

    velocityX = (x - mouseX) * 0.1;
    velocityY = (y - mouseY) * 0.1;

    mouseX = x;
    mouseY = y;

    warpSpeed = Math.abs(velocityX) + Math.abs(velocityY) * 0.02 + 0.02; // Warp dinamico
}

// Aggiungi supporto per mouse e touch
document.addEventListener("mousemove", updateMotion);
document.addEventListener("touchmove", updateMotion);


let warpActive = false;


// Pulsante per attivare effetto warp
button.addEventListener("click", () => {
    warpActive = true;

    gsap.to(camera.position, {
        z: 20,
        duration: 2,
        ease: "power2.inOut",
        onComplete: () => {
            gsap.to(camera.position, {
                z: -20,
                duration: 1.5,
                ease: "power4.out",
                onComplete: () => {
                    camera.position.set(0, 0, -20);
                    warpActive = false; // Riattiva la normalità solo se vuoi
                }
            });
        }
    });
});





// Animazione del warp stellare
const animate = () => {
    requestAnimationFrame(animate);

    velocityX *= damping;
    velocityY *= damping;

    mouseX += velocityX;
    mouseY += velocityY;

    gsap.to(title, { x: mouseX * 50, y: mouseY * 30, duration: 0.6, ease: "power2.out" });
    gsap.to(button, { x: mouseX * 40, y: mouseY * 20, duration: 1, ease: "power2.out" });

    // Movimento warp delle stelle
    let positions = starGeometry.attributes.position.array;
    for (let i = 0; i < starCount * 3; i += 3) {
        positions[i + 2] += velocities[i + 2] * warpSpeed;

        if (positions[i + 2] > 0) {
            if (!warpActive) {
                positions[i + 2] = -10;
            } else {
                // Disperdile fuori dalla vista
                positions[i] = (Math.random() - 0.5) * 200;
                positions[i + 1] = (Math.random() - 0.5) * 200;
                positions[i + 2] = -1000 - Math.random() * 500; // Più lontano e sparsi
            }
        }
    }
    starGeometry.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
};

animate();