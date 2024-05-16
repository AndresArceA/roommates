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


//importo Funciones para calcular deudas

const { calculo, actualizarGasto, getGastos, agregarGasto, deleteGasto } = require("./gastos.js");

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


  
// Ruta POST /roommate, que genera un roommate -- corregida
app.post("/roommate", async (req, res) => {
  try {
    //llamo a la funcion para agregar roommate
    const room = await addRoommate();
     // Envía respuesta  
     res.status(200).json(room);
     } catch (error) {
    console.error("Error:", error);
    res.status(500).send({ status:500, error: "Error Interno del Servidor" });
  }
});
 
 
// Ruta GET /roommates, que devuelve los roomates almacenados --corregida
app.get("/roommates", async (req, res) => {
  try {
    // Llamo a la función para listar los roommates
    const mates = await roomates();
    // Envía respuesta  
    //console.log("1" + ({mates}));
    res.status(200).json(mates);
    } catch (error) {
    console.error("Error:", error);
    res.status(500).send({ error: "Error Interno del Servidor" });
  }
});

// Ruta POST para manejar la solicitud de gasto --- revisada

app.post("/gasto", async (req, res) => {
  try {
    // Validar los parámetros de la solicitud
    const { roommate, descripcion, monto } = req.body;
    if (!roommate || !descripcion || !monto || isNaN(monto)) {
      return res
        .status(400)
        .send(
          "Se requieren los datos roommate, descripcion y monto para agregar un gasto."
        );
    }

    // Llamo a la función agregarGasto
    const gasta = await agregarGasto(roommate, descripcion, monto);

    // Envio respuesta
    res.status(200).json(gasta);
    console.log("prueba",gasta);
   
  } catch (error) {
    console.error("Error en la ruta /gasto:", error);
    res.status(500).send("Error interno del servidor.");
  }
});


// Ruta GET /gastos, que devuelve los gastos almacenados -- revisada
app.get("/gastos", async (req, res) => {
  try {
    // Llamo a la función para listar los gastos
    const lista = await getGastos();
    // Envía respuesta  
    res.status(200).send(lista);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send({ error: "Error Interno del Servidor" });
  }
});
    

// Ruta PUT /gasto para modificar un gasto  --revisada
app.put("/gasto", async (req, res) => {
  try {
    const { id } = req.query; // Obtiene el ID del gasto de los parámetros de la ruta
    const { roommate, descripcion, monto } = req.body; // Obtiene todos los datos del cuerpo de la solicitud
    console.log("datos3", id, roommate, descripcion, monto);

    // Verifica que el ID del gasto sea válido
    if (!id || typeof id !== "string") {
      return res.status(400).send("El ID del gasto debe ser un valor de tipo string.");
    }

    // Llamo a la función para actualizar el gasto
    const resultado = await actualizarGasto(id, roommate, descripcion, monto);

    // Envío respuesta
    res.send(resultado);
    console.log(resultado);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send({ error: "Error Interno del Servidor" });
  }
});



// Ruta DELETE /gasto, para eliminar un gasto

app.delete("/gasto", async (req, res) => {
  try {
    const  {id} = req.query;
     // Verifica que el ID del gasto sea válido
     if (!id || typeof id !== "string") {
      return res.status(400).send("El ID del gasto debe ser un valor de tipo string.");
    }
    // Llamo a la función para actualizar el gasto
    const borra = await deleteGasto(id);
    console.log("Gasto eliminado Exitosamente");

    // Envío respuesta
    res.status(200).json(borra);
    console.log(borra);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send({ error: "Error Interno del Servidor" });
  }
});
    

// Ruta genérica para manejar solicitudes a rutas no existentes
app.get("*", (req, res) => {
    //res.status(404).send("La ruta solicitada no existe en el servidor.");
    res.status(404).sendFile(path.join(__dirname, "/404.html"));
  });
