let scene, camera, renderer, currentShape;
        let isMouseDown = false;
        let mouseX = 0, mouseY = 0;
        let rotationX = 0, rotationY = 0;
        let currentTexture = null;
        let isDarkMode = false;

        // Initialize Three.js
        function init() {
            const canvas = document.getElementById('canvas');
            const viewport = document.getElementById('viewport');

            // Scene setup
            scene = new THREE.Scene();
            scene.background = new THREE.Color(0x000000);
            scene.background.setHex(0x222222);

            // Camera setup
            camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
            camera.position.z = 5;

            // Renderer setup
            renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
            renderer.setSize(400, 400);
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;

            // Lighting
            const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
            scene.add(ambientLight);

            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
            directionalLight.position.set(5, 5, 5);
            directionalLight.castShadow = true;
            scene.add(directionalLight);

            const pointLight = new THREE.PointLight(0x00d2ff, 0.5, 100);
            pointLight.position.set(-5, 5, 0);
            scene.add(pointLight);

            // Create initial shape
            createCube();

            // Event listeners
            setupEventListeners();

            // Start animation loop
            animate();
        }

        function createCube() {
            if (currentShape) {
                scene.remove(currentShape);
            }

            const geometry = new THREE.BoxGeometry(2, 2, 2);
            const material = currentTexture ?
                new THREE.MeshLambertMaterial({ map: currentTexture }) :
                new THREE.MeshLambertMaterial({ color: 0x00d2ff });

            currentShape = new THREE.Mesh(geometry, material);
            currentShape.castShadow = true;
            currentShape.receiveShadow = true;
            scene.add(currentShape);

            updateShapeInfo('Cube', 8, 6);
        }

        function createSphere() {
            if (currentShape) {
                scene.remove(currentShape);
            }

            const geometry = new THREE.SphereGeometry(1.5, 32, 32);
            const material = currentTexture ?
                new THREE.MeshLambertMaterial({ map: currentTexture }) :
                new THREE.MeshLambertMaterial({ color: 0xff6b6b });

            currentShape = new THREE.Mesh(geometry, material);
            currentShape.castShadow = true;
            currentShape.receiveShadow = true;
            scene.add(currentShape);

            updateShapeInfo('Sphere', 1026, 2048);
        }

        function createPyramid() {
            if (currentShape) {
                scene.remove(currentShape);
            }

            const geometry = new THREE.ConeGeometry(1.5, 3, 4);
            const material = currentTexture ?
                new THREE.MeshLambertMaterial({ map: currentTexture }) :
                new THREE.MeshLambertMaterial({ color: 0xa8edea });

            currentShape = new THREE.Mesh(geometry, material);
            currentShape.castShadow = true;
            currentShape.receiveShadow = true;
            scene.add(currentShape);

            updateShapeInfo('Pyramid', 5, 5);
        }

        function changeShape(shape) {
            // Update active button
            document.querySelectorAll('.shape-btn').forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');

            switch(shape) {
                case 'cube':
                    createCube();
                    break;
                case 'sphere':
                    createSphere();
                    break;
                case 'pyramid':
                    createPyramid();
                    break;
            }
        }

        function setupEventListeners() {
            const viewport = document.getElementById('viewport');

            viewport.addEventListener('contextmenu', (e) => {
                e.preventDefault();
            });

            viewport.addEventListener('mousedown', (e) => {
                if (e.button === 2) { // Right mouse button
                    isMouseDown = true;
                    mouseX = e.clientX;
                    mouseY = e.clientY;
                }
            });

            viewport.addEventListener('mousemove', (e) => {
                if (isMouseDown) {
                    const deltaX = e.clientX - mouseX;
                    const deltaY = e.clientY - mouseY;

                    rotationY += deltaX * 0.01;
                    rotationX += deltaY * 0.01;

                    mouseX = e.clientX;
                    mouseY = e.clientY;
                }
            });

            viewport.addEventListener('mouseup', () => {
                isMouseDown = false;
            });

            viewport.addEventListener('mouseleave', () => {
                isMouseDown = false;
            });
        }

        function animate() {
            requestAnimationFrame(animate);

            if (currentShape) {
                currentShape.rotation.x = rotationX;
                currentShape.rotation.y = rotationY;
            }

            renderer.render(scene, camera);
        }

        function loadTexture(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const img = new Image();
                    img.onload = function() {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        canvas.width = img.width;
                        canvas.height = img.height;
                        ctx.drawImage(img, 0, 0);

                        currentTexture = new THREE.CanvasTexture(canvas);
                        currentTexture.wrapS = THREE.RepeatWrapping;
                        currentTexture.wrapT = THREE.RepeatWrapping;

                        // Reapply texture to current shape
                        if (currentShape) {
                            currentShape.material.map = currentTexture;
                            currentShape.material.needsUpdate = true;
                        }
                    };
                    img.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        }

        function removeTexture() {
            currentTexture = null;
            if (currentShape) {
                currentShape.material.map = null;
                currentShape.material.needsUpdate = true;
            }
        }

        function updateShapeInfo(name, vertices, faces) {
            document.getElementById('shapeInfo').textContent = `Current shape: ${name}`;
            document.getElementById('vertexCount').textContent = vertices;
            document.getElementById('faceCount').textContent = faces;
        }

        function toggleTheme() {
            isDarkMode = !isDarkMode;
            document.body.classList.toggle('dark', isDarkMode);

            const toggleBtn = document.querySelector('.theme-toggle');
            toggleBtn.textContent = isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode';

            // Update scene background
            scene.background.setHex(isDarkMode ? 0x000000 : 0x222222);
        }

        // Initialize when page loads
        window.addEventListener('load', init);