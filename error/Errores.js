
//funcion para manejar errores
function errores(code, status, message) {
switch (code) {
    case '42601':
        status = 500;
        message = `Problema en la inserción de datos en la tabla, revise consulta.`;
        break;
    case '28000':
        status = 400;
        message = `Usuario '${pool.options.user}' no existe, revise sus datos de acceso.`;
        break;
    case '22P02':
        status = 400;
        message = "Error al ingresar Los datos, favor revise el formulario de ingreso y el tipo de datos, nombre y Balance.";
        break;
    case '23514':
        status= 500;
        message = "No se puede realizar la transferencia, Emisor no dispone de monto suficiente";
        break;
    case '23505':
        status= 400;
        message = "Ya existe el usuario ingresado, favor ingrese uno nuevo.";
        break;
    case '28P01':
        message = `Autenticación de contraseña falló, revise la contraseña para el usuario '${pool.options.user}'`;
        break;
    case '23505':
        status = 400;
        message = "Ya existe el ID a ingresar";
        break;
    case '42P01':
        status = 400;
        message = "No existe la tabla consultada";
        break;    
    case '3D000':
        status = 400;
        message = `No existe la BD '${pool.options.database}', revise los datos de conexión.`;
        break;
    case 'ENOTFOUND':
        status = 500;
        message = "El nombre del Host está incorrecto, corrija los datos de conexión.";
        break;
    case 'ENOENT':
        status = 500;
        message = "No se encuentra el archivo solicitado, favor revisar las rutas.";
        break;
    case 'ECONNREFUSED':
        status = 500;
        message = "Error en el puerto de conexion a BD";
        break;
    default:
        status = 500;
        message = "Error generico del Servidor";
        break;
}

  return {code, status, message}
}

module.exports = {errores};