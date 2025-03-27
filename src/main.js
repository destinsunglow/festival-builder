import './style.css';
import { FestivalBuilder } from './festival-builder';
import { KeyboardUI } from './keyboard-ui';

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create loading overlay
    const loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'loading-overlay';
    
    const loadingText = document.createElement('div');
    loadingText.id = 'loading-text';
    loadingText.textContent = 'Loading Festival Builder...';
    
    const loadingProgress = document.createElement('div');
    loadingProgress.id = 'loading-progress';
    
    const loadingBar = document.createElement('div');
    loadingBar.id = 'loading-bar';
    
    loadingProgress.appendChild(loadingBar);
    loadingOverlay.appendChild(loadingText);
    loadingOverlay.appendChild(loadingProgress);
    document.body.appendChild(loadingOverlay);
    
    // Create object panel elements
    createObjectPanels();
    
    // Initialize the festival builder
    const festivalBuilder = new FestivalBuilder();
    
    // Initialize the keyboard UI
    const keyboardUI = new KeyboardUI();
    
    // Hide loading overlay after a short delay
    setTimeout(() => {
        loadingBar.style.width = '100%';
        setTimeout(() => {
            loadingOverlay.style.opacity = '0';
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
            }, 500);
        }, 500);
    }, 1000);
});

