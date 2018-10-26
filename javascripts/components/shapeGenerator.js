// ============================================================================
// SHAPE GENERATOR class
// ============================================================================

class ShapeGenerator {
  constructor() {
    this.state = {
      shapes:           [],      // Onscreen shapes are stored here
      scrolling:        false,   // Are shapes currently scrolling upward?
      currentShapeId:   1        // ID number for next created shape
    }

    this.clearCanvas          = this.clearCanvas.bind(this);    // Binding methods
    this.incrementId          = this.incrementId.bind(this);
    this.animateShape         = this.animateShape.bind(this);
    this.generateShape        = this.generateShape.bind(this);
    this.stopAnimation        = this.stopAnimation.bind(this);
    this.scrollShapesUp       = this.scrollShapesUp.bind(this);
    this.checkForOverlap      = this.checkForOverlap.bind(this);
    this.addShapeToCanvas     = this.addShapeToCanvas.bind(this);
    this.addShapeOnImageLoad  = this.addShapeOnImageLoad.bind(this);
    this.setupEventListeners  = this.setupEventListeners.bind(this);

    this.setupEventListeners();   // init
  }

  setupEventListeners() {
    const $generate = $('#generate');       // 'Generate' button
    const $clear    = $('#clear');          // 'Clear Screen' button

    $generate.on('click', this.generateShape);
    $clear.on('click',    this.clearCanvas);
  }

  incrementId() {         // Sets the ID number for the next shape
    this.state.currentShapeId += 1;
  }

  generateShape(e) {      // On clicking the 'Generate' button
    e.preventDefault();

    const colorValue =   $("input[name='selectColor']:checked").val();    // Form values
    const shapeValue =   $("input[name='selectShape']:checked").val();
    const shibaValue = !!$("input[name='selectShiba']:checked").val();

    const shape = new Shape({     // creates a new Shape object.
      colorValue: colorValue,     // Shape objects are responsible for
      shapeValue: shapeValue,     // building shape DOM elements
      shibaValue: shibaValue,
      shapeId:    this.state.currentShapeId
    });

    const shapeElement = shape.createShapeElement();  // returns a shape DOM element

    this.incrementId();
    this.addShapeOnImageLoad(shape, shapeElement);
  }

  addShapeOnImageLoad(shape, shapeElement, tries = 50) {
    // Waits for the image to load before adding the shape to the canvas.
    // 5 seconds is the maximum wait time before the shape is added w/o an image.

    if (shape.state.imageLoaded || tries <= 0) {
      this.addShapeToCanvas(shapeElement);
    } else {
      setTimeout(() => {
        this.addShapeOnImageLoad(shape, shapeElement, tries - 1);
      }, 100);
    }
  }

  addShapeToCanvas(shapeElement) {
    // Sets random values for the shape's size, position, and rotation

    const rotation   = Math.floor((Math.random() * 360) - (Math.random() * 360));
    const shapeWidth = Math.floor(50 + Math.random() * 175);
    const maxLeft    = window.innerWidth - shapeWidth;
    const leftPos    = Math.floor(Math.random() * maxLeft);

    // ...then applies those values

    $(shapeElement).css({
        'left': `${leftPos}px`,
        'transition-property': 'transform',
        '-webkit-transform':   `rotate(${rotation}deg)`,
        '-moz-transform':      `rotate(${rotation}deg)`,
        '-ms-transform':       `rotate(${rotation}deg)`,
        'transform':           `rotate(${rotation}deg)`
    });

    // ...then appends the element to the #canvas div.

    $('#canvas')[0].appendChild(shapeElement);
    this.animateShape(shapeElement, shapeWidth);
  }

  animateShape(shapeElement, shapeWidth) {
    // Animates the shape's height, width, and skyward path to glory.

    const self = this;

    $(shapeElement).animate({
      height: `${shapeWidth}px`,
      width: `${shapeWidth}px`
    }, 1000).animate({
      top: '-20px'
    }, {
      duration: 1000,
      progress() {                            // Checks the shape's position
        self.checkForOverlap(shapeElement);   // continuously during the animation.
      },
      complete() {
        self.state.shapes.push(shapeElement);
        if (!self.state.scrolling) { self.scrollShapesUp(); }  // Start scrolling if not already
      }
    });
  }

  checkForOverlap(shape) {
    // Checks for collisions between shapes.
    // If a shape collides with another shape, its journey ends.
    //
    // Shape collisions are detected by the distance between center points
    // compared to the sum of radii.
    //
    // Not as sophisticated as the gravity effects in the GIF.
    // Might be interesting to use something like matter.js for upside-down gravity FX?

    const radius1 = Math.floor($(shape).height() / 2);      // Values for shape in transit
    const left1   = Number(shape.style.left.slice(0, -2));
    const top1    = Number(shape.style.top.slice(0, -2));
    const x1      = left1 + radius1;
    const y1      = top1  + radius1;
    let   overlap = false;

    this.state.shapes.forEach((shape2) => {     // Gets values for all other onscreen shapes
      const radius2 = Math.floor($(shape2).height() / 2);
      const left2   = Number(shape2.style.left.slice(0, -2));
      const top2    = Number(shape2.style.top.slice(0, -2));
      const x2      = left2 + radius2;
      const y2      = top2  + radius2;
      let distance  = Math.floor(Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)));

      // If distance between center points <= the sum of radii, there is overlap
      overlap = distance <= radius1 + radius2;

        if (overlap) {    // Collision!!!
          this.stopAnimation(shape);      // Stop the animation
          this.state.shapes.push(shape);  // Add the new shape to the state's shapes array
          return;
        }
    });
  }

  scrollShapesUp() {
    // Scrolls all the shapes upward.
    // When a shape is offscreen, it is removed from the Object state's shapes array.
    // When the shapes array is empty, the scroll loop stops.

    if (this.state.shapes.length) {
      this.state.scrolling = true;

      setTimeout(() => {
        const size = this.state.shapes.length;

        for (let i = 1; i <= size; i++) {
          let shape     = this.state.shapes.shift();
          let positions = shape.getBoundingClientRect();

          if (positions.bottom >= 0) {
            let top = Number(shape.style.top.slice(0, -2));
            this.state.shapes.push(shape);
            shape.style.top = `${top - 0.5}px`;
          }
        }

        this.scrollShapesUp();
      }, 80);
    } else {
      this.state.scrolling = false;
    }
  }

  stopAnimation(shape) {    // Stops the shape's animation
    $(shape).stop();
  }

  clearCanvas(e) {      // Click the 'Clear Screen' button to clear the canvas!!!
    e.preventDefault();
    this.state.shapes = [];
    $('#canvas').html('');
  }
}
