var scene, camera, renderer, loop;
var cube, tunnel;
var xSpeed = 0.1, ySpeed = 0.1;
var moveRight = false, moveLeft = false, moveUp = false, moveDown = false;
var start = Date.now();
var vertexDisplacement;
var particleGeometry, vertices = [];

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

   var tunnelGeometry = new THREE.CylinderBufferGeometry(10, 10, 25, 20, 25, true);

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

   vertexDisplacement = new Float32Array(tunnelGeometry.attributes.position.count);
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
   tunnel.rotation.set(-99, 0, 0);
   tunnel.position.set(0, 0, -8);
   console.log(tunnel);

   var textureLoader = new THREE.TextureLoader();

   particleGeometry = new THREE.BufferGeometry();
   var sprite = textureLoader.load('bubble.png');
   vertices = [];

   for ( var i = 0; i < 10000; i ++ ) {

    var x = Math.random() * 2000 - 1000;
    var y = Math.random() * 2000 - 1000;
    var z = Math.random() * 2000 - 1000;

    vertices.push( x, y, z );

    }

    particleGeometry.addAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    particleMaterial = new THREE.PointsMaterial({
        size: 10, map: sprite, blending: THREE.AdditiveBlending, depthTest: false, transparent: true
    });
    particleMaterial.color.setHSL( 0.9, 0, 0.5 );

    var particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    console.log("Ready to render");
    
    document.addEventListener("keydown", onDocumentKeyDown, false);
    document.addEventListener("keyup", onDocumentKeyUp, false);
   
    renderer = new THREE.WebGLRenderer({canvas: document.getElementById('mainCanvas')});
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );

    var shaderDelta = 0;

    loop.add(function(delta){
        var time = Date.now() * 0.00005;
        shaderDelta += 0.1;

        for ( var i = 0; i < scene.children.length; i ++ ) {

            var object = scene.children[ i ];

            if ( object instanceof THREE.Points ) {
                console.log(object);
                if(object.position.z > 300) object.position.set(THREE.Math.randFloatSpread(0.5), THREE.Math.randFloatSpread(0.5), 0);
                else object.position.z += 10;
                //object.rotation.z = time * ( i < 4 ? i + 1 : - ( i + 1 ) );
            }

        }
        
        for (var i = 0; i < vertexDisplacement.length; i += 1) {
            vertexDisplacement[i] = Math.sin(i+shaderDelta);
        }
        tunnelGeometry.addAttribute('vertexDisplacement', new THREE.BufferAttribute(vertexDisplacement, 1));

        tunnel.material.uniforms.delta.value = 0.5 +  Math.sin(shaderDelta) * 0.25;
        tunnel.material.uniforms.time.value = 0.00025 * (Date.now()  - start);

        //cube.rotation.x += 0.1;
        if(moveUp && cube.position.y < 3.6) cube.position.y += ySpeed;
        if(moveDown && cube.position.y > -3.6) cube.position.y -= ySpeed;
        
        if(moveLeft && cube.position.x > -3.6) cube.position.x -= xSpeed;
        if(moveRight  && cube.position.x < 3.6) cube.position.x += xSpeed;

        //console.log(cube.position.y);
        //tunnel.rotation.y += 0.005;
    
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