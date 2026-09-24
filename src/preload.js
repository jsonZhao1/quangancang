const { SerialPort } = require('serialport')

// const serialPort = new SerialPort('COM4', {
//   baudRate: 2400
// });
SerialPort.list().then(
  ports=>ports.forEach(console.log),
  err =>console.log(err)
)
