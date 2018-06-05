import React, {Component, Fragment} from 'react';
import './App.css';

class App extends Component {

  state = {
    mouseDown: false,
    pixelsArray: []
  };

  componentDidMount() {
    this.websocket = new WebSocket('ws://localhost:8000/canvas');

    this.websocket.onmessage = (message) => {
      const decodedDraw = JSON.parse(message.data);

      this.context = this.canvas.getContext('2d');
      this.imageData = this.context.createImageData(1, 1);
      this.d = this.imageData.data;

      this.d[0] = 200;
      this.d[1] = 50;
      this.d[2] = 50;
      this.d[3] = 255;

      decodedDraw.draw.forEach((array) => {
        this.context.putImageData(this.imageData, array.x, array.y);
      });
    }
  };

  canvasMouseMoveHandler = event => {
    if (this.state.mouseDown) {
      event.persist();
      this.setState(prevState => {
        return {
          pixelsArray: [...prevState.pixelsArray, {
            x: event.clientX,
            y: event.clientY
          }]
        };
      });

      this.context = this.canvas.getContext('2d');
      this.imageData = this.context.createImageData(1, 1);
      this.d = this.imageData.data;

      this.d[0] = 200;
      this.d[1] = 50;
      this.d[2] = 50;
      this.d[3] = 255;

      this.context.putImageData(this.imageData, event.clientX, event.clientY);

    }
  };

  mouseDownHandler = event => {
    this.setState({mouseDown: true});
  };

  mouseUpHandler = event => {
    this.websocket.send(JSON.stringify({
      type: 'CREATE_DRAW',
      draw: this.state.pixelsArray
    }));
    this.setState({mouseDown: false, pixelArray: []});
  };

  render() {
    return (
      <Fragment>
        <div>
          <canvas
          ref={elem => this.canvas = elem}
          style={{border: '1px solid black', background: '#eee'}}
          width={800}
          height={600}
          onMouseDown={this.mouseDownHandler}
          onMouseUp={this.mouseUpHandler}
          onMouseMove={this.canvasMouseMoveHandler}
          />
        </div>
      </Fragment>
    );
  }
}

export default App;
