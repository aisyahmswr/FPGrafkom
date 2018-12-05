var scene, camera, renderer;

window.onload = function() {
    if (WEBGL.isWebGLAvailable()) {
        // Initiate function or other initializations here
        init();
        animate();
    } else {
        var warning = WEBGL.getWebGLErrorMessage();
        document.getElementById('container').appendChild(warning);
    }
}


function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

    camera.position.set(1, 0, 7);
    var ambientLight = new THREE.AmbientLight( 0x404040, 1 );
    scene.add( ambientLight );
    
    var light = new THREE.PointLight( 0xffffff, 10, 0);
    light.position.set( 3, 5, 0);
    scene.add( light );

   var cubeGeometry = new THREE.BoxGeometry();
   var cubeMaterial = new THREE.MeshStandardMaterial(); 

   var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
   scene.add(cube);

    console.log("Ready to render");
    
    renderer = new THREE.WebGLRenderer({canvas: document.getElementById('mainCanvas')});
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
}


function animate() {
    requestAnimationFrame( animate );

    renderer.render( scene, camera );
}