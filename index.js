//importo express
const express = require('express');
const path = require('path');
const {errores} = require('./error/Errores.js');
const app = express();
const fs = require('fs');
const axios = require('axios');
const { v4: uuidv4 } = require("uuid");

//configuro el puerto de conexion y levanto el servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor 💻 ThinkPad P51 corriendo en el puerto ${PORT} 🦾`);
});

app.use(express.json()); // Middleware para analizar el cuerpo de la solicitud como JSON



//configuro carpeta publica para imagenes

app.use(express.static(path.join(__dirname, "/assets/img")));

//configuro carpeta publica para script js

app.use("/js",express.static(path.join(__dirname, "/assets/js")));

//configuro carpeta publica para data

//app.use(express.static(path.join(__dirname, "/data")));



//ruta para cargar index.html
app.get("/", (req, res) => {
    try {
      res.sendFile(path.join(__dirname, "/index.html"), (err) => {
        if (err) {
          console.error("Error al enviar index.html:", err);
          res.sendFile(path.join(__dirname, "/404.html")); // Redirigir a la página 404 si hay un error al enviar el archivo
        }
      });
    } catch (error) {
      const EE = errores(error.code, error.status, error.message);
      console.log("Error", error);
      res.status(EE.status).json({
        message: EE.message,
      });
    }
  });


  
// Ruta GET /roommates, que devuelve los roomates almacenados
app.get("/roommates", async (req, res) => {
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
  }
});
        
// ruta para obtener un random user

app.post("/roommate", async (req, res) => {
  const { data } = await axios.get("https://randomuser.me/api");
  const randomuser = data.results[0];
  const randomid = uuidv4().slice(0, 6);
  const roommate = {
    nombre: randomuser.name.first,
    email: randomuser.email,
    id: randomid,
    debe: 0,
    recibe: 0,
  };
  const {roommates} = JSON.parse(fs.readFileSync("./data/roommates.json", "utf8"));
  roommates.push(roommate);
  fs.writeFileSync("./data/roommates.json", JSON.stringify({roommates}));
  console.log(roommate);
  res.send({message: "Se ha agregado un nuevo registro a Roommate.json",
  roommate: roommate.nombre,
  });
});

//ruta PUT /gasto

// Ruta POST para manejar la solicitud de gasto
app.post("/gasto", (req, res) => {
  try {
    // Parsear los datos del cuerpo de la solicitud para obtener los detalles del gasto
    const { roommate, descripcion, monto } = req.body;
    if (!roommate || !descripcion || !monto || isNaN(monto)) {
      return res
        .status(400)
        .send(
          "Se requieren los datos roommate, descripcion y monto para agregar un gasto."
        );
    }
    // Creo el ojeto de gasto
    const randomid = uuidv4().slice(0, 6);
    const Gasto = {
      roommate: roommate,
      descripcion: descripcion,
      monto: parseFloat(monto),
      fecha: new Date().toLocaleDateString(),
      id: randomid,
    };
    const { gastos } = JSON.parse(
      fs.readFileSync("./data/gastos.json", "utf8")
    );
    gastos.push(Gasto);
    fs.writeFileSync("./data/gastos.json", JSON.stringify({ gastos }));
    console.log(Gasto);
    res.send({
      message: "Se ha agregado un nuevo registro a Gastos.json",
      Gasto: Gasto.roommate,
      descripcion,
      monto,
    });

    // Enviar una respuesta indicando que el gasto se ha almacenado correctamente
    res.status(200).send("El gasto ha sido almacenado correctamente.");
  } catch (error) {
    // Manejar cualquier error que ocurra durante el proceso
    console.error("Error al manejar la solicitud de gasto:", error);
    res.status(500).send("Error interno del servidor al almacenar el gasto.");
  }
});

// Ruta GET /gastos, que devuelve los gastos almacenados
app.get("/gastos", async (req, res) => {
  try {
    const data = await fs.promises.readFile(path.join(__dirname + '/data/gastos.json')); //leo el archivo json
    const gastos = JSON.parse(data).gastos;
    res.json({gastos});
    console.log(data.gastoss);
  } catch (error) {
    if (error.code === "ENOENT") {
      // Error: archivo no encontrado
      console.error('Error: El archivo "Gastos.json" no existe.');
      // Informo al usuario sobre cómo crear el archivo
      return res.status(404).send('El archivo "Gastos.json" no existe.');
    } else {
      // Otro tipo de error al leer el archivo
      console.error('Error al leer el archivo "Gastos.json":', error);
      return res.status(500).send("Error interno del servidor");
    }
  }
});










// Ruta genérica para manejar solicitudes a rutas no existentes
app.get("*", (req, res) => {
    //res.status(404).send("La ruta solicitada no existe en el servidor.");
    res.status(404).sendFile(path.join(__dirname, "/404.html"));
  });