import * as THREE from 'three';
import { PointerLockControls } from './controls/PointerLockControls.js';
import { FlyControls } from './controls/FlyControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import * as CANNON from 'cannon-es';

// Main class for the Festival Builder
class FestivalBuilder {
    constructor() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Sky blue
        
        // Camera setup
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
        this.camera.position.set(0, 1.6, 5); // Eye level
        
        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: document.querySelector('canvas.webgl'),
            antialias: true 
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Physics world
        this.world = new CANNON.World();
        this.world.gravity.set(0, -9.82, 0);
        this.world.broadphase = new CANNON.SAPBroadphase(this.world);
        this.world.allowSleep = true;
        
        // Controls
        this.pointerLockControls = new PointerLockControls(this.camera, document.body);
        this.flyControls = new FlyControls(this.camera, this.renderer.domElement);
        this.flyControls.movementSpeed = 15;
        this.flyControls.rollSpeed = 0; // Completely disable roll
        this.flyControls.autoForward = false;
        this.flyControls.dragToLook = false; // Allow cursor to control camera without dragging
        this.flyControls.enabled = false;
        
        // Current active controls
        this.controls = this.pointerLockControls;
        
        // God mode flag
        this.godMode = false;
        
        // Player physics body
        this.playerBody = new CANNON.Body({
            mass: 5,
            shape: new CANNON.Sphere(0.5),
            position: new CANNON.Vec3(0, 10, 5),
            material: new CANNON.Material()
        });
        this.playerBody.linearDamping = 0.9;
        this.world.addBody(this.playerBody);
        
        // Movement flags
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.moveUp = false;
        this.moveDown = false;
        
        // Objects array
        this.objects = [];
        
        // Raycaster for object selection
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        // Selected and dragged objects
        this.selectedObject = null;
        this.draggedObject = null;
        
        // UI elements
        this.objectPanel = document.getElementById('object-panel');
        this.modeIndicator = document.getElementById('mode-indicator');
        
        // Clock for animation
        this.clock = new THREE.Clock();
        this.previousTime = 0;
        
        // Loaders
        this.loadingManager = new THREE.LoadingManager();
        this.textureLoader = new THREE.TextureLoader(this.loadingManager);
        this.gltfLoader = new GLTFLoader(this.loadingManager);
        
        // Setup DRACO loader for compressed models
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.5/');
        this.gltfLoader.setDRACOLoader(dracoLoader);
        
        // Initialize
        this.init();
        
