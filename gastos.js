const fs = require("fs").promises;

//funciones para consulta 

// app.put("/gasto", async (req, res) => {
//   try {
    
//     const { id} = req.query; // Obtén el ID del gasto de los parámetros de la ruta
//     const { roommate, descripcion, monto } = req.body; // Obtén todos los datos del cuerpo de la solicitud
//     console.log("datos3"+id,roommate,descripcion,monto);

//     // Lee los datos de gastos desde el archivo JSON
//     const gastosData = JSON.parse(fs.readFileSync("./data/gastos.json", "utf8"));

//     // Busca el índice del gasto por ID
//     const indexGasto = gastosData.gastos.findIndex((g) => g.id === id);

//     if (indexGasto === -1) {
//       // Si no se encuentra el gasto, devuelve un error 404
//       return res.status(404).json({ error: "Gasto no encontrado" });
//     }

//     // Actualiza el gasto con los nuevos datos
//     gastosData.gastos[indexGasto] = { id, roommate, descripcion, monto };

//     // Escribe los gastos actualizados en el archivo JSON
//     fs.writeFileSync("./data/gastos.json", JSON.stringify(gastosData));

//     // Responde con el gasto actualizado
//     res.json(gastosData.gastos[indexGasto]);

//     // Calcula las deudas llamando a la función calcularDeudas
//     const deudas = await calcularDeudas();
//     console.log("Deuda Actualizada:", deudas);
//   } catch (error) {
//     console.log("Error:", error.message);
//     res.status(500).json({ error: "Error interno del servidor" });
//   }
// });



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
    return gastosData.gastos[indexGasto];
  } catch (error) {
    throw error; // Propaga el error para que sea manejado en el bloque try-catch de la ruta
  }
}
//exporto las funciones

module.exports = { calculo, actualizarGasto };
