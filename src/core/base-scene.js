import * as THREE from 'three';
import { PointerLockControls } from '../controls/PointerLockControls.js';
import { FlyControls } from '../controls/FlyControls.js'; // Assuming FlyControls is placed here
import BASE_CONFIG from './base-config';
import GUIHelper from '../helpers/gui-helper/gui-helper';
import MainScene from '../scene/main-scene';
import Stats from "stats.js";
import TWEEN from '@tweenjs/tween.js';
import LoadingOverlay from './loading-overlay';
import Physics from './physics';
import * as CANNON from 'cannon-es'; // Import CANNON
import BaseGUI from './base-gui';
import { Black, CanvasDriver, Engine, Input, MasterAudio, StageScaleMode } from 'black-engine';
import Loader from './loader';
import { GUIFolders } from '../helpers/gui-helper/gui-helper-config';

export default class BaseScene {
  constructor() {
    this._scene = null;
    this._renderer = null;
    this._camera = null;
    this._controls = null; // Will hold the currently active controls
    this._pointerLockControls = null; // Store PointerLockControls instance
    this._flyControls = null; // Store FlyControls instance
    this._godModeEnabled = false; // Flag for current mode
    this._ambientLight = null;
    this._directionalLight = null;
    this._directionalLightHelper = null;
    this._shadowCameraHelper = null;
    this._axesHelper = null;
    this._loadingOverlay = null;
    this._stats = null;
    this._physics = null;
    this._playerBody = null; // Add player physics body property
    this._baseGUI = null;
    this._mainScene = null;

    this._windowSizes = {};
    this._isAssetsLoaded = false;

    this._init();
  }

  createGameScene() {
    const data = {
      scene: this._scene,
      camera: this._camera,
    };

    this._mainScene = new MainScene(data);
  }

  afterAssetsLoaded() {
    this._isAssetsLoaded = true;
    this._controls.enabled = true;

    this._loadingOverlay.hide();
this._stats.dom.style.visibility = 'visible';
this._baseGUI.showAfterAssetsLoad(); // Moved inside afterAssetsLoaded
this._mainScene.afterAssetsLoad();   // Moved inside afterAssetsLoaded
} // Correct closing brace for afterAssetsLoaded

_toggleControlMode() {
this._godModeEnabled = !this._godModeEnabled;
console.log(`Toggled mode. God Mode: ${this._godModeEnabled}`);

if (this._godModeEnabled) {
  // --- Switch to God Mode (FlyControls) ---
  this._pointerLockControls.unlock(); // Ensure pointer is unlocked
  this._pointerLockControls.enabled = false;

  // Disable player physics body interactions (optional, prevents falling in god mode)
  // You might want to make the body static or remove it temporarily
  // For now, we'll just stop its velocity when switching
  this._playerBody.velocity.set(0, 0, 0);
  this._playerBody.angularVelocity.set(0, 0, 0);
  // Consider setting body type to Static temporarily if needed:
  // this._playerBody.type = CANNON.Body.STATIC;
  // this._playerBody.updateMassProperties();


  // Position camera for fly mode (e.g., higher up)
  // Use player's position before switching
  const playerPos = this._pointerLockControls.getObject().position;
  this._camera.position.set(playerPos.x, playerPos.y + 30, playerPos.z + 10); // Adjust Y and Z offset as desired
  this._camera.lookAt(playerPos.x, playerPos.y - 1.1, playerPos.z); // Look towards the player's last ground position (adjusting for eye height offset)

  this._flyControls.enabled = true;
  this._controls = this._flyControls; // Set active controls

} else {
  // --- Switch to Play Mode (PointerLockControls) ---
  this._flyControls.enabled = false;

  // Re-enable player physics body interactions if they were disabled
  // If type was changed to Static, change it back:
  // this._playerBody.type = CANNON.Body.DYNAMIC;
  // this._playerBody.mass = 5; // Restore original mass
  // this._playerBody.updateMassProperties();

  // Restore camera position based on physics body + eye height offset
  // Use _playerBody position directly as camera might have moved in Fly mode
  this._pointerLockControls.getObject().position.copy(this._playerBody.position);
  this._pointerLockControls.getObject().position.y += 1.1; // Eye height offset

  this._pointerLockControls.enabled = true;
  this._controls = this._pointerLockControls; // Set active controls
  // Optionally re-lock pointer automatically, or let user click again
  // this._pointerLockControls.lock();
}
} // Correct closing brace for _toggleControlMode

_init() { // Ensure the next method starts correctly
  }

  _init() {
    this._initGUI();
    this._initFPSMeter();

    // this._initBlack(); // Commented out BlackEngine initialization
    this._initThreeJS();

    this._setupGUI();
    this._initUpdate();
  }

  _initGUI() {
    const guiHelper = new GUIHelper();
    this._baseGUI = new BaseGUI(guiHelper.gui);
  }

