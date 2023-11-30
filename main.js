import * as THREE from 'three';

import { AsciiEffect } from 'three/addons/effects/AsciiEffect.js';
import { PeppersGhostEffect } from 'three/addons/effects/PeppersGhostEffect.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// CANVAS TEXTURE

function createCanvasTexture() {
	const canvas = document.createElement('canvas');
	canvas.width = 128;
	canvas.height = 128;

	const context = canvas.getContext('2d');
	const gradient = context.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2);
	gradient.addColorStop(0.1, 'rgba(210,210,210,1)');
	gradient.addColorStop(1, 'rgba(255,255,255,1)');

	context.fillStyle = gradient;
	context.fillRect(0, 0, canvas.width, canvas.height);

	const shadowTexture = new THREE.CanvasTexture(canvas);

	const shadowMaterial = new THREE.MeshBasicMaterial({ map: shadowTexture });

	return shadowMaterial
}

const texture = createCanvasTexture()

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);

camera.position.z = 1000;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

let effect = new AsciiEffect(renderer, ' @.:-+*=%@#', { invert: true });
effect.setSize(window.innerWidth, window.innerHeight);
effect.domElement.style.color = 'white';
effect.domElement.style.backgroundColor = 'black';

// document.body.appendChild(effect.domElement);

const loader = new GLTFLoader();

let modelContainer = undefined

let loaded = false

let ROTYMODEL = 3 * Math.PI / 2

let params = {
	wireframe: false
}

const shadowGeo = new THREE.PlaneGeometry(300, 300, 1, 1);

let shadowMesh;

shadowMesh = new THREE.Mesh(shadowGeo, texture);
shadowMesh.position.y = - 450;
shadowMesh.rotation.x = - Math.PI / 2;
scene.add(shadowMesh);

shadowMesh = new THREE.Mesh(shadowGeo, texture);
shadowMesh.position.y = - 450;
shadowMesh.position.x = - 400;
shadowMesh.rotation.x = - Math.PI / 2;
scene.add(shadowMesh);

shadowMesh = new THREE.Mesh(shadowGeo, texture);
shadowMesh.position.y = - 450;
shadowMesh.position.x = 400;
shadowMesh.rotation.x = - Math.PI / 2;
scene.add(shadowMesh);


loader.load('./models/lpo.glb', function (gltf) {
	let model = gltf.scene
	model.rotation.set(0, ROTYMODEL, 0)

	let a = 50

	model.scale.set(1 * a, 1 * a, 1 * a)

	model.traverse(function (obj) {
		if (obj.isMesh) {
			obj.material.wireframe = true
			// obj.material.vertexcolors = true
			// obj.alphahash = true
			// obj.castShadows = true

			console.log(obj.material)

			// if (obj.material.map) {
			console.log('map')
			console.log(texture)

			texture.map.encoding = THREE.sRGBEncoding;
			texture.map.flipY = false;
			//replace the map with another THREE texture
			// obj.material = texture
			//update
			// obj.material.map.needsUpdate = true;
			// }
		}
	})

	modelContainer = model

	scene.add(model)

	loaded = true
})

let a = window.innerWidth * 0.008
let b = window.innerHeight * 0.006

const geometry = new THREE.BoxGeometry(a, b, 1);
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00, wireframe: false, flatShading: false, vertexColors: false });

let cubeContainer = createCube(material)

// scene.add(cubeContainer);

const materialA = new THREE.MeshStandardMaterial({ color: 0xccff00, wireframe: true, flatShading: false, vertexColors: false });
const materialB = new THREE.MeshStandardMaterial({ color: 0x0fffbb, wireframe: false, flatShading: true, vertexColors: false });
const materialC = new THREE.MeshStandardMaterial({ color: 0xcafdee, wireframe: false, flatShading: false, vertexColors: true });

const materials = [materialA, materialB, materialC];

function changeCube(material) {
	scene.remove(cubeContainer)

	cubeContainer = createCube(material)

	scene.add(cubeContainer)
}

function createCube(material) {
	const cube = new THREE.Mesh(geometry, material);
	return cube
}

const directionalLight = new THREE.PointLight(0xffffff, 3500000)
directionalLight.position.y = - 1000
directionalLight.position.z = 50

// scene.add(directionalLight)

function addLight() {
	scene.add(directionalLight)
}

function removeLight() {
	scene.remove(directionalLight)
}

function init() {
	window.addEventListener('resize', onWindowResize);
}

let pointer = {
	x: undefined,
	y: undefined
}

let pointerContainer = {
	x: pointer.x,
	y: pointer.y
}

window.addEventListener('mousemove', function (e) {
	pointer.x = (- e.clientX / this.innerWidth) * 2 + 1
	pointer.y = (- e.clientY / this.innerHeight) * 2 + 1

	console.log(pointer.x, pointer.y)
})


// setTimeout(rotateCube(), 10000)
// setTimeout(rotateModel(), 10000)

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);

}

function rotateCube() {
	cubeContainer.rotation.y = pointer.x * (Math.PI * 2) / 360 * 4
	cubeContainer.rotation.x = pointer.y * (Math.PI * 2) / 360 * 2.5

}

function rotateModel() {
	modelContainer.rotation.y = ROTYMODEL + (pointer.x * (Math.PI * 2) / 360 * 4)
	modelContainer.rotation.x = pointer.y * (Math.PI * 2) / 360 * 2.5
}

let iteration = 0
let iterationJ = 0

function animate() {

	iteration++

	if (iteration == 5) {

		addLight()

	}

	if (iteration == 40) {

		removeLight()

		// changeCube(materials[iterationJ]) 

		iteration = 0
		iterationJ++

		if (iterationJ > materials.length - 1) {
			iterationJ = 0
		}
	}

	if (loaded) {
		setTimeout(rotateModel(), 500)
	}


	// setTimeout(rotateCube(), 500)

	requestAnimationFrame(animate);
	renderer.render(scene, camera);
	effect.render(scene, camera);

}
animate();