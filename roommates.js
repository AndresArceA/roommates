const path = require('path');
const {errores} = require('./error/Errores.js');
const fs = require('fs');
const axios = require('axios');
const { v4: uuidv4 } = require("uuid");




   // funcion generar rommates
   async function addRoommate(req, res) {
    try {
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
      res.status(201).send({
        message: "Se ha agregado un nuevo registro a Roommate.json",
        roommate: roommate.nombre,
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).send({ error: "Internal Server Error" });
    }
  }
  
  //funcion consultar roommates

       const roomates = async () => {
        try {
      const data = await fs.promises.readFile(path.join(__dirname + '/data/roommates.json')); //leo el archivo json
      const roommates = JSON.parse(data).roommates;
      res.json({roommates});
      console.log(data.roommates);
    } catch (error) {
      if (error.code === "ENOENT") {
        // Error: archivo no encontrado
        console.error('Error: El archivo "Roommates.json" no existe.');
        // Informo al usuario sobre cómo crear el archivo
        return res.status(404).send('El archivo "Roommates.json" no existe.');
      } else {
        // Otro tipo de error al leer el archivo
        console.error('Error al leer el archivo "Roommates.json":', error);
        return res.status(500).send("Error interno del servidor");
      }
    }};



    module.exports = {addRoommate, roomates}
