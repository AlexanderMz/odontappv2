var mysql = require('mysql'),
    connection = mysql.createConnection({ host: 'localhost', user: 'root', password: 'root', database: 'odontapp' });

var registroModel = {};
registroModel.getSesionesByid = (id, callback) => {
    if (connection) {
        connection.query('SELECT a.id, a.idPaciente, DATE_FORMAT(a.fecha, "%Y/%m/%d - %r") fecha, COUNT(*) sesionNro FROM hc_general a JOIN hc_general b ON a.idPaciente = b.idPaciente AND a.fecha >= b.fecha WHERE a.idPaciente = ' + id + '  GROUP BY a.id, a.idPaciente, a.fecha', (error, rows) => {
            if (error) {} else {
                callback(null, rows);
            }
        });
    }
}
registroModel.getRegitroByid = (id, callback) => {
    if (connection) {
        connection.query('SELECT datosconsulta FROM hc_sesiones WHERE id_general =' + id, (error, rows) => {
            if (error) {
                console.log(error);
            } else {
                callback(null, rows[0]);
            }
        });
    }
}
registroModel.insertRegistro = (registro, callback) => {
    if (connection) {
        var general = {
            idPaciente: registro.idPaciente
        };
        var sesion;
        connection.beginTransaction(function(err) {
            if (err) { console.log(err); }
            connection.query('INSERT INTO hc_general SET ?', general, (error, result) => {
                if (error) {
                    return connection.rollback(function() {
                        console.log(error);
                    });
                }
                sesion = { id_general: result.insertId, datosconsulta: registro.datosconsulta };
                connection.query('INSERT INTO hc_sesiones SET ?', sesion, (error, result) => {
                    if (error) {
                        return connection.rollback(function() {
                            console.log(error);
                        });
                    }
                });
                connection.commit(function(err) {
                    if (err) {
                        return connection.rollback(function() {
                            console.log(err);
                        });
                    }
                    callback(null, { "message": "exito!" });
                });
            });
        });
    }
}

module.exports = registroModel;