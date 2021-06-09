// import modules
import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r127/three.module.js';
import {OrbitControls} from 'https://unpkg.com/three@0.119.0/examples/jsm/controls/OrbitControls.js';
import { FirstPersonControls } from 'https://unpkg.com/three@0.119.0/examples/jsm/controls/FirstPersonControls.js';

//declare variables
let camera, scene, renderer, controls;

const clock = new THREE.Clock();

//Create Scene
scene = new THREE.Scene();
scene.background = new THREE.Color(0xefd1b5);
scene.fog = new THREE.FogExp2( 0x000000, 0.0015 );

// camera
// PerspectiveCamera( fov : Number, aspect : Number, near : Number, far : Number )
camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1.0, 10000);
//camera.position.set(0,30,0);
camera.position.set(0,50,500);
// camera.position.z -= 500
// camera.position.y -= 50



//light
let ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

let dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(-30, 50, -30);
scene.add(dirLight);

// renderer - do I need autoSize??
renderer = new THREE.WebGLRenderer({ antialias: true, autoSize: true });
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement); //is this instead of having the canvas in the html?

//Window resize
function onWindowResize() { 
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
	//controls.handleResize();
}
window.addEventListener('resize', onWindowResize);

//Orbit controls
// let orbitControls = new OrbitControls(camera, renderer.domElement);

// floor
const helper = new THREE.GridHelper( 1000, 10, 0x444444, 0x444444 );
helper.position.y = 0.1;
scene.add( helper );
//Geometry
//PlaneGeometry(width : Float, height : Float, widthSegments : Integer, heightSegments : Integer)
const planeGeometry = new THREE.PlaneGeometry(1000, 1000, 1, 1);
const planeMaterial = new THREE.MeshBasicMaterial({color: 0x44aa88, side: THREE.DoubleSide});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
plane.userData.ground = true;

scene.add(plane);

// box
const boxGeometry = new THREE.BoxGeometry(30, 30, 30);
const boxMaterial = new THREE.MeshPhongMaterial({color: 0x00ff00});
const box = new THREE.Mesh(boxGeometry, boxMaterial);
box.position.y = 15
scene.add(box);
box.userData.clickable = true;
box.userData.name = 'box';

// sphere
const sphereGeometry = new THREE.SphereGeometry(20, 20, 20);
const sphereMaterial = new THREE.MeshPhongMaterial({color: 0x00ff00});
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphere.position.y += 20;
sphere.position.z += 50;
scene.add( sphere );

//squareplane
let squareWidth = 50;
let squareHeight = 50;
const squarePlaneGeometry = new THREE.PlaneGeometry(squareWidth, squareHeight, 1, 1);
const squarePlaneMaterial = new THREE.MeshBasicMaterial({color: 0x588ce0, side: THREE.DoubleSide});
const squarePlane = new THREE.Mesh(squarePlaneGeometry, squarePlaneMaterial);
squarePlane.rotation.x = -Math.PI / 2;
//squarePlane.position.y += 1;
squarePlane.position.set(100, .5, 100);
scene.add(squarePlane);

document.addEventListener('keydown', (event) => {
	switch(event.key) {
		case 'ArrowLeft':
			sphere.position.x -= 5;
			break;
		case 'ArrowRight':
			sphere.position.x += 5;
			break;
		case 'ArrowUp':
			sphere.position.z -= 5;
			break;
		case 'ArrowDown':
			sphere.position.z += 5;
			break;
	}
})

// first person controls
controls = new FirstPersonControls(camera, renderer.domElement);
controls.movementSpeed = 70;
controls.lookSpeed = 0.075;
controls.noFly = true;
controls.lookVertical = false;

const raycaster = new THREE.Raycaster();
const clickMouse = new THREE.Vector2(); //2d vector containing x & y pos (of mouse)
const moveMouse = new THREE.Vector2(); //info on last mouse movement pos
let clickable = new THREE.Object3D; //last selected object

function intersect(pos = THREE.Vector2) {
	raycaster.setFromCamera(pos, camera);
	return raycaster.intersectObjects(scene.children);
  }
// when user clicks, if an object has been previously selected (clickable object is not null), unselect object (set clickable to null)
window.addEventListener('click', event => {
	if (clickable != null) {
		console.log(`dropped clickable ${clickable.userData.name}`);
		// box x & z positions
		console.log(`box x: ${box.position.x}`);
		console.log(`box z: ${box.position.z}`);

		// square plane x & z positions
		console.log(`sqaure x : ${squarePlane.position.x - squareWidth/2} -  ${squarePlane.position.x + squareWidth/2}`);
		console.log(`sqaure z : ${squarePlane.position.z - squareHeight/2} -  ${squarePlane.position.z + squareHeight/2}`);
		clickable = null;

		return;
		
	}

	if(box.position.x  > (squarePlane.position.x - squareWidth/2) && box.position.x < (squarePlane.position.x + squareWidth/2) && box.position.z > (squarePlane.position.z - squareHeight/2) && box.position.z < (squarePlane.position.z + squareHeight/2)) {

		console.log('box is in squarePlane bounds');
		//scene.background = new THREE.Color(0x349ceb);
	}

	//normalise to -1 / +1 x & y position
	clickMouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	clickMouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

	// raycaster.setFromCamera(clickMouse, camera);

	const found = intersect(clickMouse); //calculate intersecting objects in scene
	if (found.length > 0) {
		clickable = found[0].object;
		console.log(`found clickable ${clickable.userData.name}`);
		// box.position.x += 5;
	}
})

window.addEventListener('mousemove', event => {
	moveMouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	moveMouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
})

function dragObject() {
	if (clickable != null) {
		const found = intersect(moveMouse);
		//check if mouse has moved over floor
		//iterate over intersected objects
		if (found.length > 0) {
			for (let i = 0; i < found.length; i++) {
				if (!found[i].object.userData.ground)
				continue

				let target = found[i].point;
				clickable.position.x = target.x;
				clickable.position.z = target.z;
			}
		}
	}
}

function animate() {

	dragObject();
	renderer.render(scene,camera);
	requestAnimationFrame(animate);

	controls.update(clock.getDelta());
	camera.add(sphere);

	
}

animate();
