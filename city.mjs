import {log, drawLine} from './misc/fcn.mjs';

// Create scene and camera
var scene = new THREE.Scene();
var sceneCenter = new THREE.Vector3(0.0, 0.0, 0.0);
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.z = 200;

// Create a renderer
var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// Include controls for navigating the scene
var controls = new THREE.OrbitControls( camera, renderer.domElement );

// Create the floor of the scene
var geometry = new THREE.BoxGeometry(100, 100, 1);
var material = new THREE.MeshLambertMaterial( { color: 0x68443D } );
var cube = new THREE.Mesh( geometry, material );
scene.add( cube );

// Add directional light source to light the scene
var sun = new THREE.DirectionalLight('#FDFEFE', 1);
sun.position.set(0.0, 150.0, 0.0);
sun.lookAt(sceneCenter);
sun.name = "sun";
var sunSpeed = 10;   // degree/s
var phi = 0.0;      // Horizontal angle
var theta = 0.0;    // Vertical angle
scene.add(sun);

// Adds ambient light to the scene
scene.add(new THREE.AmbientLight(0x404040))


controls.update();

// Animates the scene.
let then = 0;
function animate(now=0) {
    requestAnimationFrame( animate );

    // Calculate delta time
    var dt = (now - then)/1000;
    then = now;

    // Move the sun with angular speed and delta time
    moveSun(dt*sunSpeed, true);

    controls.update();
    renderer.render( scene, camera);
}
animate();



/**
 * Moves the light in an orbit.
 * 
 * @param debug Flag to turn on print and camera helper lines
 * @param da Increment angle
 */
function moveSun(da, debug=false) {
    var sunPos = new THREE.Vector3(sun.position.x, sun.position.y, sun.position.z);
    var distance = sunPos.distanceTo(sceneCenter);

    phi += da;
    theta += (da);   // Moves twice as slow as phi

    if (360 < phi) {phi = 0;}
    if (360 < theta) {theta = 0;}

    var ax = distance * Math.cos( phi*Math.PI/180 );
    var ay = distance * Math.sin( phi*Math.PI/180 ) * Math.sin( theta*Math.PI/180 );
    var az = distance * Math.sin( phi*Math.PI/180 ) * Math.cos( theta*Math.PI/180 );

    // Debugging print and display camera helper
    if (debug) {
        console.log("\n\nDistance from sun to center: " + distance);
        console.log("Position\nx: " + ax + "\ny: " + ay + "\nz: " + az);
        console.log("Phi: " + phi + ", theta: " + theta)

        if (null == scene.getObjectByName("camHelper")) {
            var helper = new THREE.DirectionalLightHelper( sun, 5 );
            helper.name = "camHelper";
            scene.add( helper );
        }
    }

    sun.position.x = ax;
    sun.position.y = ay;
    sun.position.z = az;
    sun.lookAt(sceneCenter);
}