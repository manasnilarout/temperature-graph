const express = require('express');

const app = express();
const server = app.listen(4000, () => {
    console.log("Listening to requests on port 4000...");
})

const io = require('socket.io')(server);

app.use(express.static('public'));

const SerialPort = require('serialport');
const Readline = SerialPort.parsers.Readline;
const port = new SerialPort('COM12'); //Connect serial port to port COM12. Because my Arduino Board is connected on port COM3. See yours on Arduino IDE -> Tools -> Port
const parser = port.pipe(new Readline({ delimiter: '\r\n' })); //Read the line only when new line comes.
parser.on('data', (dataString) => { //Read data
    parseSerialPortData(dataString);
});

function parseSerialPortData(dataString) {
    const tempRegEX = /Temperature:\s(\d+\.\d+)/;
    const humidityRegEX = /Humidity:\s(\d+\.\d+)/;
    const airQRegEX = /Air_Quality:\s(\d+)/;
    const temp = dataString.match(tempRegEX) ? dataString.match(tempRegEX)[1] : '';

    if (temp) {
        emitData(temp, 'temp');
    }

    const humidity = dataString.match(humidityRegEX) ? dataString.match(humidityRegEX)[1] : '';

    if (humidity) {
        emitData(humidity, 'humidity');
    }

    const airQ = dataString.match(airQRegEX) ? dataString.match(airQRegEX)[1] : '';

    if (airQ) {
        emitData(airQ, 'airQ');
    }
}

function emitData(data, param) {
    const now = new Date();
    io.sockets.emit(param, {
        date: `${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()}`,
        time: `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`,
        [param]: parseFloat(data)
    });
}

// setInterval(function () {
//     var now = new Date();
//     const temp = getRandomInt(45, 100);
//     console.log(`Printing new temperature value: ${temp}`);
//     io.sockets.emit('temp', {
//         date: `${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()}`,
//         time: `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`,
//         temp: temp
//     });
// }, 1000);

// function getRandomInt(min, max) {
//     min = Math.ceil(min);
//     max = Math.floor(max);
//     return Math.floor(Math.random() * (max - min + 1)) + min;
// }

io.on('connection', (socket) => {
    console.log("Client connected."); //show a log as a new client connects.
})