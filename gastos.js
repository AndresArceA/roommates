const fs = require('fs');

function calcularDeudas() {
  try {
    // Leer el archivo JSON de gastos
    const gastosData = JSON.parse(fs.readFileSync("./data/gastos.json", "utf8"));
    const gastos = gastosData.gastos;

    // Leer el archivo JSON de roommates
    const roommatesData = JSON.parse(fs.readFileSync("./data/roommates.json", "utf8"));
    const roommates = roommatesData.roommates;

    // Calcular el total de los gastos
    const totalGastos = gastos.reduce((total, gasto) => total + gasto.monto, 0);

    // Calcular el promedio de los gastos por roommate
    const promedioGastos = totalGastos / roommates.length;

    // Calcular las deudas individuales de cada roommate
    const deudas = {};
    roommates.forEach((roommate) => {
      const gastosRoommate = gastos.filter((gasto) => gasto.roommate === roommate);
      const totalGastosRoommate = gastosRoommate.reduce((total, gasto) => total + gasto.monto, 0);
      deudas[roommate] = totalGastosRoommate - promedioGastos;
    });

    return deudas;
  } catch (error) {
    console.log("Error: ", error.message);
    return {};
  }
}

// Ejemplo de uso:
const deudas = calcularDeudas();
console.log("Deudas individuales:", deudas);



