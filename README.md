# temperature-plot
Real-time Temperature Graph using Node.js, Socket.io, Chart.js, Arduino UNO.
Sensors used are following:
- Temperature: DHT11
- Humidity: DHT11
- Air Quality: MQ-135
- Bluetooth: HC-05

### how to run
Install Arduino IDE. Open temperature.ino file in IDE, connect Arduino board to your PC. In Arduino IDE -> Tools -> Port, see the port name and update it in index.js, Now compile and upload the ino code into Arduino and start Express Server.

To install dependencies:
```npm install```

To run:
```npm start```

Go to http://localhost:4000 to see the graph. Or you can open index.html to see the graph. To publically host index.html, host it on any static hosting service.

### working
![Temperature Plot](temperature-plot.gif)