function togglePassword() {
    const passwordField = document.getElementById('password');
    const eyeIcon = document.querySelector('.password-toggle i');
    
    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        eyeIcon.classList.remove('fa-eye');
        eyeIcon.classList.add('fa-eye-slash');
    } else {
        passwordField.type = 'password';
        eyeIcon.classList.remove('fa-eye-slash');
        eyeIcon.classList.add('fa-eye');
    }
}

document.getElementById('registrationForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Basic validation
    const inputs = this.querySelectorAll('input, select');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.style.borderColor = '#ef4444';
            isValid = false;
        } else {
            input.style.borderColor = '#e5e7eb';
        }
    });
    
    if (isValid) {
        // Simulate successful registration
        const submitBtn = this.querySelector('button[type="submit"]');
        submitBtn.innerHTML = '<i class="fas fa-check mr-2"></i> تم إنشاء الحساب بنجاح!';
        submitBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            alert('تم إنشاء الحساب بنجاح! سيتم توجيهك إلى الصفحة الرئيسية.');
            this.reset();
            submitBtn.innerHTML = '<i class="fas fa-user-plus mr-2"></i> إنشاء الحساب';
            submitBtn.style.background = 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
            submitBtn.disabled = false;
        }, 2000);
    }
});

// Add input validation styling
const inputs = document.querySelectorAll('input, select');
inputs.forEach(input => {
    input.addEventListener('input', function() {
        if (this.value.trim()) {
            this.style.borderColor = '#e5e7eb';
        }
    });
});

// Populate day dropdown
function populateDayDropdown() {
    const daySelect = document.getElementById('daySelect');
    for(let i = 1; i <= 31; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        daySelect.appendChild(option);
    }
}

// Populate year dropdown
function populateYearDropdown() {
    const yearSelect = document.getElementById('yearSelect');
    const currentYear = new Date().getFullYear();
    for(let i = currentYear; i >= currentYear - 100; i--) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        yearSelect.appendChild(option);
    }
}

