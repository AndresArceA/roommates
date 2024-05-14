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


//Esta función calcularDeudas realiza los siguientes pasos:

// Lee los datos de gastos desde el archivo JSON.
// Lee los datos de roommates desde el archivo JSON.
// Calcula el total de los gastos.
// Calcula el promedio de los gastos por roommate.
// Para cada roommate, calcula la diferencia entre sus gastos totales y el promedio.
// Devuelve un objeto que contiene las deudas individuales de cada roommate.
// Este ejemplo asume que en el archivo JSON de gastos, cada gasto tiene una propiedad llamada monto que representa el monto del gasto, y una propiedad llamada roommate que representa el roommate asociado al gasto. Por favor, asegúrate de ajustar el código según la estructura real de tus datos.
