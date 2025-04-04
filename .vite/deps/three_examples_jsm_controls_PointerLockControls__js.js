import {
  Euler,
  EventDispatcher,
  Vector3
} from "./chunk-PII7LJ7Q.js";

// node_modules/three/examples/jsm/controls/PointerLockControls.js
var _euler = new Euler(0, 0, 0, "YXZ");
var _vector = new Vector3();
var _changeEvent = { type: "change" };
var _lockEvent = { type: "lock" };
var _unlockEvent = { type: "unlock" };
var _PI_2 = Math.PI / 2;
var PointerLockControls = class extends EventDispatcher {
  constructor(camera, domElement) {
    super();
    this.domElement = domElement;
    this.isLocked = false;
    this.minPolarAngle = 0;
    this.maxPolarAngle = Math.PI;
    this.pointerSpeed = 1;
    const scope = this;
    function onMouseMove(event) {
      if (scope.isLocked === false)
        return;
      const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
      const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
      _euler.setFromQuaternion(camera.quaternion);
      _euler.y -= movementX * 2e-3 * scope.pointerSpeed;
      _euler.x -= movementY * 2e-3 * scope.pointerSpeed;
      _euler.x = Math.max(_PI_2 - scope.maxPolarAngle, Math.min(_PI_2 - scope.minPolarAngle, _euler.x));
      camera.quaternion.setFromEuler(_euler);
      scope.dispatchEvent(_changeEvent);
    }
    function onPointerlockChange() {
      if (scope.domElement.ownerDocument.pointerLockElement === scope.domElement) {
        scope.dispatchEvent(_lockEvent);
        scope.isLocked = true;
      } else {
        scope.dispatchEvent(_unlockEvent);
        scope.isLocked = false;
      }
    }
    function onPointerlockError() {
      console.error("THREE.PointerLockControls: Unable to use Pointer Lock API");
    }
    this.connect = function() {
      scope.domElement.ownerDocument.addEventListener("mousemove", onMouseMove);
      scope.domElement.ownerDocument.addEventListener("pointerlockchange", onPointerlockChange);
      scope.domElement.ownerDocument.addEventListener("pointerlockerror", onPointerlockError);
    };
    this.disconnect = function() {
      scope.domElement.ownerDocument.removeEventListener("mousemove", onMouseMove);
      scope.domElement.ownerDocument.removeEventListener("pointerlockchange", onPointerlockChange);
      scope.domElement.ownerDocument.removeEventListener("pointerlockerror", onPointerlockError);
    };
    this.dispose = function() {
      this.disconnect();
    };
    this.getObject = function() {
      return camera;
    };
    this.getDirection = function() {
      const direction = new Vector3(0, 0, -1);
      return function(v) {
        return v.copy(direction).applyQuaternion(camera.quaternion);
      };
    }();
    this.moveForward = function(distance) {
      _vector.setFromMatrixColumn(camera.matrix, 0);
      _vector.crossVectors(camera.up, _vector);
      camera.position.addScaledVector(_vector, distance);
    };
    this.moveRight = function(distance) {
      _vector.setFromMatrixColumn(camera.matrix, 0);
      camera.position.addScaledVector(_vector, distance);
    };
    this.lock = function() {
      this.domElement.requestPointerLock();
    };
    this.unlock = function() {
      scope.domElement.ownerDocument.exitPointerLock();
    };
    this.connect();
  }
};
export {
  PointerLockControls
};
//# sourceMappingURL=three_examples_jsm_controls_PointerLockControls__js.js.map
