//import express - stores function as variable
var express = require('express');

//express function as variable
var app = express();

//server listens on port 3001
var server = app.listen(3001);

//host static files via the 'public' folder
app.use(express.static('public'));

//import socket.io as variable
var socket = require('socket.io');

//server connection at 3001 as variable
var io = socket(server);


//when client is connected newConnection is ran
io.sockets.on('connection', newConnection);


function newConnection(socket) {
    console.log(socket.id);


    //when data is recieved their functions are executed
    socket.on('tankLoc', tankLoc);
    socket.on('bulletLoc', bulletLoc);

    function tankLoc(data) {
        socket.broadcast.emit('tankLoc', data);
    }


    function bulletLoc(data) {
        socket.broadcast.emit('bulletLoc', data);
    }
}
