const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const path = require("path");

//---Funciones para operar con gastos

const calcularDeudas = async () => {
  try {
    // Leo el archivo JSON de gastos
    const gastosData = JSON.parse(await fs.readFile("./data/gastos.json", "utf8"));
    const gastos = gastosData.gastos;
    console.log("Gastos:", gastos);

    // Leo el archivo JSON de roommates
    const roommatesData = JSON.parse(await fs.readFile("./data/roommates.json", "utf8"));
    const roommates = roommatesData.roommates;
    console.log("Roommates:", roommates);

    // Calculo el total de los gastos
    const totalGastos = gastos.reduce((total, gasto) => total + gasto.monto, 0);
    console.log("Total Gastos:", totalGastos);

    // Calculo el promedio de los gastos por roommate
    const promedioGastos = totalGastos / roommates.length;
    console.log("Promedio Gastos:", promedioGastos);

    // Calculo las deudas individuales de cada roommate
    const deudas = {};
    roommates.forEach((roommate) => {
      const gastosRoommate = gastos.filter((gasto) => gasto.roommate === roommate.nombre);
      const totalGastosRoommate = gastosRoommate.reduce((total, gasto) => total + gasto.monto, 0);
      deudas[roommate.nombre] = totalGastosRoommate - promedioGastos;
    });
    console.log("Deudas:", deudas);

    return deudas;
  } catch (error) {
    console.log("Error:", error.message);
    return {};
  }
};

// Función para actualizar las deudas en el archivo roommates.json
const actualizarDeudas = async (deudas) => {
  //console.log("para actualizar"+deudas);
  try {
    // Lee el archivo JSON de roommates
    const data = await fs.readFile("./data/roommates.json", "utf8");
    const roommatesData = JSON.parse(data);
    const roommates = roommatesData.roommates;
    console.log("Roommates antes de actualizar deudas:", roommates);

    // Actualiza las deudas en el objeto roommates
    roommates.forEach((roommate) => {
      const nombreRoommate = roommate.nombre;
      const deuda = deudas[nombreRoommate];
      if (deuda > 0) {
        roommate.recibe = Math.round(deuda);
        roommate.debe = 0;
      } else if (deuda < 0) {
        roommate.debe = Math.abs(Math.round(deuda));
        roommate.recibe = 0;
      } else {
        roommate.debe = 0;
        roommate.recibe = 0;
      }
    });

    // Escribe los cambios en el archivo JSON
    await fs.writeFile("./data/roommates.json", JSON.stringify(roommatesData, null, 2));
    console.log("Deudas actualizadas en el archivo roommates.json");
  } catch (error) {
    console.error("Error al actualizar deudas en roommates:", error.message);
  }
};

//----- funcion calculo para realizar las operaciones 

const calculo = async () => {
  const deudas = await calcularDeudas();
  console.log("Deudas individuales:", deudas);
  await actualizarDeudas(deudas);
 };



//–----------- funciones para consulta

async function actualizarGasto(id, roommate, descripcion, monto) {
  try {
    // Lee los datos de gastos desde el archivo JSON
    const gastosData = JSON.parse(await fs.promises.readFile("./data/gastos.json", "utf8"));

    // Busca el índice del gasto por ID
    const indexGasto = gastosData.gastos.findIndex((g) => g.id === id);

    if (indexGasto === -1) {
      // Si no se encuentra el gasto, devuelve un error 404
      throw new Error("Gasto no encontrado");
    }

    // Actualiza el gasto con los nuevos datos
    gastosData.gastos[indexGasto] = { id, roommate, descripcion, monto };

    // Escribe los gastos actualizados en el archivo JSON
    await fs.promises.writeFile("./data/gastos.json", JSON.stringify(gastosData, null, 2));

    // Calcula las deudas llamando a la función calcularDeudas
    const deudas = await calcularDeudas();
    console.log("Deuda Actualizada:", deudas);

    // Retorna el gasto actualizado
    return { message: "Gasto actualizado con éxito", gasto: gastosData.gastos[indexGasto] };
    //return gastosData.gastos[indexGasto];
  } catch (error) {
    throw error; // Propaga el error para que sea manejado en el bloque try-catch de la ruta
  }
}

// -------funcion para consultar los gastos

const getGastos = async (res) => {
  try {
    const data = await fs.promises.readFile(path.join(__dirname + "/data/gastos.json")); // Leo el archivo JSON
    const gastos = JSON.parse(data).gastos;
    res.json({gastos});
    console.log(gastos);

    // Calculo las deudas llamando a la función calcular Deudas
    const deudas = calculo(gastos);
    console.log("Deuda Actualizada: " + deudas);

  } catch (error) {
    if (error.code === "ENOENT") {
      // Error: archivo no encontrado
      console.error('Error: El archivo "gastos.json" no existe.');
      // Informo al usuario sobre cómo crear el archivo
      return res.status(404).send('El archivo "gastos.json" no existe.');
    } else {
      // Otro tipo de error al leer el archivo
      console.error('Error al leer el archivo "gastos.json":', error);
      return res.status(500).send("Error interno del servidor");
    }
  }
};

//----------funcion para agregar gasto

const agregarGasto = (req, res) => {
  try {
    // Parsear los datos del cuerpo de la solicitud para obtener los detalles del gasto
    const { roommate, descripcion, monto } = req.body;

    // Crear el objeto de gasto
    const randomid = uuidv4().slice(0, 6);
    const Gasto = {
      roommate: roommate,
      descripcion: descripcion,
      monto: parseFloat(monto),
      fecha: new Date().toLocaleDateString(),
      id: randomid,
    };

    // Leer el archivo gastos.json
    const data = readFileSync("./data/gastos.json", "utf8");
    const { gastos } = JSON.parse(data);
    
    // Agregar el nuevo gasto
    gastos.push(Gasto);
    
    // Guardar el archivo actualizado
    fs.writeFileSync("./data/gastos.json", JSON.stringify({ gastos }));

    console.log(Gasto);
    res.send({
      message: "Se ha agregado un nuevo registro a Gastos.json",
      Gasto: Gasto.roommate,
      descripcion,
      monto,
    });

    // Calculo las deudas llamando a la función calcularDeudas
    const deudas = calculo(gastos);
    console.log("Deuda actualizada: " + deudas);

    // Envío una respuesta indicando que el gasto se ha almacenado correctamente
    res.status(200).send("El gasto ha sido almacenado correctamente.");
  } catch (error) {
    // Manejar cualquier error que ocurra durante el proceso
    console.error("Error al manejar la solicitud de gasto:", error);
    res.status(500).send("Error interno del servidor al almacenar el gasto.");
  }
};

//---------funcion para eliminar un gasto

function deleteGasto(req, res) {
  try {
    const { id } = req.query;
    const data = JSON.parse(fs.readFileSync("./data/gastos.json", "utf8"));
    const filteredData = data.gastos.filter((g) => g.id !== id);
    fs.writeFileSync("./data/gastos.json", JSON.stringify({ gastos: filteredData }));
    res.json(filteredData);
    //calculo las deudas llamando a la funcion calcular Deudas
    const deudas = calculo(gastos); // asegúrate de que calculo y gastos estén definidos
    console.log("deuda Actualizada"+deudas);
    res.status(200).json({ message: "Gasto eliminado exitosamente", deudas });
  } catch (error) {
    console.log("Error: ", error.message);
    res.status(500).json({ error: "Ha ocurrido un error al eliminar el gasto", message: error.message });
  }
}
//exporto las funciones

module.exports = { calculo, actualizarGasto, getGastos, agregarGasto, deleteGasto };