// Create UI panels for object manipulation
function createObjectPanels() {
    // Create object panel if it doesn't exist
    if (!document.getElementById('object-panel')) {
        const objectPanel = document.createElement('div');
        objectPanel.id = 'object-panel';
        objectPanel.innerHTML = `
            <h3>Object Library</h3>
            
            <!-- Stages & Audio -->
            <div class="category expanded">
                <div class="category-title">Stages & Audio</div>
                <div class="category-items">
                    <button class="object-button" data-type="main-stage">
                        <div class="object-icon" style="background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiPjxyZWN0IHg9IjIiIHk9IjE2IiB3aWR0aD0iMjAiIGhlaWdodD0iNCIvPjxyZWN0IHg9IjQiIHk9IjgiIHdpZHRoPSIxNiIgaGVpZ2h0PSI4Ii8+PHJlY3QgeD0iNiIgeT0iNCIgd2lkdGg9IjEyIiBoZWlnaHQ9IjQiLz48L3N2Zz4=');"></div>
                        Main Stage
                    </button>
                    <button class="object-button" data-type="side-stage">
                        <div class="object-icon" style="background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiPjxyZWN0IHg9IjQiIHk9IjE2IiB3aWR0aD0iMTYiIGhlaWdodD0iNCIvPjxyZWN0IHg9IjYiIHk9IjEwIiB3aWR0aD0iMTIiIGhlaWdodD0iNiIvPjwvc3ZnPg==');"></div>
                        Side Stage
                    </button>
                    <button class="object-button" data-type="speaker-stack">
                        <div class="object-icon" style="background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiPjxyZWN0IHg9IjYiIHk9IjQiIHdpZHRoPSIxMiIgaGVpZ2h0PSIxNiIgcng9IjEiLz48Y2lyY2xlIGN4PSIxMiIgY3k9IjgiIHI9IjIiLz48Y2lyY2xlIGN4PSIxMiIgY3k9IjE2IiByPSIzIi8+PC9zdmc+');"></div>
                        Speaker Stack
                    </button>
                    <button class="object-button" data-type="dj-booth">
                        <div class="object-icon" style="background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiPjxyZWN0IHg9IjQiIHk9IjEyIiB3aWR0aD0iMTYiIGhlaWdodD0iOCIvPjxyZWN0IHg9IjYiIHk9IjgiIHdpZHRoPSI0IiBoZWlnaHQ9IjQiIHJ4PSIxIi8+PHJlY3QgeD0iMTQiIHk9IjgiIHdpZHRoPSI0IiBoZWlnaHQ9IjQiIHJ4PSIxIi8+PC9zdmc+');"></div>
                        DJ Booth
                    </button>
                </div>
            </div>
            
            <!-- Attractions -->
            <div class="category expanded">
                <div class="category-title">Attractions</div>
                <div class="category-items">
                    <button class="object-button" data-type="ferris-wheel">
                        <div class="object-icon" style="background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjgiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIvPjxjaXJjbGUgY3g9IjEyIiBjeT0iNCIgcj0iMiIvPjxjaXJjbGUgY3g9IjE4LjciIGN5PSI3LjUiIHI9IjIiLz48Y2lyY2xlIGN4PSIxOC43IiBjeT0iMTYuNSIgcj0iMiIvPjxjaXJjbGUgY3g9IjEyIiBjeT0iMjAiIHI9IjIiLz48Y2lyY2xlIGN4PSI1LjMiIGN5PSIxNi41IiByPSIyIi8+PGNpcmNsZSBjeD0iNS4zIiBjeT0iNy41IiByPSIyIi8+PC9zdmc+');"></div>
                        Ferris Wheel
                    </button>
                    <button class="object-button" data-type="food-stand">
                        <div class="object-icon" style="background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiPjxyZWN0IHg9IjQiIHk9IjEyIiB3aWR0aD0iMTYiIGhlaWdodD0iOCIvPjxwb2x5Z29uIHBvaW50cz0iNCwxMiA4LDYgMTYsNiAyMCwxMiIvPjwvc3ZnPg==');"></div>
                        Food Stand
                    </button>
                    <button class="object-button" data-type="art-installation">
                        <div class="object-icon" style="background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjYiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIvPjxwYXRoIGQ9Ik0xMiw2IEwxMiwxOCIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIi8+PHBhdGggZD0iTTYsMTIgTDE4LDEyIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiLz48L3N2Zz4=');"></div>
                        Art Installation
                    </button>
                </div>
            </div>
            
            <!-- Camping -->
            <div class="category expanded">
                <div class="category-title">Camping</div>
                <div class="category-items">
                    <button class="object-button" data-type="tent">
                        <div class="object-icon" style="background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiPjxwb2x5Z29uIHBvaW50cz0iMiwyMCAxMiw0IDIyLDIwIi8+PGxpbmUgeDE9IjIiIHkxPSIyMCIgeDI9IjIyIiB5Mj0iMjAiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIvPjwvc3ZnPg==');"></div>
                        Tent
                    </button>
                    <button class="object-button" data-type="rv">
                        <div class="object-icon" style="background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiPjxyZWN0IHg9IjIiIHk9IjEwIiB3aWR0aD0iMjAiIGhlaWdodD0iOCIgcng9IjEiLz48cmVjdCB4PSIxNiIgeT0iNiIgd2lkdGg9IjYiIGhlaWdodD0iNCIvPjxjaXJjbGUgY3g9IjYiIGN5PSIxOCIgcj0iMiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIi8+PGNpcmNsZSBjeD0iMTgiIGN5PSIxOCIgcj0iMiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+');"></div>
                        RV
                    </button>
                    <button class="object-button" data-type="toilet">
                        <div class="object-icon" style="background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiPjxyZWN0IHg9IjYiIHk9IjQiIHdpZHRoPSIxMiIgaGVpZ2h0PSIxNiIgcng9IjEiLz48cmVjdCB4PSI4IiB5PSIxMiIgd2lkdGg9IjgiIGhlaWdodD0iNCIgcng9IjEiLz48L3N2Zz4=');"></div>
                        Toilet
                    </button>
                </div>
            </div>
            
            <!-- Infrastructure -->
            <div class="category expanded">
                <div class="category-title">Infrastructure</div>
                <div class="category-items">
                    <button class="object-button" data-type="fence">
                        <div class="object-icon" style="background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiPjxsaW5lIHgxPSI0IiB5MT0iNiIgeDI9IjIwIiB5Mj0iNiIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIi8+PGxpbmUgeDE9IjQiIHkxPSIxMiIgeDI9IjIwIiB5Mj0iMTIiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIvPjxsaW5lIHgxPSI0IiB5MT0iMTgiIHgyPSIyMCIgeTI9IjE4IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiLz48bGluZSB4MT0iNiIgeTE9IjQiIHgyPSI2IiB5Mj0iMjAiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIvPjxsaW5lIHgxPSIxMiIgeTE9IjQiIHgyPSIxMiIgeTI9IjIwIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiLz48bGluZSB4MT0iMTgiIHkxPSI0IiB4Mj0iMTgiIHkyPSIyMCIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+');"></div>
                        Fence
                    </button>
                    <button class="object-button" data-type="road">
                        <div class="object-icon" style="background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiPjxyZWN0IHg9IjIiIHk9IjgiIHdpZHRoPSIyMCIgaGVpZ2h0PSI4IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiLz48bGluZSB4MT0iMTIiIHkxPSI5IiB4Mj0iMTIiIHkyPSIxMSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtZGFzaGFycmF5PSIyLDIiLz48bGluZSB4MT0iMTIiIHkxPSIxMyIgeDI9IjEyIiB5Mj0iMTUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWRhc2hhcnJheT0iMiwyIi8+PC9zdmc+');"></div>
                        Road
                    </button>
                    <button class="object-button" data-type="sign">
                        <div class="object-icon" style="background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiPjxyZWN0IHg9IjYiIHk9IjQiIHdpZHRoPSIxMiIgaGVpZ2h0PSI4IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiLz48bGluZSB4MT0iMTIiIHkxPSIxMiIgeDI9IjEyIiB5Mj0iMjAiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIvPjwvc3ZnPg==');"></div>
                        Sign
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(objectPanel);
    }
    
    // Create minimap
    const minimap = document.createElement('div');
    minimap.id = 'minimap';
    document.body.appendChild(minimap);
    
    // Create save/load panel
    const saveLoadPanel = document.createElement('div');
    saveLoadPanel.id = 'save-load-panel';
    saveLoadPanel.innerHTML = `
        <button class="save-load-button" id="save-button">Save Layout</button>
        <button class="save-load-button" id="load-button">Load Layout</button>
    `;
    document.body.appendChild(saveLoadPanel);
    
    // Create object controls
    const objectControls = document.createElement('div');
    objectControls.id = 'object-controls';
    objectControls.innerHTML = `
        <button class="control-button" id="rotate-left">↺</button>
        <button class="control-button" id="rotate-right">↻</button>
        <button class="control-button" id="scale-up">+</button>
        <button class="control-button" id="scale-down">-</button>
        <button class="control-button" id="duplicate">⎘</button>
        <button class="control-button" id="delete">🗑</button>
    `;
    document.body.appendChild(objectControls);
    
    // Create properties panel
    const propertiesPanel = document.createElement('div');
    propertiesPanel.id = 'properties-panel';
    propertiesPanel.innerHTML = `
        <h3>Object Properties</h3>
        <div class="property-group">
            <label class="property-label">Color</label>
            <input type="color" id="object-color" class="property-input">
        </div>
        <div class="property-group">
            <label class="property-label">Scale</label>
            <input type="range" id="object-scale" class="property-input" min="0.5" max="3" step="0.1" value="1">
        </div>
        <div class="button-row">
            <button class="panel-button" id="cancel-properties">Cancel</button>
            <button class="panel-button primary" id="apply-properties">Apply & Place</button>
        </div>
    `;
    document.body.appendChild(propertiesPanel);
}
