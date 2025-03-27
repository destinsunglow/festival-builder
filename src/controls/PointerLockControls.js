import { PointerLockControls as ThreePointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { Euler, Vector3 } from 'three';

// Custom PointerLockControls that extends the original Three.js PointerLockControls
// but disables the roll functionality (tilting left and right)
class PointerLockControls extends ThreePointerLockControls {
    constructor(camera, domElement) {
        super(camera, domElement);
        
        // Override the onMouseMove method to prevent roll
        this.onMouseMove = function(event) {
            if (this.isLocked === false) return;

            const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
            const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

            // Only allow yaw (left/right) movement, disable pitch (up/down) movement
            // by setting movementY to 0
            this._euler.setFromQuaternion(this.camera.quaternion);
            this._euler.y -= movementX * 0.002;
            
            // Comment out the pitch control to disable tilting up/down
            // this._euler.x -= movementY * 0.002;
            
            // Clamp to avoid the camera flipping
            // this._euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this._euler.x));

            this.camera.quaternion.setFromEuler(this._euler);

            this.dispatchEvent(this._changeEvent);
        };
    }
}

export { PointerLockControls };