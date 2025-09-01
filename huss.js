var canvas;
var gl;
if (window.innerWidth >= 768) {
  canvas = document.createElement("canvas");
  var width = canvas.width = window.innerWidth * 0.75;
  var height = canvas.height = window.innerHeight * 0.75;
  document.body.appendChild(canvas);
  gl = canvas.getContext('webgl');
} else {
  // Disable canvas on mobile for better performance
  canvas = null;
  gl = null;
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
// position specifies only x and y.
// We set z to be 0.0, and w to be 1.0
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
gl.vertexAttribPointer(positionHandle,
                       2, // position is a vec2
                       gl.FLOAT, // each component is a float
                       gl.FALSE, // don't normalize values
                       2 * 4, // two 4 byte float components per vertex
                       0 // offset into each span of vertex data
                      );

var metaballsHandle = getUniformLocation(program, 'metaballs');

loop();
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
  
  //Draw
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  requestAnimationFrame(loop);
}

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

canvas.onmousemove = function(e) {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
}


/*  الفوق ده تبع الخلفيه */

/* التحت ده تبع كروت المشروع */

const filterButtons = document.querySelectorAll(".filter-buttons button");
const projectCards = document.querySelectorAll(".projects .project-cord");
const placeholder = document.getElementById("projects-placeholder");
let activeCategory = null;

// إخفاء الكروت في البداية
projectCards.forEach(card => {
  card.style.display = "none";
});

filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    const category = button.getAttribute("data-filter");

    if (activeCategory === category) {
      // لو نفس الزر مضغوط → نخفي الكل
      projectCards.forEach(card => card.style.display = "none");
      filterButtons.forEach(btn => btn.classList.remove("active"));
      activeCategory = null;

      // ✅ مفيش أي مشروع ظاهر → رجّع الرسالة
      placeholder.style.display = "block";
    } else {
      // تحديث الزر النشط
      filterButtons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");

      // إظهار المشاريع المطابقة فقط
      let anyVisible = false;
      projectCards.forEach(card => {
        if (category === "all" || card.getAttribute("data-category") === category) {
          card.style.display = "block";
          anyVisible = true;
        } else {
          card.style.display = "none";
        }
      });

      // ✅ لو فيه مشاريع ظهرت → أخفي الرسالة
      placeholder.style.display = anyVisible ? "none" : "block";

      activeCategory = category;
    }
  });
});



/* ده الكود بتاع الاسكيليز */

const skills = document.querySelectorAll('.skill-bar span');
const counters = document.querySelectorAll('.counter');
let skillsStarted = false;
let countersStarted = false;

function startCounter(counter) {
  const target = +counter.getAttribute('data-target');
  const speed = 200;
  let count = 0;

  const updateCount = () => {
    const increment = Math.ceil(target / speed);
    if (count < target) {
      count += increment;
      counter.textContent = count;
      setTimeout(updateCount, 20);
    } else {
      counter.textContent = target;
    }
  };
  updateCount();
}

function animateSkillsAndCounters() {
  skills.forEach(skill => {
    skill.style.width = skill.getAttribute('data-width');
  });
  counters.forEach(counter => startCounter(counter));
}

window.addEventListener('load', () => {
  animateSkillsAndCounters(); // تشغيل عند تحميل الصفحة
});

window.addEventListener('scroll', () => {
  const section = document.getElementById('skills');
  const sectionTop = section.getBoundingClientRect().top;
  const windowHeight = window.innerHeight;

  if ((sectionTop < windowHeight) && (!skillsStarted || !countersStarted)) {
    animateSkillsAndCounters();
    skillsStarted = true;
    countersStarted = true;
  }
});

/*التواصل */

(function() {
  emailjs.init("rxCpNMoeiIt-TVST-"); // Public Key بتاعك
})();

document.getElementById("contact-form").addEventListener("submit", function(e) {
  e.preventDefault();

  const statusDiv = document.getElementById("form-status");
  statusDiv.style.display = "block";
  statusDiv.textContent = "Sending...";
  statusDiv.className = "";

  emailjs.sendForm("service_ixgi3ui", "template_x9ykk0j", this)
    .then(() => {
      statusDiv.textContent = "✅ Message Sent Successfully!";
      statusDiv.className = "success";
      this.reset();

      setTimeout(() => { statusDiv.style.display = "none"; }, 5000);
    }, (error) => {
      statusDiv.textContent = "❌ Failed to send message. Try again!";
      statusDiv.className = "error";
      console.log(error);

      setTimeout(() => { statusDiv.style.display = "none"; }, 5000);
    });
});


/*ده كود الجافا بتاع التلات شروط */
console.log("huss.js script loaded");

document.addEventListener("DOMContentLoaded", () => {
  const menuIcon = document.getElementById("menuIcon");
  const sideMenu = document.getElementById("sideMenu");
  const mainContent = document.getElementById("mainContent");

  console.log("Menu icon loaded:", menuIcon);
  console.log("Side menu loaded:", sideMenu);
  console.log("Main content loaded:", mainContent);

  if (!menuIcon) {
    console.error("menuIcon element not found");
    return;
  }
  if (!sideMenu) {
    console.error("sideMenu element not found");
    return;
  }
  if (!mainContent) {
    console.error("mainContent element not found");
    return;
  }

  menuIcon.addEventListener("click", () => {
      console.log("Menu icon clicked!");
      if (sideMenu.style.right === "0px") {
          sideMenu.style.right = "-250px";
          mainContent.style.transform = "translateX(0)";
          console.log("Menu closed");
      } else {
          sideMenu.style.right = "0px";
          mainContent.style.transform = "translateX(-250px)";
          console.log("Menu opened");
      }
  });
});











