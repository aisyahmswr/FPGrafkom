var scene, camera, renderer, loop;
var cube, tunnel;
var xSpeed = 0.2, ySpeed = 0.2;
var moveRight = false, moveLeft = false, moveUp = false, moveDown = false;
var start = Date.now();

window.onload = function() {
    if (WEBGL.isWebGLAvailable()) {
        // Initiate function or other initializations here
        init();
        //animate();
    } else {
        var warning = WEBGL.getWebGLErrorMessage();
        document.getElementById('container').appendChild(warning);
    }
}


function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

    camera.position.set(0, 0, 7);
    var ambientLight = new THREE.AmbientLight( 0x404040, 1 );
    scene.add( ambientLight );
    loop = new THREEx.RenderingLoop();

    
    var light = new THREE.PointLight( 0xffffff, 5, 0);
    light.position.set( 3, 5, 0);
    scene.add( light );

    var ambientLight = new THREE.AmbientLight();
    scene.add(ambientLight);

   var cubeGeometry = new THREE.BoxGeometry(1, 1);
   var cubeMaterial = new THREE.MeshStandardMaterial(); 

   var tunnelGeometry = new THREE.CylinderBufferGeometry(5, 5, 10, 20, 1, true);

   var uniforms = {
       delta: {value: 0},
       time: {type: "f", value: 0.0}
   }

   var shaderMaterial = new THREE.ShaderMaterial({
       //wireframe: true,
       side: THREE.DoubleSide,
       uniforms: uniforms,
       vertexShader : document.getElementById('vertexShader').textContent,
       fragmentShader : document.getElementById('fragmentShader').textContent
   });

   var vertexDisplacement = new Float32Array(tunnelGeometry.attributes.position.count);
   for (var i = 0; i < vertexDisplacement.length; i += 1) {
        vertexDisplacement[i] = Math.sin(i);
   }

   tunnelGeometry.addAttribute('vertexDisplacement', new THREE.BufferAttribute(vertexDisplacement, 1));

   
   var tunnelMaterial = new THREE.MeshPhongMaterial({
       color: 0x4040f0,
       side: THREE.DoubleSide
   });

   cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
   scene.add(cube);

   tunnel = new THREE.Mesh(tunnelGeometry, shaderMaterial);
   scene.add(tunnel);
   tunnel.openEnded = true;
   tunnel.rotation.set(99, 0, 0);
   //tunnel.position.set(0, 0, 7.8);
   console.log(tunnel);
   

    console.log("Ready to render");
    
    document.addEventListener("keydown", onDocumentKeyDown, false);
    document.addEventListener("keyup", onDocumentKeyUp, false);
   
    renderer = new THREE.WebGLRenderer({canvas: document.getElementById('mainCanvas')});
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );

    var shaderDelta = 0;

    loop.add(function(delta){
        shaderDelta += 0.1;
        tunnel.material.uniforms.delta.value = 1 + Math.sin(shaderDelta) * 0.3;
        tunnel.material.uniforms.time.value = 0.00025 * (Date.now()  - start);

        //cube.rotation.x += 0.1;
        if(moveUp && cube.position.y < 3.6) cube.position.y += ySpeed;
        if(moveDown && cube.position.y > -3.6) cube.position.y -= ySpeed;
        
        if(moveLeft && cube.position.x > -3.6) cube.position.x -= xSpeed;
        if(moveRight  && cube.position.x < 3.6) cube.position.x += xSpeed;

        //console.log(cube.position.y);
        //tunnel.rotation.y += 0.05;
    
        renderer.render( scene, camera );
    });
   
    loop.start();
}

function onDocumentKeyDown(event) {
    var keyCode = event.which;
    if (keyCode == 87) {
        moveUp = true;
    } else if (keyCode == 83) {
        moveDown = true;
    } else if (keyCode == 65) {
        moveLeft = true;
    } else if (keyCode == 68) {
        moveRight = true;
    } else if (keyCode == 32) {
        cube.position.set(0, 0, 0);
    }
};

function onDocumentKeyUp(event) {
    var keyCode = event.which;
    if (keyCode == 87) {
        moveUp = false;
    } else if (keyCode == 83) {
        moveDown = false;
    } else if (keyCode == 65) {
        moveLeft = false;
    } else if (keyCode == 68) {
        moveRight = false;
    } else if (keyCode == 32) {
        cube.position.set(0, 0, 0);
    }
};