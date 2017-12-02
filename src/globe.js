var Shaders = {

	'earth' : {

		uniforms: {

			"texture": { type: "t", value: 0, texture: null }

		},

		vertexShader: [

			"varying vec3 vNormal;",
			"varying vec2 vUv;",

			"void main() {",

				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

				"vNormal = normalize( normalMatrix * normal );",
				"vUv = uv;",

			"}"

		].join("\n"),

		fragmentShader: [

			"uniform sampler2D texture;",

			"varying vec3 vNormal;",
			"varying vec2 vUv;",

			"void main() {",

				"vec3 diffuse = texture2D( texture, vUv ).xyz;",
				"float intensity = 1.05 - dot( vNormal, vec3( 0.0, 0.0, 1.0 ) );",
				"vec3 atmosphere = vec3( 1.0, 1.0, 1.0 ) * pow( intensity, 3.0 );",

				"gl_FragColor = vec4( diffuse + atmosphere, 1.0 );",

			"}"

		].join("\n")

	},

	'atmosphere' : {

		uniforms: {},

		vertexShader: [

			"varying vec3 vNormal;",

			"void main() {",

				"vNormal = normalize( normalMatrix * normal );",
				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"

		].join("\n"),

		fragmentShader: [

			"varying vec3 vNormal;",

			"void main() {",

				"float intensity = pow( 0.8 - dot( vNormal, vec3( 0.0, 0.0, 1.0 ) ), 12.0 );",
				"gl_FragColor = vec4( 1.0, 1.0, 1.0, 1.0 ) * intensity;",

			"}"

		].join("\n")

	}

};



//plotData();

var container, stats;
var camera, scene, sceneAtmosphere, renderer;
var vector, mesh, atmosphere, point, points, pointsGeometry, earth;

var mouse = { x: 0, y: 0 }, mouseOnDown = { x: 0, y: 0 };
var rotation = { x: 0, y: 0 }, target = { x: 0, y: 0 }, targetOnDown = { x: 0, y: 0 };
var distance = 1500;
var distanceTarget = 900;

var PI_HALF = Math.PI / 2;

container = document.getElementById( 'container' );

init();
plotData();
animate();

function init() {

	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 30, window.innerWidth/window.innerHeight, 1, 10000 );

	var geometry = new THREE.SphereGeometry(200, 40, 30);
	var shader = Shaders[ 'earth' ];
	var uniforms = THREE.UniformsUtils.clone( shader.uniforms );

	material = new THREE.MeshBasicMaterial( { color: 0xffffff } );

	material.map    = new THREE.TextureLoader().load('world.jpg')
	earth = new THREE.Mesh( geometry, material );
	scene.add( earth );

	// geometry = new THREE.CubeGeometry( 0.75, 0.75, 1 );
	// for ( var i = 0; i < geometry.vertices.length; i ++ ) {
	// 	var vertex = geometry.vertices[ i ];
	// 	vertex.z += 0.5;
    //
	// }

	// point = new THREE.Mesh( geometry );

	pointsGeometry = new THREE.Geometry();

	camera.position.z = distanceTarget;

	renderer = new THREE.WebGLRenderer( /* { antialias: false } */ );
	renderer.setSize( window.innerWidth, window.innerHeight );

	container.appendChild( renderer.domElement );

	document.addEventListener( 'mousedown', onDocumentMouseDown, false );
	//document.addEventListener( 'mousewheel', onDocumentMouseWheel, false );

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

	var color = random_rgba();
    // points = new THREE.Mesh( pointsGeometry, new THREE.MeshBasicMaterial( { color: 0xffffff, vertexColors: THREE.FaceColors } ) );

    points = new THREE.Mesh(pointsGeometry, new THREE.MeshBasicMaterial( { color: color, vertexColors: THREE.FaceColors } ));

    for (var i = 0, l = data.length; i < l; i++) {

		lat = data[i][1];
		lng = data[i][2];
		size = data[i][0];
		color = new THREE.Color();
		color.setHSL( ( 0.6 - ( size * 1.6 ) ), 1.0, 1.0 ); // column color

		addPoint(lat, lng, size * 100, color); // column size
	}

    scene.add(points);
}

function addPoint(lat, lng, size, color) {

    var phi = (90 - lat) * Math.PI / 180;
    var theta = (0 - lng) * Math.PI / 180;

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

function onWindowResize( event ) {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

function onDocumentMouseMove( event ) {

	mouse.x = - event.clientX;
	mouse.y = event.clientY;

	target.x = targetOnDown.x + ( mouse.x - mouseOnDown.x ) * 0.005;
	target.y = targetOnDown.y + ( mouse.y - mouseOnDown.y ) * 0.005;

	target.y = target.y > PI_HALF ? PI_HALF : target.y;
	target.y = target.y < - PI_HALF ? - PI_HALF : target.y;

}

function onDocumentMouseUp( event ) {

	document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
	document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
	document.removeEventListener( 'mouseout', onDocumentMouseOut, false );

	container.style.cursor = 'auto';

}

function onDocumentMouseOut( event ) {

	document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
	document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
	document.removeEventListener( 'mouseout', onDocumentMouseOut, false );

}

function onDocumentMouseDown( event ) {

	event.preventDefault();

	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	document.addEventListener( 'mouseup', onDocumentMouseUp, false );
	document.addEventListener( 'mouseout', onDocumentMouseOut, false );

	mouseOnDown.x = - event.clientX;
	mouseOnDown.y = event.clientY;

	targetOnDown.x = target.x;
	targetOnDown.y = target.y;

	container.style.cursor = 'move';

}
