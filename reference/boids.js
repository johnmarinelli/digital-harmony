// from https://codepen.io/coaster/pen/QpqVjP?editors=0010
//-----------------
// Global Variables
//-----------------

// Convenience variables
var W = window.innerWidth
var H = window.innerHeight

// Color list
var col = {
  red: 0xcc2200,
  blue: 0x333399,
  black: 0x222222,
  grey: 0x111133,
  white: 0xccccaa,
  green: 0x00ff00,
  void: 0x111111,
}

// Geometry types
var geom = {
  box: new THREE.BoxGeometry(1, 1, 1),
  ico: new THREE.IcosahedronGeometry(1, 0),
  tri: new THREE.CylinderGeometry(1, 1, 1, 3),
  taper: new THREE.CylinderGeometry(0.5, 1, 1, 4),
}

// Materials
var mat = {
  x_hull: new THREE.MeshStandardMaterial({ color: col.white }),
  o_hull: new THREE.MeshStandardMaterial({ color: col.grey, shading: THREE.FlatShading }),
  x_dec: new THREE.MeshStandardMaterial({ color: col.red }),
  o_dec: new THREE.MeshStandardMaterial({ color: col.blue }),
  x_pit: new THREE.MeshStandardMaterial({ color: col.black }),
  o_pit: new THREE.MeshStandardMaterial({ color: col.green }),
}

// Global objects
var scene, renderer, camera
var boids = []

//----------------
// Create Objects
//----------------
setupRender()
setupLights()
setupFlock(10, 10)

//-----------------
// Setup Functions
//-----------------

function setupRender() {
  scene = new THREE.Scene()

  camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 1000)
  camera.position.set(0, 0, 250)
  camera.lookAt(scene.position)

  renderer = new THREE.WebGLRenderer()
  renderer.setSize(W, H)
  renderer.setClearColor(col.void)

  //raycaster = new THREE.Raycaster();

  document.body.appendChild(renderer.domElement)

  window.addEventListener('resize', onWindowResize, false)
}

function onWindowResize() {
  camera.aspect = W / H
  camera.updateProjectionMatrix()
  renderer.setSize(W, H)
}

function setupLights() {
  var light_amb = new THREE.AmbientLight(0x999999, 1)

  var light_hem = new THREE.HemisphereLight(0xffffcc, 0x222200, 1)
  light_hem.position.setY(15)

  var light_dir = new THREE.DirectionalLight()

  scene.add(light_amb, light_hem, light_dir)
}

function setupFlock(numA, numB) {
  // Popoulate X-Boid ships
  var i = 0
  while (i < numA) {
    boids[i] = new Boid(1)
    i++
  }
  // Populate O-Boid ships
  while (i < numA + numB) {
    boids[i] = new Boid(0)
    i++
  }
}

function XShip() {
  var nose = new THREE.Mesh(geom.taper, mat.x_hull)
  nose.position.set(0, 0, 2)
  nose.scale.set(2, 3, 7)
  var beacon = new THREE.Mesh(geom.taper, mat.x_dec)
  beacon.position.set(0, 0.5, 1)
  beacon.scale.set(2, 3, 6)
  var pit = new THREE.Mesh(geom.taper, mat.x_pit)
  pit.position.set(0, 0, 3)
  pit.scale.set(2, 2, 7)
  var hull = new THREE.Mesh(geom.box, mat.x_hull)
  hull.scale.set(4, 3, 10)
  hull.position.set(0, 0, -3)
  var dorsal = new THREE.Mesh(geom.tri, mat.x_hull)
  dorsal.position.set(0, 0, -5)
  dorsal.rotateX(THREE.Math.degToRad(90))
  dorsal.rotateY(THREE.Math.degToRad(90))
  dorsal.rotateX(THREE.Math.degToRad(-90))
  dorsal.scale.set(6, 1, 8)
  var fin_ul = new THREE.Mesh(geom.box, mat.x_hull)
  fin_ul.position.set(0, 0, -4)
  fin_ul.rotateZ(THREE.Math.degToRad(30))
  fin_ul.scale.set(20, 0.5, 3)
  var fin_ur = new THREE.Mesh(geom.box, mat.x_hull)
  fin_ur.position.set(0, 0, -4)
  fin_ur.rotateZ(THREE.Math.degToRad(-30))
  fin_ur.scale.set(20, 0.5, 3)

  var x_ship = new THREE.Group()
  x_ship.add(nose, beacon, pit, hull, dorsal, fin_ul, fin_ur)
  x_ship.castShadow = true
  this.mesh = x_ship
  //scene.add(x_ship);
  //x_ship.position.set(-20,0,0);
}

