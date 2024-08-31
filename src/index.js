//-------------------------------------------------------------------------------------------Websocket--------------------------------------------------------------------------------------------------------------
//El websocket es un protocolo de comunicacion basado en TCP para poder establecer esa conexion entre el cliente y el servidor, justo como sabemos, es el mimso objetivo que cubre http

//primer intento: se llama HTTP long Pollling consiste en qe el cliente culeca a hacer una peticion tan pronto como reciba una repsuesta del servidor, es decir, bombardea al servidor constantemente de peticiones para emular respuestas en "tiempo real", sin embargo se concluyó que esta operacion es costosa en recursos y al final un tanto lenta ara realmente considerarse en tiempo real 

//La solucion optima es WEBSOCKETS; el cliente no tendre aue actualizar constantemente para que le llegue una notificacion, en cuanto al servidorrecuba una actualizacion de una nueva pujja (teniendo como ejemplo una pajina de subastas), actualizara a todos los clientes conectados permitiendo dar info en tiempo real, una vez termionadad la subasta, el socket se cierra y el servidor dejara de notificar innecesariamente al cliente

//-----------------------------------------------------------------------------------sockets en express con socket.io---------------------------------------------------------------------------------------------
// ahora se usara un server e cual se va a implementar sockets con socket.io instalandolo con npm express express-handlebars socket.io (esto despues de inicializar nuestro package json como de costumbre inicial con npm init -y)esto hara instaralar todas las dependencias

const express = require('express');
const app= express();

const handlebars= require('express-handlebars');
const path = require('path');

const { Server }= require("socket.io") //aquui requerimos a el package socket.io y lo almacenamos por medio de Server

const PORT = 8080;

//seteo de handlebars
app.engine("handlebars", handlebars.engine({defaultLayout: "main"}));
app.set("view engine", "handlebars");
app.set("views",path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));


app.get("/", (req,res)=>{
    res.render("index");
})

const server= app.listen(PORT, ()=>{
    console.log(`servidor escuchando en http://localhost:${PORT}`);
})// guardamos el listener o el servidor en si dentro de una variable en este caso y por buenas practicas se llamara server

const io= new Server (server); //creamo un io que es el socket.io y creamos un new Server (esto contiene el socket.io) y le pasamos como parametro nuestro server
//{cors: transport['websocket']}) se suele usar despues de el server con una ","

const messages=[];

io.on("connection", (socket) => {
    console.log(`Usuario ${socket.id} Connection`);
    
    socket.on("userConnect", (data) => {
      console.log(":::", data);
      let message = {
          id: socket.id,
          info: "connection",
          name: data.user,
          message: `usuario: ${data.user} - id: ${data.id} - Conectado`,
        }
      messages.push(message);
  
      io.emit('serverUserConnect', messages)
    //* io.emit('userConnect', messages) <- por simplicidad tb se puede usar solo io.emit
    });
  
    socket.on("userMessage", (data)=>{
      console.log("||||||", data)
      const message = {
          id: socket.id, 
          info: "message",
          name: data.user,
          message: data.message
      }
      messages.push(message)
      // console.log("---> ", messages)
      io.emit("serverUserMessage", messages)
    })
  
    socket.on("typing", (data)=>{
      // console.log(":: :: ::", data)
      socket.broadcast.emit("typing", data)
    })
  
    socket.on("disconnect", () => {
      console.log("Cliente desconectado:", socket.id);
    });
  });