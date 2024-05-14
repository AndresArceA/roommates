//importo express
const express = require('express');
const path = require('path');
const {errores} = require('./error/Errores.js');
const app = express();

//importo las funciones del archivo de consultas
const {agregaUsuario, listaUsuarios, editaUser, transferencia, listaTransfer, borraUsuario} = require('./consultas/consultas.js');

//configuro el puerto de conexion y levanto el servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor 💻 ThinkPad P51 corriendo en el puerto ${PORT} 🦾`);
});

app.use(express.json()); // Middleware para analizar el cuerpo de la solicitud como JSON

// dejo la carpeta /assets/img como publica
app.use(express.static(path.join(__dirname, 'assets/img')));

// Middleware para manejar errores 404 (páginas no encontradas) ---no lo usé porque cuando tengo error de alguna ruta dentro de las consultas de la tabla 
// me despliega la pagina 404
// app.use((req, res) => {
//     res.status(404).sendFile(path.join(__dirname, "/404.html"));
//   });


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


//ruta POST /usuario, que inserta los registros de los clientes en la tabla usuarios
app.post("/usuario", async (req, res) => {
  const { nombre, balance } = req.body;

  if (!nombre || !balance) {
    //valida que se estén pasando los parametros para la consulta
    console.log(
      "Debe proporcionar todos los valores correctamente para agregar un nuevo Usuario al registro del Banco."
    );
    return res.status(400).json({ msg: "Debe proporcionar todos los valores correctamente para agregar un nuevo Usuario al registro del Banco." });
    // return `Debe proporcionar todos los valores correctamente para agregar un nuevo Usuario al registro del Banco.`;
  
  }
  try {
    const adduser = await agregaUsuario(nombre, balance);
    console.log(adduser);
    return res.status(200).json(adduser);
    } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "Error al agregar el Usuariow al registro",
    });
  }
});

//ruta GET /usuarios que devuelve un JSON con los registros de los Usuarios y sus balances

app.get("/usuarios", async (req, res) => {
    try {
        // listar todas los usuarios
        const todos = await listaUsuarios();
        
        // devuelve la lista de canciones como un JSON
        res.json(todos);
    } catch (error) {
        // manejo de errores
        console.error("Error al obtener la lista de usuarios:", error);
        
        // Envía una respuesta de error al cliente con un código de estado 500 
        res.status(500).json({ error: 'Error al obtener la lista de usuarios, error interno del servidor'});
    }
});

//ruta PUT /usuario, que actualiza los registros de un usuario en la tabla

app.put("/usuario", async (req, res) => {
  const id = req.query.id; // Obtener el ID del usuarioL
  const { nombre, balance } = req.body;

  if (!id || !nombre || !balance) {
    // Valida que se estén pasando los parámetros para la consulta
    console.log(
      "Debe proporcionar todos los valores correctamente para editar un Usuario en el registro."
    );
    res.json({
      msg: "Debe proporcionar todos los valores correctamente para editar un Usuario en el registro.",
    });
    return;
  }

  try {
    const usuarioedit = await editaUser(id, nombre, balance); // Llama a la función para editar el usuario
    res.json(usuarioedit);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Error al editar usuario" });
  }
});

//ruta POST /transferencia que recibe los datos para realizar transferencia

app.post("/transferencia", async (req, res) => {
  const { emisor, receptor, monto } = req.body;
  //console.log("val1 :"+ emisor, receptor,monto);
  try {
    const transfer = await transferencia(emisor, receptor, monto); //llamo a la funcion transferencia
    res.json(transfer);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Error al realizar la tansferencia"});
  }
});
 
// ruta GET /transferencias

app.get("/transferencias", async (req, res) => {
  try {
      // listar todas los usuarios
      const transferencias = await listaTransfer();
      
      // devuelve la lista de transferencias como un arreglo
      return res.json(transferencias);
  } catch (error) {
      // manejo de errores
      console.error("Error al obtener la lista de transferencias:", error);
      
      // Envía una respuesta de error al cliente con un código de estado 500 
      res.status(500).json({ error: 'Error al obtener la lista de transferencias, error interno del servidor'});
  }
});



//ruta DELETE /usuario, que recibe el id de la usuario y lo elimina

app.delete("/usuario", async (req, res) => {
    const id = req.query.id; // Obtener el ID de la canción de los parámetros de la URL
    if (!id) {
        // Valida que se estén pasando los parámetros para la consulta
        console.log("Debe proporcionar el Id del Usuario a eliminar del registro.");
        res.send("Debe proporcionar el Id del Usuario a eliminar del registro.");
        return;
    }

    try {
        const delUsuario = await borraUsuario(id); // Llama a la función para eliminar el usuario
        res.json(delUsuario);
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Error al eliminar el Usuario" });
    }
});
