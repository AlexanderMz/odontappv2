//
var appName = 'odontapp';
//llamamos al paquete mysql que hemos instalado
var mysql = require('mysql'),
    connection = mysql.createConnection({ host: 'localhost', user: 'root', password: 'root', database: 'odontapp' });

//creamos un objeto para ir almacenando todo lo que necesitemos
var userModel = {};

//obtenemos todos los usuarios
userModel.getUsers = function (callback) {
    if (connection) {
        connection.query('SELECT ur.Nombre as rolName, u.* FROM usuarios u INNER JOIN usuario_roles ur ON u.RolId = ur.id ORDER BY u.id', function (error, rows) {
            if (error) {
                throw error;
            } else {
                callback(null, rows);
            }
        });
    }
}
//obtenemos todos los roles para los usuarios
userModel.getRoles = function (callback) {
    if (connection) {
        connection.query('SELECT * FROM usuario_roles ORDER BY id', function (error, rows) {
            if (error) {
                throw error;
            } else {
                callback(null, rows);
            }
        });
    }
}
//obtenemos un usuario por su id
userModel.getUser = function (id, callback) {
    if (connection) {
        var sql = 'SELECT * FROM usuarios WHERE Identificacion = ' + connection.escape(id);
        connection.query(sql, function (error, row) {
            if (error) {
                throw error;
            } else {
                callback(null, row);
            }
        });
    }
}
//añadir un nuevo usuario
userModel.insertUser = function (userData, callback) {
    if (connection) {
        connection.query('INSERT INTO usuarios SET ?', userData, function (error, result) {
            if (error) {
                throw error;
            } else {
                //devolvemos la última id insertada
                callback(null, { "insertId": result.insertId });
            }
        });
    }
}
//login usuario
userModel.validarLogin = (uDataLogin, callback) => {
    if (connection) {
        var sql = 'SELECT ur.id,ur.Nombre as rolName, u.Nombre, u.Activo, u.NroRegistro	FROM usuarios u INNER JOIN usuario_roles ur	ON u.RolId = ur.id WHERE u.Identificacion=' + uDataLogin.id + ' AND aes_decrypt(Clave,\'odontapp\') = ' + connection.escape(uDataLogin.pass) + '';
        connection.query(sql, null, (error, result) => {
            if (error) {
                console.log(error)
                callback(error, null);
            } else {
                if (result.length > 0) {
                    callback(null, result[0]);
                } else {
                    callback(null, null);
                }
            }
        });
    }
}
//actualizar un usuario
userModel.updateUser = function (userData, callback) {
    //console.log(userData); return;
    if (connection) {
        var sql = 'UPDATE usuarios SET username = ' + connection.escape(userData.username) + ',' +
            'email = ' + connection.escape(userData.email) +
            'WHERE id = ' + userData.id;

        connection.query(sql, function (error, result) {
            if (error) {
                throw error;
            } else {
                callback(null, { "msg": "success" });
            }
        });
    }
}
//eliminar un usuario pasando la id a eliminar
userModel.deleteUser = function (id, callback) {
    if (connection) {
        var sqlExists = 'SELECT * FROM usuarios WHERE id = ' + connection.escape(id);
        connection.query(sqlExists, function (err, row) {
            //si existe la id del usuario a eliminar
            if (row) {
                var sql = 'DELETE FROM usuarios WHERE id = ' + connection.escape(id);
                connection.query(sql, function (error, result) {
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
//exportamos el objeto para tenerlo disponible en la zona de rutas
module.exports = userModel;