


//plotData();

var container, stats;
var camera, scene, sceneAtmosphere, renderer;
var vector, mesh, atmosphere, point, points, pointsGeometry, earth;

var mouse = { x: 0, y: 0 }, mouseOnDown = { x: 0, y: 0 };
var rotation = { x: 0, y: 0 }, target = { x: 0, y: 0 }, targetOnDown = { x: 0, y: 0 };
var distance = 1500;
var distanceTarget = 900;

var segments = 155; // number of vertices. Higher = better mouse accuracy

var PI_HALF = Math.PI / 2;

var raycaster = new THREE.Raycaster();
var mouseVector = new THREE.Vector2();

let locationObjects = [];

container = document.getElementById( 'container' );

init();
plotData();
animate();

function init() {

	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 30, window.innerWidth/window.innerHeight, 1, 10000 );

	var geometry = new THREE.SphereGeometry(200, 40, 30);

	//material = new THREE.MeshBasicMaterial( { color: 0xffffff } );

	var texture   = new THREE.TextureLoader().load('night.jpg')
	material = new THREE.ShaderMaterial({  
	  uniforms: {"texture": { type: "t", value: texture }},
	  vertexShader: document.getElementById('vertexShader').textContent,
	  fragmentShader: document.getElementById('fragmentShader').textContent
	});
	earth = new THREE.Mesh( geometry, material );
	scene.add( earth );

	pointsGeometry = new THREE.Geometry();

	camera.position.z = distanceTarget;

	renderer = new THREE.WebGLRenderer( /* { antialias: false } */ );
	renderer.setSize( window.innerWidth, window.innerHeight );

	container.appendChild( renderer.domElement );

	document.addEventListener( 'mousedown', onDocumentMouseDown, false );
	document.addEventListener( 'mousewheel', onDocumentMouseWheel, false );

	window.addEventListener( 'resize', onWindowResize, false );

}

function animate() {

	requestAnimationFrame( animate );
	render();
}


function random_rgba() {
    var o = Math.round, r = Math.random, s = 255;
    return 'rgba(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ',' + r().toFixed(1) + ')';
}

function plotData() {

	var lat, lng, size, color;

	var color = 0xffff90;
    // points = new THREE.Mesh( pointsGeometry, new THREE.MeshBasicMaterial( { color: 0xffffff, vertexColors: THREE.FaceColors } ) );

    points = new THREE.Mesh(pointsGeometry, new THREE.MeshBasicMaterial( { color: color, vertexColors: THREE.FaceColors } ));

    for (var i = 0, l = data.length; i < l; i++) {

		lat = data[i][1];
		lng = data[i][2];
		size = data[i][0];
		color = new THREE.Color();
		color.setHSL( ( 0.6 - ( size * 1.6 ) ), 1.0, 1.0 ); // column color

		let point = addPoint(lat, lng, size * 100, color); // column size
		locationObjects.push(point);
	}

    scene.add(points);
}

function addPoint(lat, lng, size, color) {

    var phi = (90 - lat) * Math.PI / 180;
    var theta = (0 - lng) * Math.PI / 180;

    var radius = 1;
    var height = 1;
    var segments = 10;

    // geometry = new THREE.CylinderGeometry(radius, radius, height, segments, segments);
    // geometry.
    geometry = new THREE.CubeGeometry(0.75, 0.75, 1);
    for (var i = 0; i < geometry.vertices.length; i++) {
        var vertex = geometry.vertices[i];
        vertex.z += 0.5;
    }

    point = new THREE.Mesh(geometry);

    // position
	point.position.x = 200 * Math.sin(phi) * Math.cos(theta);
	point.position.y = 200 * Math.cos(phi);
	point.position.z = 200 * Math.sin(phi) * Math.sin(theta);

	// rotation
	point.lookAt(earth.position);

	// scaling
	point.scale.x = size;
    point.scale.y = size;
    point.scale.z = -size * 0.2;
	point.updateMatrix();

	// color
	for (var i = 0; i < point.geometry.faces.length; i++) {
		point.geometry.faces[i].color = color;
	}

	pointsGeometry.merge(point.geometry, point.matrix);

	return(point);
}

function render() {

	rotation.x += ( target.x - rotation.x ) * 0.05;

	rotation.y += ( target.y - rotation.y ) * 0.05;
	distance += ( distanceTarget - distance ) * 0.05;

	camera.position.x = distance * Math.sin( rotation.x ) * Math.cos( rotation.y );
	camera.position.y = distance * Math.sin( rotation.y );
	camera.position.z = distance * Math.cos( rotation.x ) * Math.cos( rotation.y );

	camera.lookAt(0, 0, 0);

	/*
	// Do not render if camera hasn't moved.

	if ( vector.distanceTo( camera.position ) == 0 ) {
		return;
	}

	vector.copy( camera.position );
	*/

	renderer.clear();
	renderer.render( scene, camera );
	//renderer.render( sceneAtmosphere, camera );
}

