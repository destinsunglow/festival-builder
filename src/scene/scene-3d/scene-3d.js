import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import Loader from '../../core/loader';
import Physics from '../../core/physics';
// import Utils from '../../helpers/utils'; // Not needed for simple plane

export default class Scene3D extends THREE.Group {
  constructor(camera) {
    super();

    this._camera = camera;
    this._floorMaterial = null;

    this._init();
  }

  update(dt) {
    // Placeholder for future updates
  }

  _init() {
    this._initFloor();
    // Removed border and geometry configuration calls
  }

  _initFloor() {
    // Use PlaneGeometry for a large flat terrain
    const geometry = new THREE.PlaneGeometry(1500, 1500);
    this._floorMaterial = new THREE.MeshStandardMaterial({
      color: '#559020', // Grassy green color
      metalness: 0.1,
      roughness: 0.8,
      // envMap: Loader.environmentMap, // Optional: Add later if needed
      // envMapIntensity: 0.5,
    });

    const floor = new THREE.Mesh(geometry, this._floorMaterial);
    // Rotate the plane to be horizontal
    floor.rotation.x = -Math.PI / 2;
    this.add(floor);

    floor.receiveShadow = true;

    // Create Cannon.js physics body for the plane
    const floorShape = new CANNON.Plane();
    const floorBody = new CANNON.Body({
      mass: 0, // Static body
      shape: floorShape,
      // Optional: Define a physics material for friction/restitution
      // material: Physics.materials.ground,
    });
    // Rotate the physics plane to match the visual plane
    floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    // Position the physics plane slightly below y=0 if needed, but usually 0 is fine
    // floorBody.position.y = -0.01;
    Physics.addBody(floorBody, floor); // Associate physics body with mesh
  }

  // Removed _initBorders, _initLongBorder, _initShortBorder
  // Removed _configureGeometryAndMaterial
  // Removed _createSphere, _createBox
  // Removed resetItems, createItem
}