        // Add a welcome sign
        this.addWelcomeSign();
    }
    
    addWelcomeSign() {
        // Create a welcome sign in front of the player
        const group = new THREE.Group();
        
        // Create a sign post
        const signPostGeometry = new THREE.CylinderGeometry(0.1, 0.1, 3, 8);
        const signPostMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const post = new THREE.Mesh(signPostGeometry, signPostMaterial);
        post.position.y = 1.5;
        post.castShadow = true;
        post.receiveShadow = true;
        group.add(post);
        
        // Create sign board
        const signGeometry = new THREE.BoxGeometry(2, 1, 0.1);
        const signMaterial = new THREE.MeshStandardMaterial({ color: 0xFFD700 });
        const signBoard = new THREE.Mesh(signGeometry, signMaterial);
        signBoard.position.set(0, 2.5, 0);
        signBoard.castShadow = true;
        signBoard.receiveShadow = true;
        group.add(signBoard);
        
        // Add text to sign
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 256;
        const context = canvas.getContext('2d');
        context.fillStyle = '#000000';
        context.font = 'Bold 48px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText('WELCOME', 256, 80);
        context.font = 'Bold 32px Arial';
        context.fillText('Walk up to me!', 256, 150);
        
        const textTexture = new THREE.CanvasTexture(canvas);
        const textMaterial = new THREE.MeshBasicMaterial({
            map: textTexture,
            transparent: true
        });
        
        const textGeometry = new THREE.PlaneGeometry(1.9, 0.9);
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.set(0, 2.5, 0.06);
        group.add(textMesh);
        
        // Position it in front of the player
        group.position.set(0, 0, -10);
        
        // Add to scene and objects array
        this.scene.add(group);
        this.objects.push(group);
        
        // Store object type
        group.userData = {
            type: 'welcome-sign',
            color: 0xFFD700,
            scale: 1
        };
    }
    
    init() {
        // Add event listeners
        this.addEventListeners();
        
        // Create terrain
        this.createTerrain();
        
        // Add lighting
        this.addLighting();
        
        // Create grid helper
        this.createGridHelper();
        
        // Start animation loop
        this.animate();
    }
    
    addEventListeners() {
        // Resize listener
        window.addEventListener('resize', () => {
            // Update camera
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            
            // Update renderer
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        });
        
        // Pointer lock listeners
        document.body.addEventListener('click', () => {
            if (!this.godMode) {
                this.pointerLockControls.lock();
            }
        });
        
        // Keyboard listeners
        document.addEventListener('keydown', (event) => {
            switch (event.code) {
                case 'KeyW':
                case 'ArrowUp':
                    this.moveForward = true;
                    break;
                case 'KeyS':
                case 'ArrowDown':
                    this.moveBackward = true;
                    break;
                case 'KeyA':
                case 'ArrowLeft':
                    this.moveLeft = true;
                    break;
                case 'KeyD':
                case 'ArrowRight':
                    this.moveRight = true;
                    break;
                case 'KeyQ':
                    this.moveUp = true;
                    break;
                case 'KeyE':
                    this.moveDown = true;
                    break;
                case 'Tab':
                    event.preventDefault();
                    this.toggleGodMode();
                    break;
            }
        });
        
        document.addEventListener('keyup', (event) => {
            switch (event.code) {
                case 'KeyW':
                case 'ArrowUp':
                    this.moveForward = false;
                    break;
                case 'KeyS':
                case 'ArrowDown':
                    this.moveBackward = false;
                    break;
                case 'KeyA':
                case 'ArrowLeft':
                    this.moveLeft = false;
                    break;
                case 'KeyD':
                case 'ArrowRight':
                    this.moveRight = false;
                    break;
                case 'KeyQ':
                    this.moveUp = false;
                    break;
                case 'KeyE':
                    this.moveDown = false;
                    break;
            }
        });
        
        // Mouse listeners
        document.addEventListener('mousemove', (event) => {
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        });
        
        // Mouse click for object placement
        document.addEventListener('mousedown', (event) => {
            if (this.godMode && this.selectedObject) {
                // Place the selected object at its current position
                this.selectedObject = null;
            } else if (this.godMode) {
                // Check if we clicked on an existing object
                this.raycaster.setFromCamera(this.mouse, this.camera);
                const intersects = this.raycaster.intersectObjects(this.objects, true);
                
                if (intersects.length > 0) {
                    // Find the parent object (the group)
                    let selectedObj = intersects[0].object;
                    while (selectedObj.parent && !this.objects.includes(selectedObj)) {
                        selectedObj = selectedObj.parent;
                    }
                    
                    if (this.objects.includes(selectedObj)) {
                        this.draggedObject = selectedObj;
                    }
                }
            }
        });
        
        document.addEventListener('mouseup', () => {
            if (this.godMode && this.draggedObject) {
                this.draggedObject = null;
            }
        });
        
        // Object buttons
        const objectButtons = document.querySelectorAll('.object-button');
        objectButtons.forEach(button => {
            button.addEventListener('click', () => {
                const type = button.getAttribute('data-type');
                this.createObject(type);
            });
        });
        
        // Category titles
        const categoryTitles = document.querySelectorAll('.category-title');
        categoryTitles.forEach(title => {
            title.addEventListener('click', () => {
                const category = title.parentElement;
                category.classList.toggle('expanded');
            });
        });
    }
    
    createTerrain() {
        // Ground plane
        const groundGeometry = new THREE.PlaneGeometry(1500, 1500, 100, 100);
        const groundMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x559020,
            roughness: 0.8,
            metalness: 0.1
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);
        
        // Ground physics
        const groundShape = new CANNON.Plane();
        const groundBody = new CANNON.Body({
            mass: 0,
            shape: groundShape,
            material: new CANNON.Material()
        });
        groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        this.world.addBody(groundBody);
    }
    
    addLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.6);
        this.scene.add(ambientLight);
        
        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.8);
        directionalLight.position.set(100, 100, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -100;
        directionalLight.shadow.camera.right = 100;
        directionalLight.shadow.camera.top = 100;
        directionalLight.shadow.camera.bottom = -100;
        this.scene.add(directionalLight);
    }
    
    createGridHelper() {
        // Grid for snapping
        this.gridHelper = new THREE.GridHelper(1500, 150, 0x000000, 0x444444);
        this.gridHelper.position.y = 0.01;
        this.gridHelper.visible = false;
        this.scene.add(this.gridHelper);
    }
    
    toggleGodMode() {
        this.godMode = !this.godMode;
        
        if (this.godMode) {
            // Switch to God Mode
            this.modeIndicator.textContent = 'God Mode';
            this.objectPanel.style.display = 'block';
            this.gridHelper.visible = true;
            
            // Disable pointer lock controls
            this.pointerLockControls.unlock();
            this.pointerLockControls.enabled = false;
            
            // Store player position
            const playerPos = this.pointerLockControls.getObject().position;
            
            // Move camera up for better overview
            this.camera.position.set(playerPos.x, playerPos.y + 30, playerPos.z + 10);
            this.camera.lookAt(playerPos.x, playerPos.y, playerPos.z);
            
            // Enable fly controls
            this.flyControls.enabled = true;
            this.controls = this.flyControls;
            
            // Reset movement flags
            this.resetMovementFlags();
        } else {
            // Switch to Play Mode
            this.modeIndicator.textContent = 'Play Mode';
            this.objectPanel.style.display = 'none';
            this.gridHelper.visible = false;
            
            // Disable fly controls
            this.flyControls.enabled = false;
            
            // Restore camera position
            this.pointerLockControls.getObject().position.copy(this.playerBody.position);
            this.pointerLockControls.getObject().position.y += 1.1; // Eye height
            
            // Enable pointer lock controls
            this.pointerLockControls.enabled = true;
            this.controls = this.pointerLockControls;
            
            // Lock the pointer to enable first-person controls
            this.pointerLockControls.lock();
            
            // Reset movement flags
            this.resetMovementFlags();
        }
    }
    
    resetMovementFlags() {
        // Reset all movement flags
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.moveUp = false;
        this.moveDown = false;
    }
    
    createObject(type) {
        let object;
        
        switch(type) {
            case 'main-stage':
                object = this.createMainStage();
                break;
            case 'side-stage':
                object = this.createSideStage();
                break;
            case 'ferris-wheel':
                object = this.createFerrisWheel();
                break;
            case 'tent':
                object = this.createTent();
                break;
            default:
                object = this.createPlaceholder(type);
                break;
        }
        
        // Position at camera target
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children);
        
        if (intersects.length > 0) {
            object.position.copy(intersects[0].point);
        } else {
            // Default position in front of camera
            object.position.set(
                this.camera.position.x + Math.sin(this.camera.rotation.y) * 10,
                0,
                this.camera.position.z - Math.cos(this.camera.rotation.y) * 10
            );
        }
        
        // Add to scene and objects array
        this.scene.add(object);
        this.objects.push(object);
        
        // Set as selected object for placement
        this.selectedObject = object;
    }
    
    createMainStage() {
        const group = new THREE.Group();
        
        // Stage platform
        const platformGeometry = new THREE.BoxGeometry(30, 2, 20);
        const platformMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
        const platform = new THREE.Mesh(platformGeometry, platformMaterial);
        platform.position.y = 1;
        platform.castShadow = true;
        platform.receiveShadow = true;
        group.add(platform);
        
        // Stage roof
        const roofGeometry = new THREE.BoxGeometry(30, 1, 20);
        const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = 15;
        roof.castShadow = true;
        roof.receiveShadow = true;
        group.add(roof);
        
        // Stage supports
        const supportGeometry = new THREE.BoxGeometry(1, 14, 1);
        const supportMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 });
        
        // Front left support
        const frontLeftSupport = new THREE.Mesh(supportGeometry, supportMaterial);
        frontLeftSupport.position.set(-14, 8, 9);
        frontLeftSupport.castShadow = true;
        frontLeftSupport.receiveShadow = true;
        group.add(frontLeftSupport);
        
        // Front right support
        const frontRightSupport = new THREE.Mesh(supportGeometry, supportMaterial);
        frontRightSupport.position.set(14, 8, 9);
        frontRightSupport.castShadow = true;
        frontRightSupport.receiveShadow = true;
        group.add(frontRightSupport);
        
        // Back left support
        const backLeftSupport = new THREE.Mesh(supportGeometry, supportMaterial);
        backLeftSupport.position.set(-14, 8, -9);
        backLeftSupport.castShadow = true;
        backLeftSupport.receiveShadow = true;
        group.add(backLeftSupport);
        
        // Back right support
        const backRightSupport = new THREE.Mesh(supportGeometry, supportMaterial);
        backRightSupport.position.set(14, 8, -9);
        backRightSupport.castShadow = true;
        backRightSupport.receiveShadow = true;
        group.add(backRightSupport);
        
        // Stage backdrop
        const backdropGeometry = new THREE.BoxGeometry(30, 10, 1);
        const backdropMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
        const backdrop = new THREE.Mesh(backdropGeometry, backdropMaterial);
        backdrop.position.set(0, 6, -10);
        backdrop.castShadow = true;
        backdrop.receiveShadow = true;
        group.add(backdrop);
        
        // Store object type
        group.userData = { 
            type: 'main-stage',
            color: 0x333333,
            scale: 1
        };
        
        return group;
    }
    
    createSideStage() {
        const group = new THREE.Group();
        
        // Stage platform
        const platformGeometry = new THREE.BoxGeometry(20, 1, 15);
        const platformMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
        const platform = new THREE.Mesh(platformGeometry, platformMaterial);
        platform.position.y = 0.5;
        platform.castShadow = true;
        platform.receiveShadow = true;
        group.add(platform);
        
        // Stage backdrop
        const backdropGeometry = new THREE.BoxGeometry(20, 8, 1);
        const backdropMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
        const backdrop = new THREE.Mesh(backdropGeometry, backdropMaterial);
        backdrop.position.set(0, 4, -7);
        backdrop.castShadow = true;
        backdrop.receiveShadow = true;
        group.add(backdrop);
        
        // Store object type
        group.userData = { 
            type: 'side-stage',
            color: 0x444444,
            scale: 1
        };
        
        return group;
    }
    
    createFerrisWheel() {
        const group = new THREE.Group();
        
        // Base
        const baseGeometry = new THREE.CylinderGeometry(5, 8, 2, 16);
        const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 1;
        base.castShadow = true;
        base.receiveShadow = true;
        group.add(base);
        
        // Support structure
        const supportGeometry = new THREE.BoxGeometry(2, 30, 2);
        const supportMaterial = new THREE.MeshStandardMaterial({ color: 0x666666 });
        const support = new THREE.Mesh(supportGeometry, supportMaterial);
        support.position.y = 16;
        support.castShadow = true;
        support.receiveShadow = true;
        group.add(support);
        
        // Wheel
        const wheelGeometry = new THREE.TorusGeometry(15, 1, 16, 50);
        const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0xFF5555 });
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel.position.y = 30;
        wheel.rotation.x = Math.PI / 2;
        wheel.castShadow = true;
        wheel.receiveShadow = true;
        group.add(wheel);
        
        // Gondolas
        const gondolaGeometry = new THREE.BoxGeometry(3, 3, 3);
        const gondolaMaterial = new THREE.MeshStandardMaterial({ color: 0x3388FF });
        
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const gondola = new THREE.Mesh(gondolaGeometry, gondolaMaterial);
            gondola.position.set(
                Math.cos(angle) * 15,
                30 + Math.sin(angle) * 15,
                0
            );
            gondola.castShadow = true;
            gondola.receiveShadow = true;
            group.add(gondola);
        }
        
        // Store object type
        group.userData = { 
            type: 'ferris-wheel',
            color: 0xFF5555,
            scale: 1
        };
        
        return group;
    }
    
    createTent() {
        const group = new THREE.Group();
        
        // Tent body
        const tentGeometry = new THREE.ConeGeometry(3, 4, 4);
        const tentMaterial = new THREE.MeshStandardMaterial({ color: 0x88AACC });
        const tent = new THREE.Mesh(tentGeometry, tentMaterial);
        tent.position.y = 2;
        tent.rotation.y = Math.PI / 4;
        tent.castShadow = true;
        tent.receiveShadow = true;
        group.add(tent);
        
        // Store object type
        group.userData = { 
            type: 'tent',
            color: 0x88AACC,
            scale: 1
        };
        
        return group;
    }
    
    createPlaceholder(type) {
        const group = new THREE.Group();
        
        // Create a solid object based on type
        let geometry, material, mesh;
        
        switch(type) {
            case 'speaker-stack':
                // Create a speaker stack
                geometry = new THREE.BoxGeometry(2, 4, 2);
                material = new THREE.MeshStandardMaterial({ color: 0x111111 });
                mesh = new THREE.Mesh(geometry, material);
                mesh.position.y = 2;
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                group.add(mesh);
                
                // Add speaker cones
                const speakerTopGeometry = new THREE.CylinderGeometry(0.5, 0.7, 0.5, 16);
                const speakerTopMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
                const speakerTop = new THREE.Mesh(speakerTopGeometry, speakerTopMaterial);
                speakerTop.position.set(0, 3.5, 0.8);
                speakerTop.rotation.x = Math.PI / 2;
                speakerTop.castShadow = true;
                speakerTop.receiveShadow = true;
                group.add(speakerTop);
                
                const speakerBottomGeometry = new THREE.CylinderGeometry(0.7, 0.9, 0.5, 16);
                const speakerBottomMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
                const speakerBottom = new THREE.Mesh(speakerBottomGeometry, speakerBottomMaterial);
                speakerBottom.position.set(0, 2.5, 0.8);
                speakerBottom.rotation.x = Math.PI / 2;
                speakerBottom.castShadow = true;
                speakerBottom.receiveShadow = true;
                group.add(speakerBottom);
                break;
                
            case 'dj-booth':
                // Create a DJ booth
                geometry = new THREE.BoxGeometry(6, 1.2, 3);
                material = new THREE.MeshStandardMaterial({ color: 0x222222 });
                mesh = new THREE.Mesh(geometry, material);
                mesh.position.y = 0.6;
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                group.add(mesh);
                
                // Add DJ equipment
                const tableGeometry = new THREE.BoxGeometry(5, 0.2, 2);
                const tableMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
                const table = new THREE.Mesh(tableGeometry, tableMaterial);
                table.position.y = 1.3;
                table.castShadow = true;
                table.receiveShadow = true;
                group.add(table);
                
                // Add turntables
                const turntable1Geometry = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 16);
                const turntable1Material = new THREE.MeshStandardMaterial({ color: 0x111111 });
                const turntable1 = new THREE.Mesh(turntable1Geometry, turntable1Material);
                turntable1.position.set(-1.5, 1.45, 0);
                turntable1.castShadow = true;
                turntable1.receiveShadow = true;
                group.add(turntable1);
                
                const turntable2Geometry = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 16);
                const turntable2Material = new THREE.MeshStandardMaterial({ color: 0x111111 });
                const turntable2 = new THREE.Mesh(turntable2Geometry, turntable2Material);
                turntable2.position.set(1.5, 1.45, 0);
                turntable2.castShadow = true;
                turntable2.receiveShadow = true;
                group.add(turntable2);
                break;
                
            case 'food-stand':
                // Create a food stand
                geometry = new THREE.BoxGeometry(6, 3, 4);
                material = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
                mesh = new THREE.Mesh(geometry, material);
                mesh.position.y = 1.5;
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                group.add(mesh);
                
                // Add roof
                const roofGeometry = new THREE.BoxGeometry(7, 0.2, 5);
                const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x8B0000 });
                const roof = new THREE.Mesh(roofGeometry, roofMaterial);
                roof.position.y = 3.1;
                roof.castShadow = true;
                roof.receiveShadow = true;
                group.add(roof);
                
                // Add counter
                const counterGeometry = new THREE.BoxGeometry(6, 0.2, 1);
                const counterMaterial = new THREE.MeshStandardMaterial({ color: 0xD2B48C });
                const counter = new THREE.Mesh(counterGeometry, counterMaterial);
                counter.position.set(0, 1.5, 2.5);
                counter.castShadow = true;
                counter.receiveShadow = true;
                group.add(counter);
                break;
                
            case 'merch-booth':
                // Create a merchandise booth
                geometry = new THREE.BoxGeometry(6, 3, 4);
                material = new THREE.MeshStandardMaterial({ color: 0x4682B4 });
                mesh = new THREE.Mesh(geometry, material);
                mesh.position.y = 1.5;
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                group.add(mesh);
                
                // Add roof
                const merchRoofGeometry = new THREE.BoxGeometry(7, 0.2, 5);
                const merchRoofMaterial = new THREE.MeshStandardMaterial({ color: 0x000080 });
                const merchRoof = new THREE.Mesh(merchRoofGeometry, merchRoofMaterial);
                merchRoof.position.y = 3.1;
                merchRoof.castShadow = true;
                merchRoof.receiveShadow = true;
                group.add(merchRoof);
                
                // Add display rack
                const rackGeometry = new THREE.BoxGeometry(5, 2, 0.5);
                const rackMaterial = new THREE.MeshStandardMaterial({ color: 0xD3D3D3 });
                const rack = new THREE.Mesh(rackGeometry, rackMaterial);
                rack.position.set(0, 1.5, -1.5);
                rack.castShadow = true;
                rack.receiveShadow = true;
                group.add(rack);
                break;
                
            case 'art-installation':
                // Create an art installation
                const baseGeometry = new THREE.CylinderGeometry(3, 3, 0.5, 16);
                const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x9932CC });
                const base = new THREE.Mesh(baseGeometry, baseMaterial);
                base.position.y = 0.25;
                base.castShadow = true;
                base.receiveShadow = true;
                group.add(base);
                
                // Add central structure
                const pillarGeometry = new THREE.CylinderGeometry(0.5, 0.5, 10, 16);
                const pillarMaterial = new THREE.MeshStandardMaterial({ color: 0x800080 });
                const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
                pillar.position.y = 5.25;
                pillar.castShadow = true;
                pillar.receiveShadow = true;
                group.add(pillar);
                
                // Add decorative elements
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2;
                    const radius = 2;
                    
                    const sphereGeometry = new THREE.SphereGeometry(0.5, 16, 16);
                    const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0xFF00FF });
                    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
                    sphere.position.set(
                        Math.cos(angle) * radius,
                        3 + Math.sin(i * 0.5) * 2,
                        Math.sin(angle) * radius
                    );
                    sphere.castShadow = true;
                    sphere.receiveShadow = true;
                    group.add(sphere);
                }
                break;
                
            case 'rv':
                // Create an RV
                geometry = new THREE.BoxGeometry(8, 3, 3);
                material = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
                mesh = new THREE.Mesh(geometry, material);
                mesh.position.y = 1.5;
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                group.add(mesh);
                
                // Add roof
                const rvRoofGeometry = new THREE.BoxGeometry(8, 0.5, 3);
                const rvRoofMaterial = new THREE.MeshStandardMaterial({ color: 0xDDDDDD });
                const rvRoof = new THREE.Mesh(rvRoofGeometry, rvRoofMaterial);
                rvRoof.position.y = 3.25;
                rvRoof.castShadow = true;
                rvRoof.receiveShadow = true;
                group.add(rvRoof);
                
                // Add windows
                const windowMaterial = new THREE.MeshStandardMaterial({ color: 0x88CCFF });
                
                // Front window
                const frontWindowGeometry = new THREE.PlaneGeometry(2, 1);
                const frontWindow = new THREE.Mesh(frontWindowGeometry, windowMaterial);
                frontWindow.position.set(3.51, 2, 0);
                frontWindow.rotation.y = Math.PI / 2;
                group.add(frontWindow);
                
                // Side windows
                const sideWindow1Geometry = new THREE.PlaneGeometry(1.5, 1);
                const sideWindow1 = new THREE.Mesh(sideWindow1Geometry, windowMaterial);
                sideWindow1.position.set(2, 2, 1.51);
                group.add(sideWindow1);
                
                const sideWindow2Geometry = new THREE.PlaneGeometry(1.5, 1);
                const sideWindow2 = new THREE.Mesh(sideWindow2Geometry, windowMaterial);
                sideWindow2.position.set(-2, 2, 1.51);
                group.add(sideWindow2);
                
                // Add wheels
                const wheelGeometry = new THREE.CylinderGeometry(0.6, 0.6, 0.4, 16);
                const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x111111 });
                
                const frontLeftWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
                frontLeftWheel.position.set(2.5, 0.6, 1.7);
                frontLeftWheel.rotation.z = Math.PI / 2;
                group.add(frontLeftWheel);
                
                const frontRightWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
                frontRightWheel.position.set(2.5, 0.6, -1.7);
                frontRightWheel.rotation.z = Math.PI / 2;
                group.add(frontRightWheel);
                
                const backLeftWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
                backLeftWheel.position.set(-2.5, 0.6, 1.7);
                backLeftWheel.rotation.z = Math.PI / 2;
                group.add(backLeftWheel);
                
                const backRightWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
                backRightWheel.position.set(-2.5, 0.6, -1.7);
                backRightWheel.rotation.z = Math.PI / 2;
                group.add(backRightWheel);
                break;
                
            case 'toilet':
                // Create a portable toilet
                geometry = new THREE.BoxGeometry(1.5, 2.5, 1.5);
                material = new THREE.MeshStandardMaterial({ color: 0x1E90FF });
                mesh = new THREE.Mesh(geometry, material);
                mesh.position.y = 1.25;
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                group.add(mesh);
                
                // Add roof
                const toiletRoofGeometry = new THREE.BoxGeometry(1.7, 0.2, 1.7);
                const toiletRoofMaterial = new THREE.MeshStandardMaterial({ color: 0x0000CD });
                const toiletRoof = new THREE.Mesh(toiletRoofGeometry, toiletRoofMaterial);
                toiletRoof.position.y = 2.6;
                toiletRoof.castShadow = true;
                toiletRoof.receiveShadow = true;
                group.add(toiletRoof);
                
                // Add door
                const doorGeometry = new THREE.PlaneGeometry(1.2, 2.2);
                const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x0000AA });
                const door = new THREE.Mesh(doorGeometry, doorMaterial);
                door.position.set(0, 1.25, 0.76);
                group.add(door);
                
                // Add door handle
                const handleGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
                const handleMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
                const handle = new THREE.Mesh(handleGeometry, handleMaterial);
                handle.position.set(0.4, 1.25, 0.82);
                group.add(handle);
                
                // Add vent
                const ventGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.1);
                const ventMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
                const vent = new THREE.Mesh(ventGeometry, ventMaterial);
                vent.position.set(0, 2.1, 0.76);
                group.add(vent);
                break;
                
            case 'fence':
                // Create a fence section
                const fenceGroup = new THREE.Group();
                
                // Create fence posts
                const fencePostGeometry = new THREE.BoxGeometry(0.2, 2, 0.2);
                const fencePostMaterial = new THREE.MeshStandardMaterial({ color: 0xA9A9A9 });
                
                const leftPost = new THREE.Mesh(fencePostGeometry, fencePostMaterial);
                leftPost.position.set(-2.4, 1, 0);
                leftPost.castShadow = true;
                leftPost.receiveShadow = true;
                fenceGroup.add(leftPost);
                
                const rightPost = new THREE.Mesh(fencePostGeometry, fencePostMaterial);
                rightPost.position.set(2.4, 1, 0);
                rightPost.castShadow = true;
                rightPost.receiveShadow = true;
                fenceGroup.add(rightPost);
                
                // Create horizontal rails
                const railGeometry = new THREE.BoxGeometry(5, 0.1, 0.1);
                const railMaterial = new THREE.MeshStandardMaterial({ color: 0xA9A9A9 });
                
                const topRail = new THREE.Mesh(railGeometry, railMaterial);
                topRail.position.set(0, 1.8, 0);
                topRail.castShadow = true;
                topRail.receiveShadow = true;
                fenceGroup.add(topRail);
                
                const middleRail = new THREE.Mesh(railGeometry, railMaterial);
                middleRail.position.set(0, 1.2, 0);
                middleRail.castShadow = true;
                middleRail.receiveShadow = true;
                fenceGroup.add(middleRail);
                
                const bottomRail = new THREE.Mesh(railGeometry, railMaterial);
                bottomRail.position.set(0, 0.6, 0);
                bottomRail.castShadow = true;
                bottomRail.receiveShadow = true;
                fenceGroup.add(bottomRail);
                
                // Add vertical slats
                const slatGeometry = new THREE.BoxGeometry(0.1, 1.5, 0.05);
                const slatMaterial = new THREE.MeshStandardMaterial({ color: 0xA9A9A9 });
                
                for (let i = -12; i <= 12; i += 2) {
                    const slat = new THREE.Mesh(slatGeometry, slatMaterial);
                    slat.position.set(i * 0.2, 1.15, 0);
                    slat.castShadow = true;
                    slat.receiveShadow = true;
                    fenceGroup.add(slat);
                }
                
                group.add(fenceGroup);
                break;
                
            case 'road':
                // Create a road section
                geometry = new THREE.BoxGeometry(5, 0.2, 5);
                material = new THREE.MeshStandardMaterial({ color: 0x696969 });
                mesh = new THREE.Mesh(geometry, material);
                mesh.position.y = 0.1;
                mesh.receiveShadow = true;
                group.add(mesh);
                
                // Add road markings
                const lineGeometry = new THREE.PlaneGeometry(0.3, 2);
                const lineMaterial = new THREE.MeshStandardMaterial({
                    color: 0xFFFFFF,
                    side: THREE.DoubleSide
                });
                
                const centerLine = new THREE.Mesh(lineGeometry, lineMaterial);
                centerLine.rotation.x = -Math.PI / 2;
                centerLine.position.y = 0.21;
                centerLine.receiveShadow = true;
                group.add(centerLine);
                break;
                
            case 'sign':
                // Create a sign post
                const signPostGeometry = new THREE.CylinderGeometry(0.1, 0.1, 3, 8);
                const signPostMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
                const post = new THREE.Mesh(signPostGeometry, signPostMaterial);
                post.position.y = 1.5;
                post.castShadow = true;
                post.receiveShadow = true;
                group.add(post);
                
                // Create sign board
                const signGeometry = new THREE.BoxGeometry(2, 1, 0.1);
                const signMaterial = new THREE.MeshStandardMaterial({ color: 0xFFD700 });
                const signBoard = new THREE.Mesh(signGeometry, signMaterial);
                signBoard.position.set(0, 2.5, 0);
                signBoard.castShadow = true;
                signBoard.receiveShadow = true;
                group.add(signBoard);
                
                // Add text to sign
                const canvas = document.createElement('canvas');
                canvas.width = 256;
                canvas.height = 128;
                const context = canvas.getContext('2d');
                context.fillStyle = '#000000';
                context.font = 'Bold 36px Arial';
                context.textAlign = 'center';
                context.textBaseline = 'middle';
                context.fillText(type.toUpperCase(), 128, 64);
                
                const textTexture = new THREE.CanvasTexture(canvas);
                const textMaterial = new THREE.MeshBasicMaterial({
                    map: textTexture,
                    transparent: true
                });
                
                const textGeometry = new THREE.PlaneGeometry(1.9, 0.9);
                const textMesh = new THREE.Mesh(textGeometry, textMaterial);
                textMesh.position.set(0, 2.5, 0.06);
                group.add(textMesh);
                break;
                
            default:
                // Create a default colored box for other types
                geometry = new THREE.BoxGeometry(3, 3, 3);
                material = new THREE.MeshStandardMaterial({
                    color: 0x6495ED,
                    wireframe: false
                });
                mesh = new THREE.Mesh(geometry, material);
                mesh.position.y = 1.5;
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                group.add(mesh);
                break;
        }
        
        // Add text label
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const context = canvas.getContext('2d');
        context.fillStyle = '#ffffff';
        context.font = 'Bold 24px Arial';
        context.textAlign = 'center';
        context.fillText(type, 128, 128);
        
        const texture = new THREE.CanvasTexture(canvas);
        const labelMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            side: THREE.DoubleSide
        });
        
        const labelGeometry = new THREE.PlaneGeometry(4, 1);
        const label = new THREE.Mesh(labelGeometry, labelMaterial);
        label.position.y = 4;
        label.rotation.x = -Math.PI / 4;
        group.add(label);
        
        // Store object type
        group.userData = { 
            type: type,
            color: 0xFFFFFF,
            scale: 1
        };
        
        return group;
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        const elapsedTime = this.clock.getElapsedTime();
        const deltaTime = elapsedTime - this.previousTime;
        this.previousTime = elapsedTime;
        
        // Update physics
        this.world.step(1/60, deltaTime, 3);
        
        // Update player position based on physics
        if (!this.godMode) {
            // DIRECT MOVEMENT APPROACH - no physics for walking
            const moveSpeed = 0.15; // Direct movement speed
            
            // Get camera direction for movement relative to where we're looking
            const cameraDirection = new THREE.Vector3();
            this.camera.getWorldDirection(cameraDirection);
            cameraDirection.y = 0; // Keep movement on the horizontal plane
            cameraDirection.normalize();
            
            // Get right vector (perpendicular to camera direction)
            const rightVector = new THREE.Vector3();
            rightVector.crossVectors(new THREE.Vector3(0, 1, 0), cameraDirection).normalize();
            
            // Calculate movement vector
            const moveVector = new THREE.Vector3(0, 0, 0);
            
            if (this.moveForward) {
                moveVector.add(cameraDirection.clone().multiplyScalar(moveSpeed));
            }
            if (this.moveBackward) {
                moveVector.add(cameraDirection.clone().multiplyScalar(-moveSpeed));
            }
            if (this.moveLeft) {
                moveVector.add(rightVector.clone().multiplyScalar(moveSpeed));
            }
            if (this.moveRight) {
                moveVector.add(rightVector.clone().multiplyScalar(-moveSpeed));
            }
            
            // Apply gravity (simplified)
            this.playerBody.velocity.y -= 9.8 * deltaTime;
            
            // Log movement for debugging
            if (this.moveForward || this.moveBackward || this.moveLeft || this.moveRight) {
                console.log('Moving:', {
                    forward: this.moveForward,
                    backward: this.moveBackward,
                    left: this.moveLeft,
                    right: this.moveRight,
                    moveVector: moveVector
                });
                
                // Apply movement directly to player position
                this.playerBody.position.x += moveVector.x;
                this.playerBody.position.z += moveVector.z;
            }
            
            // Sync camera to player body
            this.pointerLockControls.getObject().position.copy(this.playerBody.position);
            this.pointerLockControls.getObject().position.y += 1.1; // Eye height
        } else {
            // Update fly controls in god mode
            this.flyControls.update(deltaTime);
            
            // Handle vertical movement with Q and E keys
            if (this.moveUp) {
                this.camera.position.y += 10 * deltaTime;
            }
            if (this.moveDown) {
                this.camera.position.y -= 10 * deltaTime;
            }
            
            // Handle object placement
            if (this.selectedObject) {
                this.raycaster.setFromCamera(this.mouse, this.camera);
                const intersects = this.raycaster.intersectObjects(this.scene.children, true);
                
                if (intersects.length > 0) {
                    // Don't intersect with the selected object itself
                    const filteredIntersects = intersects.filter(intersect =>
                        !this.selectedObject.children.includes(intersect.object) &&
                        intersect.object !== this.selectedObject
                    );
                    
                    if (filteredIntersects.length > 0) {
                        this.selectedObject.position.copy(filteredIntersects[0].point);
                        
                        // Snap to grid
                        this.selectedObject.position.x = Math.round(this.selectedObject.position.x / 2) * 2;
                        this.selectedObject.position.z = Math.round(this.selectedObject.position.z / 2) * 2;
                    }
                }
            }
            
            // Handle dragged objects
            if (this.draggedObject) {
                // Completely disable camera movement while dragging
                const wasEnabled = this.flyControls.enabled;
                this.flyControls.enabled = false;
                
                // Store current mouse position to prevent camera movement
                const currentMouseX = this.mouse.x;
                const currentMouseY = this.mouse.y;
                
                this.raycaster.setFromCamera(this.mouse, this.camera);
                const intersects = this.raycaster.intersectObjects(this.scene.children, true);
                
                if (intersects.length > 0) {
                    // Don't intersect with the dragged object itself
                    const filteredIntersects = intersects.filter(intersect =>
                        !this.draggedObject.children.includes(intersect.object) &&
                        intersect.object !== this.draggedObject
                    );
                    
                    if (filteredIntersects.length > 0) {
                        this.draggedObject.position.copy(filteredIntersects[0].point);
                        
                        // Snap to grid
                        this.draggedObject.position.x = Math.round(this.draggedObject.position.x / 2) * 2;
                        this.draggedObject.position.z = Math.round(this.draggedObject.position.z / 2) * 2;
                    }
                }
                
                // Restore fly controls state
                this.flyControls.enabled = wasEnabled;
            }
        }
        
        // Render
        this.renderer.render(this.scene, this.camera);
    }
}

export { FestivalBuilder };