var mysql = require('mysql'),
    connection = mysql.createConnection({ host: 'localhost', user: 'root', password: 'root', database: 'odontapp' });

var pacienteModel = {};
pacienteModel.getPacientes = (callback) => {
    if (connection) {
        connection.query('SELECT id, Identificacion, Nombre, Direccion, DATE_FORMAT(FechaNacimiento, "%Y/%m/%d") FechaNacimiento, Telefonos, TipoIdentificacion, Sexo, Estado FROM pacientes ORDER BY Nombre', function(error, rows) {
            if (error) {
                throw error;
            } else {
                callback(null, rows);
            }
        });
    }
}
pacienteModel.getPaciente = (id, callback) => {
    if (connection) {
        var sql = 'SELECT id, Identificacion, Nombre, Direccion, DATE_FORMAT(FechaNacimiento, "%Y/%m/%d") FechaNacimiento, Telefonos, TipoIdentificacion, Sexo, Estado FROM pacientes WHERE Identificacion = ' + connection.escape(id);
        connection.query(sql, function(error, row) {
            if (error) {
                throw error;
            } else {
                callback(null, row);
            }
        });
    }
}
pacienteModel.insertPaciente = (pacienteData, callback) => {
    if (connection) {
        connection.query('INSERT INTO pacientes SET ?', pacienteData, (error, result) => {
            if (error) {
                throw error;
            } else {
                //devolvemos la última id insertada
                callback(null, { "insertId": result.insertId });
            }
        });
    }
}
pacienteModel.updatePaciente = function(pacienteData, callback) {
    //console.log(userData); return;
    if (connection) {
        var sql = 'UPDATE pacientes SET Nombre = ' + connection.escape(pacienteData.Nombre) +
            ',Direccion = ' + connection.escape(pacienteData.Direccion) +
            ',FechaNacimiento = ' + connection.escape(pacienteData.FechaNacimiento) +
            ',Telefonos = ' + connection.escape(pacienteData.Telefonos) +
            ',TipoIdentificacion = ' + connection.escape(pacienteData.TipoIdentificacion) +
            ',Sexo = ' + connection.escape(pacienteData.Sexo) +
            ',Estado = ' + connection.escape(pacienteData.Estado) +
            'WHERE id = ' + pacienteData.id;

        connection.query(sql, function(error, result) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, { "msg": "success" });
            }
        });
    }
}
pacienteModel.deletePaciente = (id, callback) => {
    if (connection) {
        var sqlExists = 'SELECT 1 FROM pacientes WHERE id = ' + connection.escape(id);
        connection.query(sqlExists, function(err, row) {
            //si existe la id del usuario a eliminar
            if (row) {
                var sql = 'DELETE FROM pacientes WHERE id = ' + connection.escape(id);
                connection.query(sql, function(error, result) {
                    if (error) {
                        callback(error, { "msg": "" });
                    } else {
                        callback(null, { "msg": "deleted" });
                    }
                });
            } else {
                callback(null, { "msg": "notExist" });
            }
        });
    }
}
module.exports = pacienteModel;