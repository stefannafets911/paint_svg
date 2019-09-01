let express = require('express');
let app = express();
let fs = require('fs');
let server = require('http').Server(app);
let io = require('socket.io').listen(app.listen(8080));

app.use(express.static(__dirname + '/public'));

let clients = [];
let picturesValue = "";
let valueDataBase;

io.sockets.on('connection',  function (socket) {
    clients.push(socket);

    valueDataBase = fs.readFileSync("DataBase.json", "utf8");
    console.log(valueDataBase);
    if (valueDataBase !== "") {
        picturesValue = picturesValue.split(",");

        if (picturesValue) {
            for (let i = 0; i < picturesValue.length; i++) {
                socket.emit('data', picturesValue[i]);
            }
        }
    }

    socket.on('data', function (data) {
        picturesValue += data;
        picturesValue += ",";
        valueDataBase = JSON.stringify(picturesValue);
        valueDataBase = valueDataBase.slice(0, valueDataBase.length - 2);
        valueDataBase += '"';
        fs.writeFileSync("DataBase.json", valueDataBase);

        for (let i = 0; i < clients.length; i++) {
            clients[i].emit('data', data);
        }

        //TODO SAVE TO MODEL
    });
});

io.sockets.on('disconnect', function (socket) {

    const index = clients.indexOf(socket);
    if (index > -1) {
        clients.splice(index, 1);
    }
});