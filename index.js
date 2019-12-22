const express = require('express');

const app = express();
const server = app.listen(4000, () => {
    console.log("Listening to requests on port 4000...");
})

const io = require('socket.io')(server);

app.use(express.static('public'));

// const SerialPort = require('serialport'); 
// const Readline = SerialPort.parsers.Readline;
// const port = new SerialPort('COM3'); //Connect serial port to port COM3. Because my Arduino Board is connected on port COM3. See yours on Arduino IDE -> Tools -> Port
// const parser = port.pipe(new Readline({delimiter: '\r\n'})); //Read the line only when new line comes.
// parser.on('data', (temp) => { //Read data
//     console.log(temp);
//     var today = new Date();
//     io.sockets.emit('temp', {date: today.getDate()+"-"+today.getMonth()+1+"-"+today.getFullYear(), time: (today.getHours())+":"+(today.getMinutes()), temp:temp}); //emit the datd i.e. {date, time, temp} to all the connected clients.
// });

setInterval(function () {
    var now = new Date();
    const temp = getRandomInt(45, 100);
    console.log(`Printing new temperature value: ${temp}`);
    io.sockets.emit('temp', {
        date: `${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()}`,
        time: `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`,
        temp: temp
    });
}, 1000);

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

io.on('connection', (socket) => {
    console.log("Client connected."); //show a log as a new client connects.
})