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
// Este ejemplo asume que en el archivo JSON de gastos, cada gasto tiene una
//propiedad llamada monto que representa el monto del gasto, y una propiedad
//llamada roommate que representa el roommate asociado al gasto. 
//Por favor, asegúrate de ajustar el código según la estructura real de tus datos.


function actualizarDeudasEnRoommates(deudas) {
  try {
    // Leer el archivo JSON de roommates
    const roommatesData = JSON.parse(fs.readFileSync("./data/roommates.json", "utf8"));
    const roommates = roommatesData.roommates;

    // Actualizar las deudas en el objeto roommates
    roommates.forEach((roommate) => {
      const nombreRoommate = roommate.nombre;
      roommate.recibe = deudas[nombreRoommate];
    });

    // Escribir los cambios en el archivo JSON
    fs.writeFileSync("./data/roommates.json", JSON.stringify(roommatesData, null, 2));

    console.log("Deudas actualizadas en el archivo roommates.json");
  } catch (error) {
    console.log("Error al actualizar deudas en roommates: ", error.message);
  }
}

// Esta función actualizarDeudasEnRoommates realiza los siguientes pasos:

// Lee los datos de roommates desde el archivo JSON.
// Actualiza la propiedad recibe de cada roommate con el valor correspondiente de deudas.
// Escribe los cambios de vuelta al archivo JSON roommates.json.
// Puedes llamar a esta función después de haber calculado las deudas individuales de cada roommate usando la función calcularDeudas. Por ejemplo:

// javascript
// Copiar código
// Calcular deudas individuales
const deudas = calcularDeudas();

// Actualizar deudas en roommates.json
actualizarDeudasEnRoommates(deudas);
