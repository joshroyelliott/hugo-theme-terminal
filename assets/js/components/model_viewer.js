// model_viewer.js - 3D Model viewer with theme integration
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all model viewers
    initializeModelViewers();
});

function initializeModelViewers() {
    const modelViewers = document.querySelectorAll('.model-viewer');
    
    if (modelViewers.length === 0) return;
    
    // Load Three.js and modules using ES module imports from CDN
    Promise.all([
        loadScript('https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.min.js'),
        loadScript('https://cdn.jsdelivr.net/npm/three@0.160.1/examples/jsm/controls/OrbitControls.min.js'),
        loadScript('https://cdn.jsdelivr.net/npm/three@0.160.1/examples/jsm/loaders/OBJLoader.min.js'),
        loadScript('https://cdn.jsdelivr.net/npm/three@0.160.1/examples/jsm/loaders/STLLoader.min.js'),
        loadScript('https://cdn.jsdelivr.net/npm/three@0.160.1/examples/jsm/loaders/GLTFLoader.min.js')
    ]).then(() => {
        // Initialize each model viewer after all scripts are loaded
        modelViewers.forEach(setupModelViewer);
    }).catch(error => {
        console.error('Error loading Three.js libraries:', error);
        modelViewers.forEach(viewer => {
            const loading = viewer.querySelector('.model-viewer-loading');
            if (loading) {
                const text = loading.querySelector('.model-viewer-progress-text');
                if (text) {
                    text.textContent = 'Error loading 3D libraries';
                }
            }
        });
    });
}

// Helper function to load a script as a promise
function loadScript(url) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.onload = resolve;
        script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
        document.head.appendChild(script);
    });
}

