var mysql = require('mysql'),
    connection = mysql.createConnection({ host: 'localhost', user: 'root', password: 'root', database: 'odontapp' });

var citasModel = {};
citasModel.getCitas = (callback) => {
    if (connection) {
        connection.query('SELECT c.id, P.identificacion, P.nombre, DATE_FORMAT(fechacita, "%Y/%m/%d") fechacita, c.horacita, c.idPaciente idpaciente FROM citas c INNER JOIN pacientes P ON P.id = c.idPaciente ORDER BY C.id', (error, rows) => {
            if (error) {} else {
                callback(null, rows);
            }
        });
    }
}
citasModel.getCita = (id, callback) => {
    if (connection) {
        connection.query('SELECT c.id, P.identificacion, P.nombre, DATE_FORMAT(fechacita, "%Y/%m/%d") fechacita, c.horacita, c.idPaciente idpaciente FROM citas c INNER JOIN pacientes P ON P.id = c.idPaciente WHERE c.id =' + id + ' ORDER BY C.id', (error, rows) => {
            if (error) {
                console.log(error);
            } else {
                callback(rows[0]);
            }
        });
    }
}
citasModel.insertCita = (citaData, callback) => {
    if (connection) {
        connection.query('INSERT INTO citas SET ?', citaData, (error, result) => {
            if (error) {
                console.log(error);
            } else {
                callback(null, { "insertId": result.insertId });
            }
        });
    }
}
citasModel.updateCita = (citaData, callback) => {
    var cita = {};
    if (connection) {
        var sql = 'UPDATE citas SET fechacita = ' + connection.escape(citaData.fechacita) + ', horacita = ' + connection.escape(citaData.horacita) + ' WHERE id = ' + citaData.id;
        connection.query(sql, function(error, result) {
            if (error) {
                throw error;
            } else {
                citasModel.getCita(citaData.id, (row) => {
                    callback(null, row);
                });
            }
        });
    } else {}
}
citasModel.deleteCita = (id, callback) => {
    if (connection) {
        var sqlExists = 'SELECT 1 FROM citas WHERE id = ' + connection.escape(id);
        connection.query(sqlExists, function(err, row) {
            //si existe la id del usuario a eliminar
            if (row) {
                var sql = 'DELETE FROM citas WHERE id = ' + connection.escape(id);
                connection.query(sql, function(error, result) {
                    if (error) {
                        throw error;
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

module.exports = citasModel;