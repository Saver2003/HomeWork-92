const express = require('express');
const cors = require('cors');
const app = express();
const expressWs = require('express-ws')(app);

const port = 8000;

app.use(cors());

const clients = {};
let pixelDraw = [];

app.ws('/canvas', (ws, req) => {
  const id = req.get('sec-websocket-key');
  clients[id] = ws;

  ws.send(JSON.stringify({type: 'NEW_DRAW', draw: pixelDraw}));

  ws.on('message', (draw) => {
    let decodedDraw;

    try {
      decodedDraw = JSON.parse(draw);
    } catch (e) {
      return ws.send(JSON.stringify({
        type: 'ERROR'
      }));
    }

    switch (decodedDraw.type) {
      case 'CREATE_DRAW':
        pixelDraw = pixelDraw.concat(decodedDraw.draw);
        Object.values(clients).forEach(client => {
          client.send(JSON.stringify({
            type: 'NEW_DRAW',
            draw: pixelDraw
          }));
        });
        break;
      default:
        return ws.send(JSON.stringify({
          type: 'ERROR'
        }));
    }

  });

  ws.on('close', () => {
    delete clients[id];
  })
});


app.listen(port, () => {
  console.log(`Server started on ${port} port`);
});