function OShip() {
  var nose = new THREE.Mesh(geom.ico, mat.o_hull)
  nose.scale.set(5, 5, 5)
  var hull = new THREE.Mesh(geom.taper, mat.o_hull)
  hull.position.set(0, 0, 1)
  hull.rotateX(THREE.Math.degToRad(90))
  hull.rotateY(THREE.Math.degToRad(45))
  hull.scale.set(5, 8, 5)
  var pit = new THREE.Mesh(geom.taper, mat.o_pit)
  pit.position.set(0, 0, 4)
  pit.rotateX(THREE.Math.degToRad(90))
  pit.scale.set(3.5, 2.5, 2.5)
  var wing_l = new THREE.Mesh(geom.tri, mat.o_dec)
  wing_l.position.set(4, -2, -1)
  wing_l.rotateX(THREE.Math.degToRad(90))
  wing_l.rotateZ(THREE.Math.degToRad(-30))
  wing_l.scale.set(6, 1, 3)
  var wing_r = new THREE.Mesh(geom.tri, mat.o_dec)
  wing_r.position.set(-4, -2, -1)
  wing_r.rotateX(THREE.Math.degToRad(90))
  wing_r.rotateZ(THREE.Math.degToRad(30))
  wing_r.scale.set(6, 1, 3)

  var fin_l = new THREE.Mesh(geom.tri, mat.o_dec)
  fin_l.position.set(4, 3, -2)
  fin_l.rotateZ(THREE.Math.degToRad(60))
  fin_l.rotateY(THREE.Math.degToRad(30))
  fin_l.scale.set(6, 1, 3)
  var fin_r = new THREE.Mesh(geom.tri, mat.o_dec)
  fin_r.position.set(-4, 3, -2)
  fin_r.rotateZ(THREE.Math.degToRad(-60))
  fin_r.rotateY(THREE.Math.degToRad(-30))
  fin_r.scale.set(6, 1, 3)

  var o_ship = new THREE.Group()
  o_ship.add(nose, hull, pit, wing_l, fin_l, fin_r, wing_r)
  o_ship.castShadow = true
  this.mesh = o_ship
  //scene.add(o_ship);
  //o_ship.position.set(20,0,0);
}

//-------------------------------------------------------
// Flocking Implementation - adapted from lecture example
//-------------------------------------------------------

// Helper function; shortcut for random number in certain range
function rrand(min, max) {
  return Math.random() * (max - min) + min
}

// Boid Definition
function Boid(type) {
  this.type = type
  // Initial movement vectors
  this.position = type
    ? new THREE.Vector3(rrand(80, 100), rrand(-10, 10), 0)
    : new THREE.Vector3(rrand(-80, -100), rrand(-10, 10), 0)
  this.velocity = new THREE.Vector3(rrand(-1, 1), rrand(-1, 1), rrand(-1, 1))
  this.acceleration = new THREE.Vector3(0, 0, 0)
  this.mass = type ? 1 : 15
  // Type determines boid geometry, home location, and starting position
  this.obj = type ? new XShip() : new OShip()
  this.home = type ? new THREE.Vector3(-50, 0, 0) : new THREE.Vector3(50, 0, 0)
  scene.add(this.obj.mesh)
}

// Run an iteration of the flock
Boid.prototype.step = function(flock) {
  this.accumulate(flock)
  this.update()
  this.obj.mesh.position.set(this.position.x, this.position.y, this.position.z)
}

