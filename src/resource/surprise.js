window.requestAnimationFrame = window.requestAnimationFrame ||
window.mozRequestAnimationFrame ||
window.webkitRequestAnimationFrame ||
window.msRequestAnimationFrame ||
function (callback) {
  window.setTimeout(callback, 1000 / 60);
};

class Utils {


  constructor() {

  }

  random(min, max) {

    return Math.random() * (max - min) + min;

  }

  randomRange(min, max) {

    return Math.floor(min + Math.random() * (max - min));

  }

  getDistance(v1, v2) {

    return Math.sqrt((v2.x -= v1.x) * v2.x + (v2.y -= v1.y) * v2.y);

  }

  clone(object) {

    return JSON.parse(JSON.stringify(object));

  }}



let utils = new Utils();

class Shape {

  constructor(context, angle, x, y) {

    this.context = context;
    this.angle = angle;

    this.width = utils.randomRange(3, 30);

    this.position = {
      x: x,
      y: y };


    this.speed = utils.random(7, 15);
    this.friction = 0.95;
    this.gravity = 0.5;

    this.initial = utils.clone(this.position);

    this.center = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2 };


    this.color = {
      r: Math.floor(Math.random() * 255),
      g: Math.floor(Math.random() * 255),
      b: Math.floor(Math.random() * 255),
      a: 1 };


    this.active = true;
    this.stopped = false;
    this.distance = 1.5;
    this.duration = 2000;
    this.clock = null;

  }

  update() {

    if (this.clock === null) {
      this.clock = Date.now();
    }

    this.stopped = Date.now() - this.clock > this.duration ? true : false;

    if (!this.stopped) {

      this.move();

    } else {
      this.width -= 1;
      // this.color.a -= 0.02;
      if (this.width < 0) {
        this.width = 0;
        this.active = false;
      }
    }

    this.draw();

  }

  move() {

    this.speed *= this.friction;
    this.position.x += Math.cos(this.angle) * this.speed;
    this.position.y += Math.sin(this.angle) * this.speed; // + this.gravity;

  }
  draw() {



  }}


class Triangle extends Shape {

  constructor(context, index, x, y) {

    super(context, index, x, y);

  }

  draw() {

    this.context.beginPath();
    this.context.fillStyle = "rgba(" + this.color.r +
    "," + this.color.g +
    "," + this.color.b +
    "," + this.color.a + ")";

    this.context.beginPath();

    let i = 0;
    let theta = i / 3 * Math.PI * 2;

    this.context.moveTo(this.position.x + Math.cos(theta) * this.width, this.position.y + Math.sin(theta) * this.width);

    for (i = 1; i < 3; i++) {

      theta = i / 3 * Math.PI * 2;

      let x = Math.cos(theta) * this.width;

      let y = Math.sin(theta) * this.width;

      this.context.lineTo(this.position.x + x, this.position.y + y);

    }

    this.context.fill();
    this.context.closePath();

  }}



class Curve {

  constructor(context, angle, x, y) {

    this.context = context;
    this.angle = angle;

    this.width = 2;
    this.lengthMax = 40;

    this.speed = utils.random(7, 15);
    this.friction = 0.95;
    this.gravity = 0.5;

    this.center = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2 };


    this.color = {
      r: Math.floor(Math.random() * 255),
      g: Math.floor(Math.random() * 255),
      b: Math.floor(Math.random() * 255),
      a: 1 };


    this.active = true;
    this.stopped = false;
    this.distance = 1.5;
    this.duration = 1750;
    this.clock = null;

    this.positions = [{
      x: x + Math.cos(this.angle) * utils.randomRange(30, 200),
      y: y + Math.sin(this.angle) * utils.randomRange(30, 200) }];


    this.clock = Date.now();

  }

  update() {

    if (this.clock === null) {
      this.clock = Date.now();
    }

    this.stopped = Date.now() - this.clock > this.duration ? true : false;

    if (!this.stopped) {

      this.move();

    } else {

      this.width -= 0.2;
      this.positions.splice(0, 1);

      if (this.positions.length == 0 || this.width < 0) {
        this.width = 0;
        this.active = false;
      }
    }

    this.draw();

  }

  move() {

    if (this.positions.length > this.lengthMax) {
      this.positions.splice(0, 1);
    }

    let time = Date.now() - this.clock;
    let last = this.positions.slice(-1).pop();
    this.speed *= this.friction;
    let x = last.x + Math.cos(this.angle) + Math.sin(time); // * this.speed;
    let y = last.y + Math.sin(this.angle) + Math.sin(time); // * this.speed;// + this.gravity;

    this.positions.push({
      x: x,
      y: y });


  }

  draw() {

    let posArrayLength = this.positions.length;


    for (let i = 0; i < posArrayLength; i++) {

      let pos = this.positions[i];

      this.context.beginPath();

      this.context.strokeStyle = this.context.strokeStyle = "rgba(" + this.color.r +
      "," + this.color.g +
      "," + this.color.b +
      "," + this.color.a + ")";
      this.context.arc(pos.x, pos.y, this.width, 0, Math.PI * 2);
      this.context.fill();
      this.context.closePath();
    }





  }}



class Circle extends Shape {

  constructor(context, index, x, y) {

    super(context, index, x, y);

    this.drawStyle = Math.random() > 0.5 ? () => {this.context.stroke();} : () => {this.context.fill();};
  }

