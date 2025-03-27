// Keyboard UI visualization
export class KeyboardUI {
    constructor() {
        this.keys = {
            'KeyW': { element: null, pressed: false },
            'KeyA': { element: null, pressed: false },
            'KeyS': { element: null, pressed: false },
            'KeyD': { element: null, pressed: false },
            'KeyQ': { element: null, pressed: false },
            'KeyE': { element: null, pressed: false },
            'Tab': { element: null, pressed: false },
            'Escape': { element: null, pressed: false },
            'KeyR': { element: null, pressed: false },
            'Delete': { element: null, pressed: false }
        };
        
        this.createKeyboardUI();
        this.addEventListeners();
    }
    
    createKeyboardUI() {
        // Create keyboard container
        const keyboardContainer = document.createElement('div');
        keyboardContainer.id = 'keyboard-ui';
        keyboardContainer.style.position = 'absolute';
        keyboardContainer.style.bottom = '10px';
        keyboardContainer.style.left = '50%';
        keyboardContainer.style.transform = 'translateX(-50%)';
        keyboardContainer.style.display = 'flex';
        keyboardContainer.style.flexDirection = 'column';
        keyboardContainer.style.alignItems = 'center';
        keyboardContainer.style.gap = '5px';
        keyboardContainer.style.padding = '10px';
        keyboardContainer.style.background = 'rgba(0,0,0,0.5)';
        keyboardContainer.style.borderRadius = '5px';
        keyboardContainer.style.zIndex = '100';
        
        // Create WASD row
        const wasdRow = document.createElement('div');
        wasdRow.style.display = 'flex';
        wasdRow.style.gap = '5px';
        
        // Create W key
        this.keys['KeyW'].element = this.createKey('W');
        wasdRow.appendChild(this.keys['KeyW'].element);
        
        // Create ASD row
        const asdRow = document.createElement('div');
        asdRow.style.display = 'flex';
        asdRow.style.gap = '5px';
        
        // Create A key
        this.keys['KeyA'].element = this.createKey('A');
        asdRow.appendChild(this.keys['KeyA'].element);
        
        // Create S key
        this.keys['KeyS'].element = this.createKey('S');
        asdRow.appendChild(this.keys['KeyS'].element);
        
        // Create D key
        this.keys['KeyD'].element = this.createKey('D');
        asdRow.appendChild(this.keys['KeyD'].element);
        
        // Create special keys row
        const specialRow = document.createElement('div');
        specialRow.style.display = 'flex';
        specialRow.style.gap = '5px';
        specialRow.style.marginTop = '10px';
        
        // Create Q key
        this.keys['KeyQ'].element = this.createKey('Q');
        specialRow.appendChild(this.keys['KeyQ'].element);
        
        // Create E key
        this.keys['KeyE'].element = this.createKey('E');
        specialRow.appendChild(this.keys['KeyE'].element);
        
        // Create Tab key
        this.keys['Tab'].element = this.createKey('Tab', 60);
        specialRow.appendChild(this.keys['Tab'].element);
        
        // Create R key
        this.keys['KeyR'].element = this.createKey('R');
        specialRow.appendChild(this.keys['KeyR'].element);
        
        // Create Del key
        this.keys['Delete'].element = this.createKey('Del', 50);
        specialRow.appendChild(this.keys['Delete'].element);
        
        // Create Esc key
        this.keys['Escape'].element = this.createKey('Esc', 50);
        specialRow.appendChild(this.keys['Escape'].element);
        
        // Add rows to container
        keyboardContainer.appendChild(wasdRow);
        keyboardContainer.appendChild(asdRow);
        keyboardContainer.appendChild(specialRow);
        
        // Add container to document
        document.body.appendChild(keyboardContainer);
    }
    
    createKey(label, width = 40) {
        const key = document.createElement('div');
        key.textContent = label;
        key.style.width = `${width}px`;
        key.style.height = '40px';
        key.style.backgroundColor = '#333';
        key.style.color = 'white';
        key.style.display = 'flex';
        key.style.justifyContent = 'center';
        key.style.alignItems = 'center';
        key.style.borderRadius = '5px';
        key.style.border = '2px solid #555';
        key.style.fontFamily = 'Arial, sans-serif';
        key.style.fontWeight = 'bold';
        key.style.fontSize = '14px';
        key.style.userSelect = 'none';
        key.style.transition = 'all 0.1s ease';
        return key;
    }
    
    addEventListeners() {
        document.addEventListener('keydown', (event) => {
            if (this.keys[event.code]) {
                this.keys[event.code].pressed = true;
                this.updateKeyVisuals();
            }
        });
        
        document.addEventListener('keyup', (event) => {
            if (this.keys[event.code]) {
                this.keys[event.code].pressed = false;
                this.updateKeyVisuals();
            }
        });
    }
    
    updateKeyVisuals() {
        for (const code in this.keys) {
            const key = this.keys[code];
            if (key.pressed) {
                key.element.style.backgroundColor = '#4CAF50';
                key.element.style.transform = 'translateY(2px)';
                key.element.style.boxShadow = '0 0 5px rgba(76, 175, 80, 0.7)';
            } else {
                key.element.style.backgroundColor = '#333';
                key.element.style.transform = 'translateY(0)';
                key.element.style.boxShadow = 'none';
            }
        }
    }
}