// ============================================================================
// SHAPE class
// ============================================================================

class Shape {
  constructor(props) {
    this.props = Object.freeze(props);    // contains color, shape, image, and ID values
    this.state = { imageLoaded: false };

    this.imageHasLoaded     = this.imageHasLoaded.bind(this);
    this.addDogeToShape     = this.addDogeToShape.bind(this);     // Binding methods
    this.createShapeElement = this.createShapeElement.bind(this);
  }

  imageHasLoaded() {
    return this.state.imageLoaded;
  }

  createShapeElement() {    // creates the DOM element
    const outerShape = document.createElement('div');
    const innerShape = document.createElement('div');

    outerShape.className = `shape ${this.props.shapeValue} ${this.props.colorValue}`;
    outerShape.id        = `shape_${this.props.shapeId}`;

    outerShape.appendChild(innerShape);

    // Does this shape have a dog image or not?

    if (this.props.shibaValue) {      // YES: Wait for a dog image from the API.
      this.addDogeToShape(innerShape);
    } else {                          // NO: Since there is no image,
      this.state.imageLoaded = true;  //     the ShapeGenerator doesn't have to
    }                                 //     wait to add the shape to the canvas.

    return outerShape;
  }

  addDogeToShape(innerShape) {  // Adds shiba image to a shape.
    getDoge()  // Function is from the api_services folder. Returns a Promise.
      .then((imageSrc) => {
        const image = document.createElement('img');
        innerShape.appendChild(image);
        image.src = imageSrc;
        image.onload = () => {            // Sets the imageLoaded state to true
          this.state.imageLoaded = true;  // when the image is loaded.
        }
      }).catch();  // The imageLoaded value is used by ShapeGenerator to
  }                // determine when to add the element to the canvas.
}
