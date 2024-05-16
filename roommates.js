const express = require('express');
const path = require('path');
//const app = express();
const fs = require('fs');
const axios = require('axios');
const { v4: uuidv4 } = require("uuid");




   // funcion generar rommates
   async function addRoommate() {
      const { data } = await axios.get("https://randomuser.me/api");
      const randomuser = data.results[0];
      const randomid = uuidv4().slice(0, 6);
      const roommate = {
        nombre: randomuser.name.first,
        email: randomuser.email,
        id: randomid,
        debe: 0,
        recibe: 0,
        total: 0,
      };
      const { roommates } = JSON.parse(
        fs.readFileSync("./data/roommates.json", "utf8")
      );
      roommates.push(roommate);
      fs.writeFileSync("./data/roommates.json", JSON.stringify({ roommates }));
      console.log(roommate);
      return {status: 200,
        message: "Se ha agregado un nuevo registro a Roommate.json",
        roommate: roommate.nombre,
      };
      
    }
  
  //funcion consultar roommates

  async function roomates() {
      const data = await fs.promises.readFile("./data/roommates.json", "utf8"); // leo el archivo json
      const roommates = JSON.parse(data);
      //console.log("roommates :" + JSON.stringify({roommates}));
      return roommates;
  }
    //   if (error.code === "ENOENT") {
    //     // Error: archivo no encontrado
    //     console.error('Error: El archivo "roommates.json" no existe.');
    //     // Informo al usuario sobre el error
    //     return res.status(404).send('El archivo "roommates.json" no existe.');
    //   } else {
    //     // Otro tipo de error al leer el archivo
    //     console.error('Error al leer el archivo "roommates.json":', error);
    //     return res.status(500).send("Error interno del servidor");
    //   }}
    
  
module.exports = {addRoommate, roomates};
