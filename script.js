import * as THREE from 'three';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/GLTFLoader.js';


// =====================================================
// SCENE
// =====================================================

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x080a0d);
// =====================================================
// CAMERA
// =====================================================

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.001,
    1000
);

// Fixed camera position
camera.position.set(
    0,
    0.08,
    0.15
);

camera.lookAt(
    0,
    0.03,
    0
);


// =====================================================
// RENDERER
// =====================================================

const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.setPixelRatio(
    window.devicePixelRatio
);

document
    .getElementById("simulation")
    .appendChild(renderer.domElement);


// =====================================================
// LIGHTING
// =====================================================

// Soft overall illumination
const ambientLight = new THREE.AmbientLight(
    0xffffff,
    1.2
);

scene.add(ambientLight);


// Main light
const keyLight = new THREE.DirectionalLight(
    0xffffff,
    3.5
);

keyLight.position.set(
    3,
    5,
    4
);

keyLight.castShadow = true;

scene.add(keyLight);


// Cool blue fill light
const fillLight = new THREE.DirectionalLight(
    0x88aaff,
    1.2
);

fillLight.position.set(
    -4,
    2,
    1
);

scene.add(fillLight);


// Cyan rim light
const rimLight = new THREE.DirectionalLight(
    0x00ccff,
    2.5
);

rimLight.position.set(
    -2,
    4,
    -5
);

scene.add(rimLight);


// =====================================================
// GROUND / REFERENCE GRID
// =====================================================

const grid = new THREE.GridHelper(
    0.3,
    20,
    0x30343a,
    0x252930
);

scene.add(grid);




// =====================================================
// ORIENTATION VALUES
// =====================================================

// Yaw  = controlled by mouse
// Pitch = controlled by buttons

let yaw = 0;
let pitch = 0;

// =====================================================
// PITCH ASSEMBLY
// =====================================================

// This group rotates the ENTIRE mechanism for pitch.
// Its origin will be positioned at the SG90 shaft.

const pitchAssembly = new THREE.Group();

scene.add(pitchAssembly);


// =====================================================
// YAW ASSEMBLY
// =====================================================

// This contains only the parts that should respond
// to mouse movement.

const rotatingAssembly = new THREE.Group();

pitchAssembly.add(rotatingAssembly);

// =====================================================
// LOAD GLB
// =====================================================

const loader = new GLTFLoader();

loader.load(

    './models/GestureCam.glb',

    (gltf) => {

        const model = gltf.scene;

        model.traverse((object) => {

            if (object.isMesh) {

                object.castShadow = true;
                object.receiveShadow = true;

                if (object.material) {

                    object.material.roughness = 0.55;
                    object.material.metalness = 0.15;

                }

            }

        });

        scene.add(model);


        // =================================================
        // FIND ROTATING PARTS
        // =================================================

        const rotatingParts = [];

        let pivotObject = null;

        model.traverse((object) => {

            if (
                object.name &&
                object.name.startsWith("ROTATING_")
            ) {

                rotatingParts.push(object);

                console.log(
                    "ROTATING PART:",
                    object.name
                );

                const name =
                    object.name.toUpperCase();

                if (
                    name.includes("HORN") &&
                    !pivotObject
                ) {

                    pivotObject = object;

                }

            }

        });


        // =================================================
        // FIND SERVO SHAFT / PIVOT
        // =================================================

        const pivotPosition =
            new THREE.Vector3();


        if (pivotObject) {

            pivotObject.getWorldPosition(
                pivotPosition
            );

            console.log(
                "Using horn as pivot:",
                pivotObject.name
            );

        }

        else {

            console.warn(
                "No HORN object found."
            );

            pivotPosition.set(
                0,
                0,
                0
            );

        }


        console.log(
            "Pivot position:",
            pivotPosition
        );


        // =================================================
        // MOVE PITCH ASSEMBLY TO SHAFT
        // =================================================

        pitchAssembly.position.copy(
            pivotPosition
        );


        // =================================================
        // MOVE ENTIRE MODEL INTO PITCH ASSEMBLY
        // =================================================

        pitchAssembly.attach(model);


        // =================================================
        // ATTACH ROTATING PARTS TO YAW GROUP
        // =================================================

        for (
            const object of rotatingParts
        ) {

            rotatingAssembly.attach(
                object
            );

        }


        // =================================================
        // RESET ROTATIONS
        // =================================================

        pitchAssembly.rotation.set(
            0,
            0,
            0
        );

        rotatingAssembly.rotation.set(
            0,
            0,
            0
        );


        console.log(
            "Rotating parts:",
            rotatingParts.length
        );

        console.log(
            "3D model loaded successfully!"
        );

    },


    // =================================================
    // LOADING PROGRESS
    // =================================================

    (progress) => {

        if (progress.total) {

            const percentage =
                (
                    progress.loaded /
                    progress.total
                ) * 100;

            console.log(
                "Loading:",
                percentage.toFixed(1) + "%"
            );

        }

    },


    // =================================================
    // ERROR
    // =================================================

    (error) => {

        console.error(
            "Error loading 3D model:",
            error
        );

    }

);  

// =====================================================
// MOUSE CONTROL — YAW
// =====================================================

document.addEventListener(
    "mousemove",
    (event) => {

        // Horizontal mouse movement controls yaw.

        yaw +=
            event.movementX * 0.007;

    }
);


// =====================================================
// PITCH BUTTONS
// =====================================================

// 10 degree increments

const angleStep =
    THREE.MathUtils.degToRad(10);


// =====================================================
// PITCH -10°
// =====================================================

document
    .getElementById("pitchDown")
    .addEventListener(
        "click",
        () => {

            pitch -= angleStep;

        }
    );


// =====================================================
// PITCH 0°
// =====================================================

document
    .getElementById("pitchReset")
    .addEventListener(
        "click",
        () => {

            pitch = 0;

        }
    );


// =====================================================
// PITCH +10°
// =====================================================

document
    .getElementById("pitchUp")
    .addEventListener(
        "click",
        () => {

            pitch += angleStep;

        }
    );


// =====================================================
// ANIMATION LOOP
// =====================================================

function animate() {

    requestAnimationFrame(
        animate
    );

    // Pitch = entire mechanism
    pitchAssembly.rotation.x = pitch;

    // Yaw = ESP32-CAM/horn only
    rotatingAssembly.rotation.y = yaw;

    renderer.render(
        scene,
        camera
    );

}

animate();


// =====================================================
// WINDOW RESIZE
// =====================================================

window.addEventListener(
    "resize",
    () => {

        camera.aspect =
            window.innerWidth /
            window.innerHeight;

        camera.updateProjectionMatrix();

        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

    }
);