  draw() {

    this.context.beginPath();

    this.context.strokeStyle = this.context.strokeStyle = "rgba(" + this.color.r +
    "," + this.color.g +
    "," + this.color.b +
    "," + this.color.a + ")";

    this.context.arc(this.position.x, this.position.y, this.width, 0, Math.PI * 2);
    this.drawStyle();
    this.context.closePath();

  }}



class Polygon extends Shape {

  constructor(context, index, x, y) {

    super(context, index, x, y);

  }

  draw() {

    this.context.beginPath();

    this.context.fillStyle = "rgba(" + this.color.r +
    "," + this.color.g +
    "," + this.color.b +
    "," + this.color.a + ")";

    let i = 0;
    let theta = i / 5 * Math.PI * 2;

    this.context.moveTo(this.position.x + Math.cos(theta) * this.width, this.position.y + Math.sin(theta) * this.width);

    for (i = 1; i < 5; i++) {

      theta = i / 5 * Math.PI * 2;

      let x = Math.cos(theta) * this.width;

      let y = Math.sin(theta) * this.width;

      this.context.lineTo(this.position.x + x, this.position.y + y);

    }

    this.context.fill();

    this.context.closePath();

  }}



class Square extends Shape {

  constructor(context, index, x, y) {

    super(context, index, x, y);

    this.drawStyle = Math.random() > 0.5 ? () => {
      this.context.strokeRect(this.position.x, this.position.y, this.width, this.width);
    } : () => {
      this.context.fillRect(this.position.x, this.position.y, this.width, this.width);
    };

    this.position.x -= this.width / 2;
    this.position.y -= this.width / 2;

  }

  draw() {

    this.context.beginPath();
    this.context.strokeStyle = "rgba(" + this.color.r +
    "," + this.color.g +
    "," + this.color.b +
    "," + this.color.a + ")";
    this.drawStyle();
    this.context.closePath();

  }}




class Fireworks {

  constructor(options = {}) {
    this.options = options
    console.log(options)
    // 判断有没有配置画板
    if (options.canvas) {
      this.canvas = options.canvas
    } else {
      this.canvas = document.createElement('canvas');
      document.body.appendChild(this.canvas)
    }
    this.context = this.canvas.getContext('2d');

    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    this.max = options.max || 60;
    this.radius = options.radius || 1;
    this.init()
  }

  init() {

    this.shapes = [];
    let i = 0;
    let timer = 0;

    while (i < this.max) {

      if (this.max % i == 0) {
        timer += 40;
      }

      if (i % 5 == 0) {
        this.addSquare(i, timer);
      }

      if (i % 5 == 1) {
        this.addPolygon(i, timer);
      }

      if (i % 5 == 2) {
        this.addCircle(i, timer);
      }

      if (i % 5 == 3) {
        this.addTriangle(i, timer);
      }

      if (i % 5 == 4) {
        this.addCurve(i, timer);
      }

      i++;

    };


    setTimeout(() => {
      this.update();
    }, 500);

  }

  addCurve(index, timer) {

    let theta = index / this.max * Math.PI * 2;

    let x = Math.cos(theta) * this.radius + this.canvas.width / 2;

    let y = Math.sin(theta) * this.radius + this.canvas.height / 2;
    setTimeout(() => {
      this.shapes.push(new Curve(this.context, theta, x, y));
    }, timer);

  }

  addSquare(index, timer) {

    let theta = index / this.max * Math.PI * 2;

    let x = Math.cos(theta) * this.radius + this.canvas.width / 2;

    let y = Math.sin(theta) * this.radius + this.canvas.height / 2;
    setTimeout(() => {
      this.shapes.push(new Square(this.context, theta, x, y));
    }, timer);

  }

  addPolygon(index, timer) {


    let theta = index / this.max * Math.PI * 2;

    let x = Math.cos(theta) * this.radius + this.canvas.width / 2;

    let y = Math.sin(theta) * this.radius + this.canvas.height / 2;
    setTimeout(() => {
      this.shapes.push(new Polygon(this.context, index, x, y));
    }, timer);
  }

  addCircle(index, timer) {

    let theta = index / this.max * Math.PI * 2;

    let x = Math.cos(theta) * this.radius + this.canvas.width / 2;

    let y = Math.sin(theta) * this.radius + this.canvas.height / 2;
    setTimeout(() => {
      this.shapes.push(new Circle(this.context, index, x, y));
    }, timer);

  }

  addTriangle(index, timer) {

    let theta = index / this.max * Math.PI * 2;

    let x = Math.cos(theta) * this.radius + this.canvas.width / 2;

    let y = Math.sin(theta) * this.radius + this.canvas.height / 2;
    setTimeout(() => {
      this.shapes.push(new Triangle(this.context, index, x, y));
    }, timer);

  }

  update() {

    let i = 0;
    let length = this.shapes.length;
    let inactive = 0;

    this.canvas.width = window.innerWidth;

    while (i < length) {

      if (this.shapes[i].active) {
        this.shapes[i].update();
      } else {
        inactive++;
      }

      i++;

    };

    if (inactive == this.max) {
      // 完成动画回调
      if (this.options.callback) {
        this.options.callback()
      }
    } else {
      requestAnimationFrame(this.update.bind(this));
    }
  }
}
