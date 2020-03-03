export function log(str) {
    console.log(str);
}

export function drawLine(origin, direction, length) {
    let goal = new THREE.Vector3();
    goal.addVectors(origin, direction.multiplyScalar(length));
    let geometry = new THREE.Geometry();
    geometry.vertices.push(origin);
    geometry.vertices.push(goal);
    let material = new THREE.LineBasicMaterial({ color: 0xff0000 });
    let line = new THREE.Line(geometry, material);
    line.name = "line";
    scene.add(line);
}


