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

//importo Funciones para calcular deudas

const { calcularDeudas, actualizarDeudas, calculo } = require("./gastos.js");

// importo funciones relativas a roommates

const {roomates, addRoommate } = require("./roommates.js");
 

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
app.post("/roommate", async (req, res) => {
  try {
    await addRoommate(req, res);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
});
 
 
// ruta para obtener un random user

app.post("/roommate", addRoommate);



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
      //calculo las deudas llamando a la funcion calcular Deudas
      const deudas = calculo(gastos);
      console.log("deuda Actualizada"+deudas);

    // Envío una respuesta indicando que el gasto se ha almacenado correctamente
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
    console.log(data.gastos);
     //calculo las deudas llamando a la funcion calcular Deudas
     const deudas = calculo(gastos);
     console.log("deuda Actualizada"+deudas);
    
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


app.put("/gasto", async (req, res) => {
  try {
    
    const { id} = req.query; // Obtén el ID del gasto de los parámetros de la ruta
    const { roommate, descripcion, monto } = req.body; // Obtén todos los datos del cuerpo de la solicitud
    console.log("datos3"+id,roommate,descripcion,monto);

    // Lee los datos de gastos desde el archivo JSON
    const gastosData = JSON.parse(fs.readFileSync("./data/gastos.json", "utf8"));

    // Busca el índice del gasto por ID
    const indexGasto = gastosData.gastos.findIndex((g) => g.id === id);

    if (indexGasto === -1) {
      // Si no se encuentra el gasto, devuelve un error 404
      return res.status(404).json({ error: "Gasto no encontrado" });
    }

    // Actualiza el gasto con los nuevos datos
    gastosData.gastos[indexGasto] = { id, roommate, descripcion, monto };

    // Escribe los gastos actualizados en el archivo JSON
    fs.writeFileSync("./data/gastos.json", JSON.stringify(gastosData));

    // Responde con el gasto actualizado
    res.json(gastosData.gastos[indexGasto]);

    // Calcula las deudas llamando a la función calcularDeudas
    const deudas = await calcularDeudas();
    console.log("Deuda Actualizada:", deudas);
  } catch (error) {
    console.log("Error:", error.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});


app.delete("/gasto", async (req, res) => {
  try {
    const { id } = req.query;
    const data = JSON.parse(fs.readFileSync("./data/gastos.json", "utf8"));
    const filteredData = data.gastos.filter((g) => g.id !== id);
    fs.writeFileSync("./data/gastos.json", JSON.stringify({ gastos: filteredData }));
    res.json(filteredData);
    //calculo las deudas llamando a la funcion calcular Deudas
    const deudas = calculo(gastos);
    console.log("deuda Actualizada"+deudas);
  } catch (error) {
    console.log("Error: ", error.message);
    res.status(500).send(error);
  }
});









// Ruta genérica para manejar solicitudes a rutas no existentes
app.get("*", (req, res) => {
    //res.status(404).send("La ruta solicitada no existe en el servidor.");
    res.status(404).sendFile(path.join(__dirname, "/404.html"));
  });