  _initFPSMeter() {
    const stats = this._stats = new Stats();
    stats.showPanel(0);
    document.body.appendChild(stats.dom);

    this._stats.dom.style.visibility = 'hidden';
  }

  // _initBlack() {
  //   const engine = new Engine('container', Loader, CanvasDriver, [Input, MasterAudio]);
  //
  //   engine.pauseOnBlur = false;
  //   engine.pauseOnHide = false;
  //   engine.start();
  //
  //   engine.stage.setSize(640, 960);
  //   engine.stage.scaleMode = StageScaleMode.LETTERBOX;
  // }

  _initThreeJS() {
    this._initScene();
    this._initRenderer();
    this._initCamera();
    this._initLights();
    this._initPhysics();
    this._initLoadingOverlay();
    this._initOnResize();
    this._initAxesHelper();
    this._setupBackgroundColor();
  }

  _initScene() {
    this._scene = new THREE.Scene();
  }

  _initRenderer() {
    this._windowSizes = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    const canvas = document.querySelector('canvas.webgl');

    const renderer = this._renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: BASE_CONFIG.antialias,
    });

    renderer.setSize(this._windowSizes.width, this._windowSizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.physicallyCorrectLights = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  _initCamera() {
    const camera = this._camera = new THREE.PerspectiveCamera(BASE_CONFIG.camera.fov, this._windowSizes.width / this._windowSizes.height, BASE_CONFIG.camera.near, BASE_CONFIG.camera.far);
    this._scene.add(camera);

    // Set initial camera position for first-person view
    camera.position.set(0, 1.6, 5); // Eye level, slightly back
    // camera.lookAt(0, 1.6, 0); // Look slightly ahead

    // Initialize PointerLockControls (Play Mode)
    this._pointerLockControls = new PointerLockControls(this._camera, document.body);
    this._scene.add(this._pointerLockControls.getObject()); // Add the camera holder

    // Initialize FlyControls (God Mode)
    this._flyControls = new FlyControls(this._camera, this._renderer.domElement); // Use renderer's domElement
    this._flyControls.movementSpeed = 15; // Adjust speed as needed
    this._flyControls.rollSpeed = Math.PI / 6; // Adjust roll speed
    this._flyControls.autoForward = false;
    this._flyControls.dragToLook = true; // Use mouse drag to look around in fly mode
    this._flyControls.enabled = false; // Disabled initially

    // Set initial active controls
    this._controls = this._pointerLockControls;

    // Add event listeners for pointer lock (only for PointerLockControls)
    document.body.addEventListener('click', () => {
      if (!this._godModeEnabled) { // Only lock if not in god mode
        this._pointerLockControls.lock();
      }
    });

    this._pointerLockControls.addEventListener('lock', () => {
      console.log('Pointer locked');
      // You might want to hide instructions or UI elements here
    });

    this._pointerLockControls.addEventListener('unlock', () => {
      console.log('Pointer unlocked');
      // You might want to show instructions or UI elements here
    });

    // Add keyboard event listeners for movement and mode toggle
    const onKeyDown = (event) => {
      // Mode Toggle
      if (event.code === 'Tab') {
        event.preventDefault(); // Prevent default tab behavior
        this._toggleControlMode();
        return; // Don't process movement keys if toggling mode
      }

      // Movement keys (only relevant for Play Mode, physics handles movement)
      if (!this._godModeEnabled) {
        switch (event.code) {
          case 'ArrowUp':
          case 'KeyW':
            this._moveForward = true;
            break;
          case 'ArrowLeft':
          case 'KeyA':
            this._moveLeft = true;
            break;
          case 'ArrowDown':
          case 'KeyS':
            this._moveBackward = true;
            break;
          case 'ArrowRight':
          case 'KeyD':
            this._moveRight = true;
            break;
        }
      }
    };

    const onKeyUp = (event) => {
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
          this._moveForward = false;
          break;
        case 'ArrowLeft':
        case 'KeyA':
          this._moveLeft = false;
          break;
        case 'ArrowDown':
        case 'KeyS':
          this._moveBackward = false;
          break;
        case 'ArrowRight':
        case 'KeyD':
          this._moveRight = false;
          break;
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
  }

  _initLights() {
    const ambientLightConfig = BASE_CONFIG.lights.ambient;
    const ambientLight = this._ambientLight = new THREE.AmbientLight(ambientLightConfig.color, ambientLightConfig.intensity);
    this._scene.add(ambientLight);

    const directionalLightConfig = BASE_CONFIG.lights.directional;
    const directionalLight = this._directionalLight = new THREE.DirectionalLight(directionalLightConfig.color, directionalLightConfig.intensity);
    directionalLight.position.set(directionalLightConfig.position.x, directionalLightConfig.position.y, directionalLightConfig.position.z);
    this._scene.add(directionalLight);

    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 9;
    directionalLight.shadow.camera.bottom = -9;
    directionalLight.shadow.camera.far = 18;
    directionalLight.shadow.mapSize.set(1024, 1024);

    const directionalLightHelper = this._directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 1);
    this._scene.add(directionalLightHelper);

    const shadowCameraHelper = this._shadowCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
    this._scene.add(shadowCameraHelper);
  }

  _initPhysics() {
    this._physics = new Physics(this._scene);

    // --- Create Player Physics Body ---
    const playerRadius = 0.5; // Adjust size as needed
    const playerShape = new CANNON.Sphere(playerRadius);
    this._playerBody = new CANNON.Body({
      mass: 5, // Give the player some mass
      shape: playerShape,
      position: new CANNON.Vec3(0, 10, 5), // Start slightly above ground, matching camera's initial XZ
      // linearDamping: 0.9, // Optional damping to prevent sliding forever
      // material: Physics.materials.player // Optional: Define a specific physics material
    });
    this._playerBody.angularDamping = 1.0; // Prevent player body from rotating due to collisions

    // Add the body to the physics world (Physics class likely handles the world instance)
    Physics.addBody(this._playerBody);
    // --- End Player Physics Body ---
  }

  _initLoadingOverlay() {
    const loadingOverlay = this._loadingOverlay = new LoadingOverlay();
    this._scene.add(loadingOverlay);
  }

  _initOnResize() {
    window.addEventListener('resize', () => {
      this._windowSizes.width = window.innerWidth;
      this._windowSizes.height = window.innerHeight;

      this._camera.aspect = this._windowSizes.width / this._windowSizes.height;
      this._camera.updateProjectionMatrix();

      this._renderer.setSize(this._windowSizes.width, this._windowSizes.height);
      this._renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
  }

  _initAxesHelper() {
    const axesHelper = this._axesHelper = new THREE.AxesHelper(3);
    this._scene.add(axesHelper);
  }

  _setupBackgroundColor() {
    this._scene.background = new THREE.Color(BASE_CONFIG.backgroundColor);
  }

  _setupGUI() {
    const data = {
      controls: this._controls,
      stats: this._stats,
      physics: this._physics,
      axesHelper: this._axesHelper,
      ambientLight: this._ambientLight,
      directionalLight: this._directionalLight,
      directionalLightHelper: this._directionalLightHelper,
      shadowCameraHelper: this._shadowCameraHelper,
    }

    this._baseGUI.setup(data);
  }

  _initUpdate() {
    const clock = new THREE.Clock();
    let lastElapsedTime = 0;

    const update = () => {
      this._stats.begin();

      const elapsedTime = clock.getElapsedTime();
      const deltaTime = elapsedTime - lastElapsedTime;
      lastElapsedTime = elapsedTime;

      if (this._isAssetsLoaded) {
        // Update systems that run regardless of mode
        TWEEN.update();
        this._physics.update(deltaTime); // Step the physics world

        if (this._mainScene) {
          this._mainScene.update(deltaTime);
        }

        // Mode-specific updates
        if (this._godModeEnabled) {
          // --- God Mode Update ---
          this._flyControls.update(deltaTime);

        } else {
          // --- Play Mode Update ---
          if (this._pointerLockControls.isLocked === true) {
            // --- Physics-Based Movement Logic (when locked) ---
            const moveSpeed = 30; // Adjust force/speed as needed
            const inputVelocity = new THREE.Vector3();
            const euler = new THREE.Euler(0, 0, 0, 'YXZ'); // To get camera direction

            euler.setFromQuaternion(this._camera.quaternion); // Get camera direction

            inputVelocity.set(0, 0, 0); // Calculate movement direction based on input flags
            if (this._moveForward) inputVelocity.z = -moveSpeed;
            if (this._moveBackward) inputVelocity.z = moveSpeed;
            if (this._moveLeft) inputVelocity.x = -moveSpeed;
            if (this._moveRight) inputVelocity.x = moveSpeed;

            inputVelocity.applyEuler(euler); // Apply camera rotation

            // Apply velocity to the physics body
            this._playerBody.velocity.x = inputVelocity.x;
            this._playerBody.velocity.z = inputVelocity.z;
            // Y velocity is handled by physics (gravity)

            // --- Sync Camera to Physics Body ---
            this._pointerLockControls.getObject().position.copy(this._playerBody.position);
            this._pointerLockControls.getObject().position.y += 1.1; // Eye height offset

          } else {
            // If pointer is not locked in Play Mode, stop the player body
            this._playerBody.velocity.x = 0;
            this._playerBody.velocity.z = 0;
          }
        }

        // Render the scene
        this._renderer.render(this._scene, this._camera);
      }


      this._stats.end();
      window.requestAnimationFrame(update);
    }

    update();
  }
}
