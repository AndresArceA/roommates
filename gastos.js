const fs = require("fs").promises;
const { v4: uuidv4 } = require("uuid");
// const errores = require("./error/Errores.js");
// const path = require("path");
// const { error } = require("console");

//---Funciones para operar con gastos

const calcularDeudas = async () => {
  try {
    // Leo el archivo JSON de gastos
    const gastosData = JSON.parse(
      await fs.readFile("./data/gastos.json", "utf8")
    );
    const gastos = gastosData.gastos;
    console.log("Gastos:", gastos);

    // Leo el archivo JSON de roommates
    const roommatesData = JSON.parse(
      await fs.readFile("./data/roommates.json", "utf8")
    );
    const roommates = roommatesData.roommates;
    //console.log("Roommates:", roommates);

    // Calculo el total de los gastos
    const totalGastos = gastos.reduce((total, gasto) => total + gasto.monto, 0);
    console.log("Total Gastos:", totalGastos);

    // Calculo el promedio de los gastos por roommate
    const promedioGastos = totalGastos / roommates.length;
    console.log("Promedio Gastos:", promedioGastos);

    // Calculo las deudas individuales de cada roommate
    const deudas = {};
    roommates.forEach((roommate) => {
      const gastosRoommate = gastos.filter(
        (gasto) => gasto.roommate === roommate.nombre
      );
      const totalGastosRoommate = gastosRoommate.reduce(
        (total, gasto) => total + gasto.monto,
        0
      );
      deudas[roommate.nombre] = totalGastosRoommate - promedioGastos;
    });
    //console.log("Deudas:", deudas);

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
    //console.log("Roommates antes de actualizar deudas:", roommates);

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
    await fs.writeFile(
      "./data/roommates.json",
      JSON.stringify(roommatesData, null, 2)
    );
    //console.log("Deudas actualizadas en el archivo roommates.json");
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
    const gastosData = JSON.parse(
      await fs.readFile("./data/gastos.json", "utf8")
    );

    // Busca el índice del gasto por ID
    const indexGasto = gastosData.gastos.findIndex((g) => g.id === id);

    if (indexGasto === -1) {
      // Si no se encuentra el gasto, devuelve un error 404
      throw new Error("Gasto no encontrado");
    }

    // Actualiza el gasto con los nuevos datos
    gastosData.gastos[indexGasto] = { id, roommate, descripcion, monto };

    // Escribe los gastos actualizados en el archivo JSON
    await fs.writeFile(
      "./data/gastos.json",
      JSON.stringify(gastosData, null, 2)
    );

    // Calcula las deudas llamando a la función calcularDeudas
    const deudas = await calcularDeudas();
    console.log("Deuda Actualizada:", deudas);

    // Retorna el gasto actualizado
    return {
      message: "Gasto actualizado con éxito",
      gasto: gastosData.gastos[indexGasto],
    };
    //return gastosData.gastos[indexGasto];
  } catch (error) {
    throw error; // Propaga el error para que sea manejado en el bloque try-catch de la ruta
  }
}

// -------funcion para consultar los gastos

async function getGastos() {
  try {
    const data = await fs.readFile("./data/gastos.json", "utf8"); // Leo el archivo JSON
    const gastos = JSON.parse(data);
    //console.log(gastos);
    // Calculo las deudas llamando a la función calcular Deudas
    const deudas = calculo(gastos);
    console.log("Deuda Actualizada: " + deudas);
    return gastos;
  } catch (error) {
    if (error.code === "ENOENT") {
      // Error: archivo no encontrado
      console.error('Error: El archivo "gastos.json" no existe.');
      // Informo al usuario sobre cómo crear el archivo
      throw new Error('El archivo "gastos.json" no existe.');
    } else {
      // Otro tipo de error al leer el archivo
      console.error('Error al leer el archivo "gastos.json":', error);
      throw new Error("Error interno del servidor");
    }
  }
}

//----------funcion para agregar gasto

async function agregarGasto(roommate, descripcion, monto) {
  try {
    // Creo el objeto de gasto
    const randomid = uuidv4().slice(0, 6);
    const Gasto = {
      roommate: roommate,
      descripcion: descripcion,
      monto: parseFloat(monto),
      fecha: new Date().toLocaleDateString(),
      id: randomid,
    };

    // Leo el archivo gastos.json
    const data = await fs.readFile("./data/gastos.json", "utf8");
    const { gastos } = JSON.parse(data);

    // Agrego el nuevo gasto al objeto
    gastos.push(Gasto);
    //console.log(Gasto);

    // Guardo el archivo actualizado
    await fs.writeFile("./data/gastos.json", JSON.stringify({ gastos }));

    //console.log(Gasto);

    // Calculo las deudas llamando a la función calcularDeudas
    const deudas = calculo(gastos);
    //console.log("Deuda actualizada: " + JSON.stringify(deudas));
    console.log("gasto:"+JSON.stringify(Gasto));

    // Envío una respuesta indicando que el gasto se ha almacenado correctamente
    return {
      mensaje: `Se ha agregado un nuevo registro a Gastos.json. ${Gasto.roommate} ha registrado un gasto de ${Gasto.monto} por ${Gasto.descripcion} el ${Gasto.fecha}.`
    };
    // return {
    //   Mensaje: "Se ha agregado un nuevo registro a Gastos.json",
    //   Nombre: Gasto.roommate, Monto: Gasto.monto,//JSON.stringify(Gasto)
    // };
  } catch (error) {
    // Manejo cualquier error que ocurra durante el proceso
    console.error("Error al manejar la solicitud de gasto:", error);
    // Devuelve un objeto con el mensaje de error
    return {
      status: 500,
      message: "Error interno del servidor al leer el archivo 'gastos.json',",
    };
  }
}

//---------funcion para eliminar un gasto

async function deleteGasto(id) {
  try {
    const data = JSON.parse(await fs.readFile("./data/gastos.json", "utf8"));
    const filteredData = data.gastos.filter((g) => g.id !== id);
    await fs.writeFile(
      "./data/gastos.json",
      JSON.stringify({ gastos: filteredData })
    );
   
    //calculo las deudas llamando a la funcion calcular Deudas
    const deudas = await calculo(filteredData); 
    console.log("Gasto eliminado" + deudas);
    return {
      status: 200,
      message: "Gasto eliminado exitosamente",
      filteredData,
    };
  } catch (error) {
    console.log("Error: ", error.message);
    throw new Error(
      "Ha ocurrido un error al eliminar el gasto :" + error.message
    );
  }
}
//exporto las funciones

module.exports = {
  calculo,
  actualizarGasto,
  getGastos,
  agregarGasto,
  deleteGasto,
};