function setupModelViewer(viewerElement) {
    // Get model path and type from data attributes
    const modelPath = viewerElement.getAttribute('data-model-path');
    const modelType = viewerElement.getAttribute('data-model-type').toLowerCase();
    const modelTitle = viewerElement.getAttribute('data-title');
    
    if (!modelPath) {
        console.error('Model path not specified');
        return;
    }
    
    // Get theme colors from CSS variables
    const getThemeColor = (varName) => {
        return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    };
    
    // Set up scene
    const scene = new THREE.Scene();
    
    // Use theme colors for background and grid
    const backgroundColor = new THREE.Color(getThemeColor('--base00'));
    scene.background = backgroundColor;
    
    // Set up camera with good default position
    const camera = new THREE.PerspectiveCamera(
        45, 
        viewerElement.clientWidth / viewerElement.clientHeight, 
        0.1, 
        1000
    );
    camera.position.set(5, 5, 5);
    
    // Create renderer with theme integration
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(viewerElement.clientWidth, viewerElement.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Find or create a container for the canvas
    let canvasContainer = viewerElement.querySelector('.model-viewer-canvas');
    if (!canvasContainer) {
        canvasContainer = document.createElement('div');
        canvasContainer.className = 'model-viewer-canvas';
        viewerElement.appendChild(canvasContainer);
    }
    canvasContainer.appendChild(renderer.domElement);
    
    // Set up lights with theme colors
    const ambientLight = new THREE.AmbientLight(getThemeColor('--base05'), 0.5);
    scene.add(ambientLight);
    
    const directionalLight1 = new THREE.DirectionalLight(getThemeColor('--base05'), 0.5);
    directionalLight1.position.set(1, 1, 1);
    scene.add(directionalLight1);
    
    const directionalLight2 = new THREE.DirectionalLight(getThemeColor('--base05'), 0.3);
    directionalLight2.position.set(-1, -1, -1);
    scene.add(directionalLight2);
    
    // Add grid helper with theme color
    const gridColor = new THREE.Color(getThemeColor('--base03'));
    const gridHelper = new THREE.GridHelper(10, 10, gridColor, gridColor);
    scene.add(gridHelper);
    
    // Set up orbit controls using the module
    const OrbitControls = THREE.OrbitControls;
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    
    // Show loading status
    const loadingIndicator = viewerElement.querySelector('.model-viewer-loading');
    
    // Create control buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'model-viewer-controls';
    
    const wireframeButton = document.createElement('button');
    wireframeButton.textContent = 'Toggle Wireframe';
    wireframeButton.className = 'model-viewer-button';
    
    const resetButton = document.createElement('button');
    resetButton.textContent = 'Reset View';
    resetButton.className = 'model-viewer-button';
    
    buttonContainer.appendChild(wireframeButton);
    buttonContainer.appendChild(resetButton);
    viewerElement.appendChild(buttonContainer);
    
    // Add title if provided
    if (modelTitle) {
        const titleElement = document.createElement('div');
        titleElement.className = 'model-viewer-title';
        titleElement.textContent = modelTitle;
        viewerElement.insertBefore(titleElement, viewerElement.firstChild);
    }
    
    // Choose loader based on file extension
    let loader;
    try {
        switch (modelType) {
            case 'obj':
                loader = new THREE.OBJLoader();
                break;
            case 'stl':
                loader = new THREE.STLLoader();
                break;
            case 'gltf':
            case 'glb':
                loader = new THREE.GLTFLoader();
                break;
            default:
                console.error('Unsupported model type:', modelType);
                
                if (loadingIndicator) {
                    const text = loadingIndicator.querySelector('.model-viewer-progress-text');
                    if (text) {
                        text.textContent = `Unsupported model type: ${modelType}`;
                    }
                }
                return;
        }
    } catch (error) {
        console.error('Error creating loader:', error);
        if (loadingIndicator) {
            const text = loadingIndicator.querySelector('.model-viewer-progress-text');
            if (text) {
                text.textContent = 'Error loading 3D libraries';
            }
        }
        return;
    }
    
    // Load the model
    loader.load(
        modelPath,
        function (object) {
            // Hide loading indicator
            if (loadingIndicator) {
                loadingIndicator.style.display = 'none';
            }
            
            // Handle different model types
            if (modelType === 'obj') {
                // OBJ models can be added directly to the scene
                // Apply theme-colored material to all meshes
                const material = new THREE.MeshStandardMaterial({
                    color: new THREE.Color(getThemeColor('--base0D')),
                    metalness: 0.2,
                    roughness: 0.5
                });
                
                object.traverse(function (child) {
                    if (child instanceof THREE.Mesh) {
                        child.material = material;
                    }
                });
                
                scene.add(object);
                centerModel(object, scene);
            } else if (modelType === 'stl') {
                // STL loader returns geometry which needs to be added to a mesh
                const material = new THREE.MeshStandardMaterial({
                    color: new THREE.Color(getThemeColor('--base0D')),
                    metalness: 0.2,
                    roughness: 0.5
                });
                
                const mesh = new THREE.Mesh(object, material);
                scene.add(mesh);
                centerModel(mesh, scene);
            } else if (modelType === 'gltf' || modelType === 'glb') {
                // GLTF models have a different structure
                scene.add(object.scene);
                centerModel(object.scene, scene);
            }
            
            // Adjust camera to fit model
            fitCameraToObject(camera, scene, controls);
            
            // Enable control buttons now that model is loaded
            wireframeButton.addEventListener('click', function() {
                scene.traverse(function(object) {
                    if (object instanceof THREE.Mesh) {
                        object.material.wireframe = !object.material.wireframe;
                    }
                });
            });
            
            resetButton.addEventListener('click', function() {
                fitCameraToObject(camera, scene, controls);
            });
        },
        function (xhr) {
            // Update loading progress
            if (loadingIndicator) {
                const percentComplete = xhr.loaded / xhr.total * 100;
                const progressText = loadingIndicator.querySelector('.model-viewer-progress-text');
                const progressBar = loadingIndicator.querySelector('.model-viewer-progress-bar');
                
                if (progressText) {
                    progressText.textContent = `Loading: ${Math.round(percentComplete)}%`;
                }
                
                if (progressBar) {
                    progressBar.style.width = `${percentComplete}%`;
                }
            }
        },
        function (error) {
            console.error('Error loading model:', error);
            if (loadingIndicator) {
                const progressText = loadingIndicator.querySelector('.model-viewer-progress-text');
                if (progressText) {
                    progressText.textContent = 'Error loading model';
                }
            }
        }
    );
    
    // Handle window resize
    window.addEventListener('resize', function() {
        camera.aspect = viewerElement.clientWidth / viewerElement.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(viewerElement.clientWidth, viewerElement.clientHeight);
    });
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    
    animate();
    
    // Add resize observer to handle container resizing
    const resizeObserver = new ResizeObserver(() => {
        camera.aspect = viewerElement.clientWidth / viewerElement.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(viewerElement.clientWidth, viewerElement.clientHeight);
    });
    
    resizeObserver.observe(viewerElement);
}

// Helper function to center model in scene
function centerModel(object, scene) {
    // Create a bounding box for the object
    const boundingBox = new THREE.Box3().setFromObject(object);
    
    // Calculate the center of the bounding box
    const center = new THREE.Vector3();
    boundingBox.getCenter(center);
    
    // Move the object so its center is at the origin
    object.position.sub(center);
    
    // Calculate size to help with camera positioning
    const size = new THREE.Vector3();
    boundingBox.getSize(size);
    
    // Return the size of the model for camera calculations
    return Math.max(size.x, size.y, size.z);
}

// Helper function to position camera to view entire model
function fitCameraToObject(camera, scene, controls) {
    const boundingBox = new THREE.Box3().setFromObject(scene);
    
    const center = new THREE.Vector3();
    boundingBox.getCenter(center);
    
    const size = new THREE.Vector3();
    boundingBox.getSize(size);
    
    // Get the max side of the bounding box
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    const cameraDistance = maxDim / (2 * Math.tan(fov / 2));
    
    // Set camera position 
    const direction = new THREE.Vector3(1, 1, 1).normalize();
    const distance = cameraDistance * 1.5; // Add some padding
    
    camera.position.copy(center.clone().add(direction.multiplyScalar(distance)));
    camera.lookAt(center);
    camera.updateProjectionMatrix();
    
    // Update controls target to center of model
    controls.target.copy(center);
    controls.update();
}