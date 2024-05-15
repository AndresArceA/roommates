const fs = require("fs").promises;

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
  console.log("para actualizar"+deudas);
  try {
    // Leer el archivo JSON de roommates
    const data = await fs.readFile("./data/roommates.json", "utf8");
    const roommatesData = JSON.parse(data);
    const roommates = roommatesData.roommates;
    console.log("Roommates antes de actualizar deudas:", roommates);

    // Actualizar las deudas en el objeto roommates
    roommates.forEach((roommate) => {
      const nombreRoommate = roommate.nombre;
      const deuda = deudas[nombreRoommate];
      if (deuda > 0) {
        roommate.recibe = deuda;
        roommate.debe = 0;
      } else if (deuda < 0) {
        roommate.debe = Math.abs(deuda);
        roommate.recibe = 0;
      } else {
        roommate.debe = 0;
        roommate.recibe = 0;
      }
    });

    // Escribir los cambios en el archivo JSON
    await fs.writeFile("./data/roommates.json", JSON.stringify(roommatesData, null, 2));
    console.log("Deudas actualizadas en el archivo roommates.json");
  } catch (error) {
    console.error("Error al actualizar deudas en roommates:", error.message);
  }
};

const calculo = async () => {
  const deudas = await calcularDeudas();
  console.log("Deudas individuales:", deudas);
  await actualizarDeudas(deudas);
 };

//exporto las funciones

module.exports = { calculo };