// Create WebGL metaballs background
function createMetaballsBackground() {
    var canvas = document.createElement("canvas");
    var width = canvas.width = window.innerWidth;
    var height = canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    
    // Set canvas styles
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100vw";
    canvas.style.height = "100vh";
    canvas.style.zIndex = "-1";
    
    var gl = canvas.getContext('webgl');
    if (!gl) {
        console.error('WebGL not supported');
        return;
    }

    var mouse = {x: 0, y: 0};
    var numMetaballs = 30;
    var metaballs = [];

    for (var i = 0; i < numMetaballs; i++) {
        var radius = Math.random() * 60 + 10;
        metaballs.push({
            x: Math.random() * (width - 2 * radius) + radius,
            y: Math.random() * (height - 2 * radius) + radius,
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 3,
            r: radius * 0.75
        });
    }

    var vertexShaderSrc = `
        attribute vec2 position;
        void main() {
            gl_Position = vec4(position, 0.0, 1.0);
        }
    `;

    var fragmentShaderSrc = `
        precision highp float;
        const float WIDTH = ` + (width >> 0) + `.0;
        const float HEIGHT = ` + (height >> 0) + `.0;
        uniform vec3 metaballs[` + numMetaballs + `];

        void main(){
            float x = gl_FragCoord.x;
            float y = gl_FragCoord.y;
            float sum = 0.0;
            
            for (int i = 0; i < ` + numMetaballs + `; i++) {
                vec3 metaball = metaballs[i];
                float dx = metaball.x - x;
                float dy = metaball.y - y;
                float radius = metaball.z;
                sum += (radius * radius) / (dx * dx + dy * dy);
            }

            if (sum >= 0.99) {
                gl_FragColor = vec4(mix(vec3(x / WIDTH, y / HEIGHT, 1.0), vec3(0, 0, 0), max(0.0, 1.0 - (sum - 0.99) * 100.0)), 1.0);
                return;
            }

            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        }
    `;

    function compileShader(shaderSource, shaderType) {
        var shader = gl.createShader(shaderType);
        gl.shaderSource(shader, shaderSource);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            throw "Shader compile failed with: " + gl.getShaderInfoLog(shader);
        }
        return shader;
    }

    function getUniformLocation(program, name) {
        var uniformLocation = gl.getUniformLocation(program, name);
        if (uniformLocation === -1) {
            throw 'Can not find uniform ' + name + '.';
        }
        return uniformLocation;
    }

    function getAttribLocation(program, name) {
        var attributeLocation = gl.getAttribLocation(program, name);
        if (attributeLocation === -1) {
            throw 'Can not find attribute ' + name + '.';
        }
        return attributeLocation;
    }

    var vertexShader = compileShader(vertexShaderSrc, gl.VERTEX_SHADER);
    var fragmentShader = compileShader(fragmentShaderSrc, gl.FRAGMENT_SHADER);

    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    var vertexData = new Float32Array([
        -1.0,  1.0, // top left
        -1.0, -1.0, // bottom left
        1.0,  1.0, // top right
        1.0, -1.0, // bottom right
    ]);
    var vertexDataBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexDataBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);

    var positionHandle = getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionHandle);
    gl.vertexAttribPointer(positionHandle, 2, gl.FLOAT, gl.FALSE, 2 * 4, 0);

    var metaballsHandle = getUniformLocation(program, 'metaballs');

    function loop() {
        for (var i = 0; i < numMetaballs; i++) {
            var metaball = metaballs[i];
            metaball.x += metaball.vx;
            metaball.y += metaball.vy;

            if (metaball.x < metaball.r || metaball.x > width - metaball.r) metaball.vx *= -1;
            if (metaball.y < metaball.r || metaball.y > height - metaball.r) metaball.vy *= -1;
        }

        var dataToSendToGPU = new Float32Array(3 * numMetaballs);
        for (var i = 0; i < numMetaballs; i++) {
            var baseIndex = 3 * i;
            var mb = metaballs[i];
            dataToSendToGPU[baseIndex + 0] = mb.x;
            dataToSendToGPU[baseIndex + 1] = mb.y;
            dataToSendToGPU[baseIndex + 2] = mb.r;
        }
        gl.uniform3fv(metaballsHandle, dataToSendToGPU);
        
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        requestAnimationFrame(loop);
    }

    canvas.onmousemove = function(e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    }

    // Handle window resize
    window.addEventListener('resize', function() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        
        // Update shader constants
        fragmentShaderSrc = `
            precision highp float;
            const float WIDTH = ` + (width >> 0) + `.0;
            const float HEIGHT = ` + (height >> 0) + `.0;
            uniform vec3 metaballs[` + numMetaballs + `];

            void main(){
                float x = gl_FragCoord.x;
                float y = gl_FragCoord.y;
                float sum = 0.0;
                
                for (int i = 0; i < ` + numMetaballs + `; i++) {
                    vec3 metaball = metaballs[i];
                    float dx = metaball.x - x;
                    float dy = metaball.y - y;
                    float radius = metaball.z;
                    sum += (radius * radius) / (dx * dx + dy * dy);
                }

                if (sum >= 0.99) {
                    gl_FragColor = vec4(mix(vec3(x / WIDTH, y / HEIGHT, 1.0), vec3(0, 0, 0), max(0.0, 1.0 - (sum - 0.99) * 100.0)), 1.0);
                    return;
                }

                gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
            }
        `;

        // Recompile shaders
        var newFragmentShader = compileShader(fragmentShaderSrc, gl.FRAGMENT_SHADER);
        gl.detachShader(program, fragmentShader);
        gl.attachShader(program, newFragmentShader);
        gl.linkProgram(program);
        gl.useProgram(program);
        fragmentShader = newFragmentShader;
    });

    loop();
}

// Initialize dropdowns when page loads
document.addEventListener('DOMContentLoaded', function() {
    populateDayDropdown();
    populateYearDropdown();
    
    // Initialize menu functionality
    const menuIcon = document.getElementById("menuIcon");
    const sideMenu = document.getElementById("sideMenu");
    const mainContent = document.getElementById("mainContent");

    if (menuIcon && sideMenu && mainContent) {
        menuIcon.addEventListener("click", () => {
            if (sideMenu.style.right === "0px") {
                sideMenu.style.right = "-250px";
            } else {
                sideMenu.style.right = "0px";
            }
        });
    }

    // Create background
    createMetaballsBackground();
});