// Apply Forces
Boid.prototype.accumulate = function(flock) {
  var separation, alignment, cohesion, centering
  separation = this.separate(flock).multiplyScalar(0.02 * this.mass)
  alignment = this.align(flock).multiplyScalar(0.05)
  cohesion = this.cohesion(flock).multiplyScalar(0.01)
  centering = this.steer(this.home).multiplyScalar(0.0001)
  centering.multiplyScalar(this.position.distanceTo(this.home) * this.mass) // stronger centering if farther away
  this.acceleration.add(separation)
  this.acceleration.add(alignment)
  this.acceleration.add(cohesion)
  this.acceleration.add(centering)
  this.acceleration.divideScalar(this.mass)
}

// Update Movement Vectors
Boid.prototype.update = function() {
  this.velocity.add(this.acceleration)
  this.position.add(this.velocity)
  this.acceleration.set(0, 0, 0) // reset each iteration
  // X-Boids point in their direction of travel, O-Boids point in their direction of acceleration
  var pointAt = this.type ? this.position.clone() : this.velocity.clone()
  this.obj.mesh.lookAt(pointAt)
}

// Separation Function (personal space)
Boid.prototype.separate = function(flock) {
  var minRange = 60
  var currBoid
  var total = new THREE.Vector3(0, 0, 0)
  var count = 0
  // Find total weight of separation
  for (var i = 0; i < flock.length; i++) {
    currBoid = flock[i]
    var dist = this.position.distanceTo(currBoid.position)
    // Apply weight if too close
    if (dist < minRange && dist > 0) {
      var force = this.position.clone()
      force.sub(currBoid.position)
      force.normalize()
      force.divideScalar(dist)
      total.add(force)
      count++
    }
  }
  // Average out total weight
  if (count > 0) {
    total.divideScalar(count)
    total.normalize()
  }
  return total
}

// Alignment Function (follow neighbours)
Boid.prototype.align = function(flock) {
  var neighborRange = 100
  var currBoid
  var total = new THREE.Vector3(0, 0, 0)
  var count = 0
  // Find total weight for alignment
  for (var i = 0; i < flock.length; i++) {
    currBoid = flock[i]
    var dist = this.position.distanceTo(currBoid.position)
    // Apply force if near enough
    if (dist < neighborRange && dist > 0) {
      total.add(currBoid.velocity)
      count++
    }
  }
  // Average out total weight
  if (count > 0) {
    total.divideScalar(count)
    total.limit(1)
  }
  return total
}

// Cohesion Function (follow whole flock)
Boid.prototype.cohesion = function(flock) {
  var neighborRange = 100
  var currBoid
  var total = new THREE.Vector3(0, 0, 0)
  var count = 0
  // Find total weight for cohesion
  for (var i = 0; i < flock.length; i++) {
    currBoid = flock[i]
    var dist = this.position.distanceTo(currBoid.position)
    // Apply weight if near enough
    if (dist < neighborRange && dist > 0) {
      total.add(currBoid.position)
      count++
    }
  }
  // Average out total weight
  if (count > 0) {
    total.divideScalar(count)
    // Find direction to steer with
    return this.steer(total)
  } else {
    return total
  }
}

Boid.prototype.steer = function(target) {
  var steer = new THREE.Vector3(0, 0, 0)
  var des = new THREE.Vector3().subVectors(target, this.position)
  var dist = des.length()
  if (dist > 0) {
    des.normalize()
    steer.subVectors(des, this.velocity)
  }
  return steer
}

// Limit max forces
THREE.Vector3.prototype.limit = function(max) {
  if (this.length() > max) {
    this.normalize()
    this.multiplyScalar(max)
  }
}

/**/
//---------------
// Render Loop
//---------------
function render() {
  requestAnimationFrame(render)
  // Run iteration for each flock
  for (var i = 0; i < boids.length; i++) {
    boids[i].step(boids)
  }
  renderer.render(scene, camera)
}
render()
