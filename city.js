// Create scene and camera
var scene = new THREE.Scene();
var sceneCenter = new THREE.Vector3(0.0, 0.0, 0.0);
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 10000 );
camera.position.x = 500;
camera.position.y = 500;
camera.position.z = 500;

// Create a renderer
var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// Include controls for navigating the scene
var controls = new THREE.OrbitControls( camera, renderer.domElement );

// Object to load
var obj;
var texture;

var mouse = new THREE.Vector3();

// Add directional light source to light the scene
var sun = null;
var sunSpeed = 1;   // degree/s
var phi = 45.0;      // Horizontal angle
var theta = 45.0;    // Vertical angle
addSun();

loadEnvironment();



var bars = {
    active: false,
    add: false
}

//document.addEventListener('mousedown', onDocumentMouseDown, false);
renderer.domElement.addEventListener('click', onDocumentMouseDown, false);
//renderer.domElement.addEventListener('touchstart', onDocumentMouseDown, false);
window.addEventListener('resize', onResize, false);


//The X axis is red. The Y axis is green. The Z axis is blue.
//var axesHelper = new THREE.AxesHelper( 500 );
//scene.add( axesHelper );

controls.update();
// Animates the scene.
let then = 0;
function animate(now=0) {
    requestAnimationFrame( animate );

    // Calculate delta time
    var dt = (now - then)/1000;
    then = now;

    // Move the sun with angular speed and delta time
    moveSun(dt*sunSpeed, false);

    controls.update();
    renderer.render( scene, camera);

    updateBars().then();
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

// To load models and apply texture
function loadModel() {

    obj.traverse( function ( child ) {

        if ( child.isMesh ) child.material.map = texture;

    } );

    obj.position.x = addBuilding.x;
    obj.position.y = addBuilding.y;
    obj.position.z = addBuilding.z;
    console.log(obj);
    obj.children[0].geometry.computeBoundingBox();
    scene.add( obj );
}

var addBuilding = {
    x:0,
    y:0,
    z:0,
    scale:1,
    objPath:'./models/environment.obj', 
    texPath:'./models/envTex.jpg',
    active:false
};

function onDocumentMouseDown( event ) {
    event.preventDefault();
    var mouse_ray = new THREE.Raycaster();

    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    if (NaN == mouse.x) {
        mouse.x = ( event.touches[0].pageX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( event.touches[0].pageY / window.innerHeight ) * 2 + 1;
    }
    alert("X: " + mouse.x + " Y: " + mouse.y);
    
    mouse_ray.setFromCamera( mouse, camera );
    
    let intersections = mouse_ray.intersectObjects( scene.children , true );
    console.log(intersections);
    if (0 < intersections.length) {
        let point = intersections[0].point;
        addBuilding.x = point.x;
        addBuilding.y = point.y;
        addBuilding.z = point.z;
        
        if (addBuilding.active) {
            loadObject(addBuilding.objPath, addBuilding.texPath, true);
        } else if (deleteActive && "EXPORT_GOOGLE_SAT_WM" !== intersections[0].object.name) {
            var o = intersections[0].object.uuid;
            var o = scene.getObjectByProperty('uuid', o)
            o.parent.remove(o)
            o.geometry.dispose();
            o.material.dispose();
        } else if(skyVis) {
            findSkyVis(intersections[0].point);
        } else if(landmark.active) {
            if ("building" === intersections[0].object.name){
                landmark.uuid = intersections[0].object.uuid;
            }else if ("building" === intersections[0].object.parent.name) {
                landmark.uuid = intersections[0].object.parent.uuid;
            }
        } else if(bars.add) {
            addBars(intersections[0].point);
        }
    }
    //console.log(scene);
}



function loadObject(objPath='./models/city2.obj', texPath='./models/city2.png', building=false) {
    var manager = new THREE.LoadingManager( loadModel );
    
    manager.onProgress = function ( item, loaded, total ) {
    
        console.log( item, loaded, total );
    
    };
    
    var textureLoader;
    
    textureLoader= new THREE.TextureLoader( manager );
    
    texture = textureLoader.load(texPath);
    
    var loader = new THREE.OBJLoader( manager );
    
    loader.load( objPath, function ( object ) {
        obj = object;
        if (building) {
            obj.name = "building";
            obj.scale.y = (Math.random() + 1);
        } else {
            obj.name = "environment"
        }
    });
}


function buildingFarmHouse() {
    addBuilding.objPath='./models/houses/farmhouse.obj';
    addBuilding.texPath='./models/houses/farmhouse.jpg';
    addBuilding.active = true;
}

function cityBuilding() {
    addBuilding.objPath='./models/houses/city.obj';
    addBuilding.texPath='./models/houses/city.jpg';
    addBuilding.active = true;
}

function cityBuilding2() {
    addBuilding.objPath='./models/houses/city.obj';
    addBuilding.texPath='./models/houses/city2.jpg';
    addBuilding.active = true;
}

function cityBuilding3() {
    addBuilding.objPath='./models/houses/city.obj';
    addBuilding.texPath='./models/houses/city3.jpg';
    addBuilding.active = true;
}

function cityBuilding4() {
    addBuilding.objPath='./models/houses/city.obj';
    addBuilding.texPath='./models/houses/city4.jpg';
    addBuilding.active = true;
}

function buildingCancel() {
    if(addBuilding.active) {
        addBuilding.active= false;
    } else{
        addBuilding.active= true;
    }
}

var deleteActive = false;
function buildingDelete() {
    if (deleteActive) {
        deleteActive = false;
    } else {
        deleteActive = true;
    }
}

function sceneSave() {
    console.log(scene);
    // Instantiate a exporter
    var exporter = new THREE.GLTFExporter();



    // Parse the input and generate the glTF output
    exporter.parse( scene, function ( gltf ) {
        download(gltf, 'scene.txt', 'text/plain');
    }, {trs: false,
        onlyVisible: true,
        truncateDrawRange: true,
        binary: false,
        forceIndecies: false,
        forcePowerOfTwoTextures: false,
        embedImages: true
    });
}

function download(content, fileName, contentType) {
    var a = document.createElement("a");
    var jsn = JSON.stringify(content);
    var file = new Blob([jsn], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}

function sceneLoad(file) {
    for(var i=scene.children.length - 1; i>=0; i--){
        if ("building"===scene.children[i].name){
            scene.remove(scene.children[i]);
        }
    }

    var sceneLoader = new THREE.GLTFLoader();

    sceneLoader.parse(file,"./models/houses", function (o) {
        var children = o.scene.children;
        console.log(o);
        for (i in children) {
            if ("building" === children[i].name) 
            {
                console.log(children[i]);
                scene.add(children[i]);
            }
        }
    });
}

var skyVis = false;
function toggleSkyVis() {
    if (skyVis) {
        skyVis = false;
    } else {
        skyVis = true;
    }
}


function findSkyVis(point, msg=true, line=true, degreeJump=10, vert=360, hor=90) {
    // Save time
    var t0 = performance.now();
    var sScore = 0;
    var nRays = 0;

    sScore = 0;
    for (i=0; i < hor; i+=degreeJump) {        // Horizontal angle
        for (j=0; j < vert; j+=degreeJump) {      // Vertical angle
            var x = Math.sin(i*Math.PI/180) * Math.cos(j*Math.PI/180);
            var y = Math.sin(i*Math.PI/180) * Math.sin(j*Math.PI/180);;
            var z = Math.cos(i*Math.PI/180);

            var direction = new THREE.Vector3(x, z, y);    // Ray direction
            var origin = new THREE.Vector3(point.x, point.y, point.z);       // Clicked pos
            var ray = new THREE.Raycaster(origin, direction, 0.1, 1000);
            nRays += 1;
            var intersects = ray.intersectObjects(scene.children, true);
            // Increase sScore
            if (0 < intersects.length) {
                if (line) {
                    var d = origin.distanceTo(intersects[0].point);
                    createLine(origin, direction, d);
                }
                sScore += 1;
            }
        }
    }
    sScore = (nRays - sScore)/(nRays);
    if (msg) {
        alert("sScore: " + Math.round((sScore)*100) + "%\nTime: " + Math.round(performance.now() - t0) + "ms\nRays: " + (nRays));
    } else {
        return sScore;
    }
}

// Print line code is originally written by Bjørnar Longva
let createLine = function(origin, dir, length) {
    let o = origin.clone();
    let goal = new THREE.Vector3();
    goal.addVectors(o, dir.multiplyScalar(length));
    let geometry = new THREE.Geometry();
    geometry.vertices.push(o);
    geometry.vertices.push(goal);
    let material = new THREE.LineBasicMaterial({ color: 0xff0000 });
    let line = new THREE.Line(geometry, material);
    line.name = "line";
    scene.add(line);
}

// Delete all lines with name line from the scene
function removeLine() {
    for( var i = scene.children.length - 1; i >= 0; i--) {
        child = scene.children[i];
        if ("line" === child.name) {
            scene.remove(scene.children[i]);
        }
    }
    renderer.render(scene, camera);
}

function addSun() {
    sun = new THREE.DirectionalLight('#FDFEFE', .5);
    sun.position.set(0.0, 700.0, 0.0);
    sun.lookAt(sceneCenter);
    sun.name = "sun";
    scene.add(sun);
    scene.add(new THREE.AmbientLight(0x404040));

}

var landmark = {
    active: false,
    uuid: null,
};
function toggleLandmark() {
    if (landmark.active) {
        landmark.active = false;
    } else {
        landmark.active = true;
    }
}

function landmarkVis(vert=360, hor=360) {
    if (null === landmark.uuid) {
        alert("No landmark selected!");
    } else {
        var lm = scene.getObjectByProperty("uuid", landmark.uuid);
        var point = lm.position;
        // Save time
        var t0 = performance.now();
        var lScore = 0;
        var nRays = 0;
        var hitBuildings = [lm.uuid];
    
        lScore = 0;
        for (i=0; i < hor; i+=10) {        // Horizontal angle
            for (j=0; j < vert; j+=10) {      // Vertical angle
                var x = Math.sin(i*Math.PI/180) * Math.cos(j*Math.PI/180);
                var y = Math.sin(i*Math.PI/180) * Math.sin(j*Math.PI/180);;
                var z = Math.cos(i*Math.PI/180);
    
                var direction = new THREE.Vector3(x, z, y);    // Ray direction
                var origin = new THREE.Vector3(point.x, point.y, point.z);       // Clicked pos
                var ray = new THREE.Raycaster(origin, direction, 0.1, 500);
                nRays += 1;
                
                var intersects = ray.intersectObjects(scene.children, true);
                
                // Increase lScore
                if (0 < intersects.length) {
                    var hit = intersects[0].object;
                    if (("building"=== hit.name || "building"=== hit.name.parent) && !(hitBuildings.includes(hit.uuid))) {
                        var d = origin.distanceTo(intersects[0].point);
                        hitBuildings.push(hit.uuid);
                        createLine(origin, direction, d);
                        lScore += 1;
                    }
                }
            }
        }
        var result = "Buildings hit: " + lScore + "\nTime: " + Math.round(performance.now() - t0) + "ms\nRays: " + (nRays);
        console.log(result)
        alert(result);
    }
}

function indicateLandmark(){
    if (null === landmark.uuid) {
        alert("No landmark selected!");
    } else {
        alert("New landmark selected");
    }
}
function toggleBars() {
    if (bars.add) {
        bars.add = false;
    } else {
        bars.add = true;
    }
}
function removeBars() {
    bars.active = false;
    for (i = 0; i<scene.children.length; i++) {
        const j = i;
        if ("bar" === scene.children[j].name) {
            scene.remove(scene.children[j]);
        }
    }
}

var barSize={
    x: 10,
    y: 100,
    z: 10
}

async function updateBars() {
    scene.traverse(function(element){
        if ("bar" === element.name) {
            var height = findSkyVis(element.position, false, false, 45);
            if (.5 > height) {
                height = .5;
            } else if (1 < height){
                height = 1;
            }
            element.scale.y = height;
        }
    });
}

function addBars(coord) {
    bars.active = true;
    height = 2*barSize.y;
    var geometry = new THREE.BoxGeometry(barSize.x, height, barSize.z);
    geometry.applyMatrix( new THREE.Matrix4().makeTranslation(0, barSize.y, 0 ) );
    var material = new THREE.MeshBasicMaterial( {color: 0x00ff00, opacity: 0.3} );
    material.transparent = true;
    var cube = new THREE.Mesh( geometry, material );
    cube.name="bar";
    cube.position.set(coord.x, coord.y, coord.z);
    scene.add( cube );
}

function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function loadEnvironment() {
    var loader = new THREE.GLTFLoader();

    loader.load(
        'models/blender/stavanger.glb',
        function(gltf) {
            for (i in gltf.scene.children) {
                if (/^[0-9]*$/.test(gltf.scene.children[i].name)) {
                    gltf.scene.children[i].name = "building";
                }
            }
            console.log(gltf);
            scene.add(gltf.scene);

            
            
            gltf.scene; // THREE.Group
            gltf.scenes; // Array<THREE.Group>
            gltf.asset; // Object
        },
        function ( xhr ) {

            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    
        },
        // called when loading has errors
        function ( error ) {
    
            console.log( 'An error happened' );
    
        }
    );
}