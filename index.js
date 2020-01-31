// All the constants are maintained here.
const CONSTANTS = {
    ACCOUNT_SID: 'SID',
    AUTH_TOKEN: 'TOKEN',
    CONTACTS: {
        SENDER: '552120420682',
        RECEIVER: {
            MANAS: '8093773107',
            KRISHNA: '8327791315'
        }
    },
    THRESHOLD: {
        TEMPERATURE: 35,
        HUMIDITY: 200,
        AIR_Q: 400
    },
    WAIT_TIME: 30000
};

const accountSid = CONSTANTS.ACCOUNT_SID;
const authToken = CONSTANTS.AUTH_TOKEN;

const client = require('twilio')(accountSid, authToken);

const wait = t => new Promise(resolve => setTimeout(resolve, t));
const log = (message) => {
    console.log(`[SERVER_LOGS] [${new Date().toISOString()}]: ${message}`);
}
let isTwilioReady = true;

const express = require('express');

const app = express();
const server = app.listen(4000, () => {
    log("Listening to requests on port 4000...");
});

const io = require('socket.io')(server);

app.use(express.static('public'));

const SerialPort = require('serialport');
const Readline = SerialPort.parsers.Readline;
const port = new SerialPort('COM12'); //Connect serial port to port COM12.
const parser = port.pipe(new Readline({ delimiter: '\r\n' })); //Read the line only when new line comes.
parser.on('data', (dataString) => { //Read data
    parseSerialPortData(dataString);
});

/**
 * Method to refine the text received in serial port.
 * @param {string} dataString String that needs be refined
 */
async function parseSerialPortData(dataString) {
    return new Promise(async (res, rej) => {
        try {
            // Regular expressions for get readings
            const tempRegEX = /Temperature:\s(\d+\.\d+)/;
            const humidityRegEX = /Humidity:\s(\d+\.\d+)/;
            const airQRegEX = /Air_Quality:\s(\d+)/;

            const receiver = CONSTANTS.CONTACTS.RECEIVER.KRISHNA;

            // Temperature reading
            const temp = dataString.match(tempRegEX) ? dataString.match(tempRegEX)[1] : '';

            if (temp) {
                emitData(temp, 'temp');
                if (Number(temp) >= CONSTANTS.THRESHOLD.TEMPERATURE) {
                    await sendMessage(
                        receiver,
                        `Temperature exceeded *45 degrees*, current temperature is *${temp} degrees*. Please check the issue.`
                    );
                }
            }

            // Humidity reading
            const humidity = dataString.match(humidityRegEX) ? dataString.match(humidityRegEX)[1] : '';

            if (humidity) {
                emitData(humidity, 'humidity');
                if (Number(humidity) >= CONSTANTS.THRESHOLD.HUMIDITY) {
                    await sendMessage(
                        receiver,
                        `Humidity exceeded *30 grams per cubic metre*, current humidity in air is *${humidity} grams per cubic metre*. Please check the issue.`
                    );
                }
            }

            // AirQ reading
            const airQ = dataString.match(airQRegEX) ? dataString.match(airQRegEX)[1] : '';

            if (airQ) {
                emitData(airQ, 'airQ');
                if (Number(airQ) >= CONSTANTS.THRESHOLD.AIR_Q) {
                    await sendMessage(
                        receiver,
                        `AirQ exceeded *300 PPM(parts per million)*, current AirQ measure is *${airQ} PPM(parts per million)*. Please check the issue.`
                    );
                }
            }
            res();
        } catch (e) {
            log(e.message);
            rej(e);
        }
    });
}

/**
 * Method to emit data in the open socket connection
 * @param {any} data Data that is to be emitted in the socket connection
 * @param {string} param Parameter name to be passed
 */
function emitData(data, param) {
    const now = new Date();
    io.sockets.emit(param, {
        date: `${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()}`,
        time: `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`,
        [param]: parseFloat(data)
    });
}

/**
 * Method to forward message using twilio sandbox number.
 * @param {string} number Contact number where message needs to be forwarded.
 * @param {string} messageBody Message body that needs to be forwarded.
 */
const sendMessage = async function (number, messageBody) {
    if (!isTwilioReady) {
        log('Waiting for twilio to be ready.');
        return;
    }

    return new Promise(async (res, rej) => {
        try {
            client.messages
                .create({
                    body: messageBody,
                    from: `whatsapp:+${CONSTANTS.CONTACTS.SENDER}`,
                    to: `whatsapp:+91${number}`
                })
                .then((message) => {
                    log(`Message has been forwarded with SID: ${message.sid}`);
                    res();
                })
                .done();

            isTwilioReady = false;
            makeTwilioReady(CONSTANTS.WAIT_TIME);
        } catch (e) {
            log(e.message);
            rej(e);
        }
    });
}

const makeTwilioReady = async (t) => {
    await wait(t);
    log('Making twilio ready for message forwarding');
    isTwilioReady = true;
}

// setInterval(async function () {
//     const temp = getRandomInt(25, 50);
//     const humidity = getRandomInt(30, 120);
//     const airQ = getRandomInt(250, 450);
//     const decimals = getRandomInt(00, 99);

//     const newString = `Temperature: ${temp}.${decimals}, Humidity: ${humidity}.${decimals}, Air_Quality: ${airQ}`;
//     log(newString);

//     await parseSerialPortData(newString);
// }, 1000);

// function getRandomInt(min, max) {
//     min = Math.ceil(min);
//     max = Math.floor(max);
//     return Math.floor(Math.random() * (max - min + 1)) + min;
// }

// Emit connection
io.on('connection', (socket) => {
    log("Client connected."); //show a log as a new client connects.
})