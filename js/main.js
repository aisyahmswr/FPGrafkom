var scene, camera, renderer, loop;
var cube, tunnel, player;
var xSpeed = 0.1, ySpeed = 0.1;
var moveRight = false, moveLeft = false, moveUp = false, moveDown = false;
var start = Date.now();
var vertexDisplacement;
var particleGeometry, vertices = [];
var obstacleSpeed = 0.5;
var colliderSystem, colliders = [], collider, colliderO;
var score = 0;

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

    //#region Systen Init

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

    camera.position.set(0, 0, 7);
    loop = new THREEx.RenderingLoop();

    colliderSystem = new THREEx.ColliderSystem();

    //#endregion    

    //#region  Lights

    var light = new THREE.PointLight( 0xffffff, 5, 0);
    light.position.set( 3, 5, 0);
    scene.add( light );

    var ambientLight = new THREE.AmbientLight( 0x404040, 1 );
    scene.add( ambientLight );

    var ambientLight = new THREE.AmbientLight();
    scene.add( ambientLight );

    //#endregion
    
    //#region Geometry

   var cubeGeometry = new THREE.BoxGeometry(1, 1);
   var tunnelGeometry = new THREE.CylinderBufferGeometry(25, 0, 25, 20, 25, true);
   var obstacleGeometry = new THREE.BoxGeometry();

    //#endregion

   //#region Materials & Shader
   
    var cubeMaterial = new THREE.MeshStandardMaterial(); 
   var obstacleMaterial = new THREE.MeshBasicMaterial(0x00ffff);
   var tunnelMaterial = new THREE.MeshPhongMaterial({
    color: 0x4040f0,
    side: THREE.DoubleSide
    });

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

   //#endregion

   //#region Object3D Init

   //Player

   cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
   cube.name = "Player"
   scene.add(cube);

   var box3	= new THREE.Box3()
    box3.setFromPoints( cube.geometry.vertices );
    collider	= new THREEx.ColliderBox3(cube, box3)
    
    colliders.push(collider)

    //Tunnel

   tunnel = new THREE.Mesh(tunnelGeometry, shaderMaterial);
   scene.add(tunnel);
   tunnel.openEnded = true;
   tunnel.rotation.set(-99, 0, 0);
   tunnel.position.set(0, 0, -10);

   //Obstacle

   obstacle = new THREE.Mesh(obstacleGeometry, obstacleMaterial);
   obstacle.position.set(20, 0, 0)
   scene.add(obstacle);
   obstacle.name = "Obstacle";
   obstacle.position.set(0, 0, -70);

    var boxO	= new THREE.Box3()
    boxO.setFromCenterAndSize( obstacle.position, obstacle.scale);
    colliderO	= new THREEx.ColliderBox3(obstacle, boxO)
    colliders.push(colliderO)

   //Particles
   var textureLoader = new THREE.TextureLoader();
   var loader = new THREE.GLTFLoader();

   particleGeometry = new THREE.BufferGeometry();
   var sprite = textureLoader.load('bubble.png');
   vertices = [];

   for ( var i = 0; i < 4000; i ++ ) {

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

    // player = new THREE.Group();

    // loader.load( 'turtle.glb', function ( gltf ) {
    //     gltf.scene.traverse( function ( child ) {
    //         if ( child.isMesh ) {
    //                 console.log(child);
    //                 var newChild = new THREE.Mesh(child, cubeMaterial);
    //                 scene.add(newChild);
                    
    //             }
    //         }
        
    //     );
    //     scene.add(gltf.scene)
    // }, undefined, function ( e ) {
    //     console.error( e );
    // } );

    // player.position = cube.position;
    // console.log(player);
    
    
    //#endregion

    console.log("Ready to render");
    //colliderSystem.computeAndNotify(colliders)	

   
    renderer = new THREE.WebGLRenderer({canvas: document.getElementById('mainCanvas')});
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );

    var shaderDelta = 0;

    //#region Event Listeners
    document.getElementById("score").innerHTML = score;
    document.addEventListener("keydown", onDocumentKeyDown, false);
    document.addEventListener("keyup", onDocumentKeyUp, false);
    document.getElementById("resetButton").style.zIndex = -1
    document.getElementById("resetButton").onclick = function() {
        loop.start();
        score = -3;
        document.getElementById("resetButton").style.zIndex = -1
    }
    
    collider.addEventListener('contactEnter', function(otherCollider){
        if(otherCollider.object3d.name == "Player") return;
        loop.stop();
        document.getElementById("resetButton").style.zIndex = 99
        cube.material.color.set('red')
	})
	collider.addEventListener('contactExit', function(otherCollider){
        if(otherCollider.object3d.name == "Player") return;
		console.log('contactExit', collider.object3d.name, 'with', otherCollider.object3d.name)
		cube.material.color.set('white')
	})

    colliderO.addEventListener('contactEnter', function(otherCollider){
        if(otherCollider.object3d.name == "Obstacle") return;
		console.log('contactEnter', colliderO.object3d.name, 'with', otherCollider.object3d.name)
		obstacle.material.color.set('yellow')
	})
	colliderO.addEventListener('contactExit', function(otherCollider){
        if(otherCollider.object3d.name == "Obstacle") return;
		console.log('contactExit', colliderO.object3d.name, 'with', otherCollider.object3d.name)
		obstacle.material.color.set('white') 
    })
    
    //#endregion

    loop.add(function(delta){
        var time = Date.now() * 0.00005;
        shaderDelta += 0.1;
        obstacle.position.z += obstacleSpeed;
        collider.update();
        colliderO.update();
        if(obstacle.position.z == cube.position.z) {
            score += 3;
            document.getElementById("score").innerHTML = score;
        }
        if(obstacle.position.z > 20) obstacle.position.set(THREE.Math.randFloatSpread(5), THREE.Math.randFloatSpread(5), -70);

        for ( var i = 0; i < scene.children.length; i ++ ) {

            var object = scene.children[ i ];

            if ( object instanceof THREE.Points ) {
                if(object.position.z > 300) object.position.set(THREE.Math.randFloatSpread(0.5), THREE.Math.randFloatSpread(0.5), -300);
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

		// update the colliderSystem
		colliderSystem.computeAndNotify(colliders)

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