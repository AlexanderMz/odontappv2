var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    //res.render('index', {title: 'Express'});
});
//obtenemos el modelo UserModel con toda la funcionalidad
var UserModel = require('../models/users');
router.get("/user/update/:id", (req, res) => {
    var id = req.params.id;
    //solo actualizamos si la id es un número
    if (!isNaN(id)) {
        UserModel.getUser(id, function(error, data) {
            //si existe el usuario mostramos el formulario
            if (typeof data !== 'undefined' && data.length > 0) {
                res.render("index", {
                    title: "Formulario",
                    info: data
                });
            }
            //en otro caso mostramos un error
            else {
                res.status(404).json({ "msg": "notExist" });
            }
        });
    }
    //si la id no es numerica mostramos un error de servidor
    else {
        res.status().json(500, { "msg": "The id must be numeric" });
    }
});
router.get("/create", (req, res) => {
    res.render("new", {
        title: "Formulario para crear un nuevo recurso"
    });
});
router.get("/delete", (req, res) => {
    res.render("delete", {
        title: "Formulario para eliminar un recurso"
    });
});
router.get("/users", (req, res) => {
    UserModel.getUsers(function(error, data) {
        res.status(200).json(data);
    });
});
router.get("/users/:id", (req, res) => {
    //id del usuario
    var id = req.params.id;
    //solo actualizamos si la id es un número
    if (!isNaN(id)) {
        UserModel.getUser(id, function(error, data) {
            //si el usuario existe lo mostramos en formato json
            if (typeof data !== 'undefined' && data.length > 0) {
                res.status(200).json(data);
            }
            //en otro caso mostramos una respuesta conforme no existe
            else {
                res.status(404).json({ "msg": "notExist" });
            }
        });
    }
    //si hay algún error
    else {
        res.status(500).json({ "msg": "Error" });
    }
});
router.post("/users", (req, res) => {
    //creamos un objeto con los datos a insertar del usuario
    var userData = {
        id: null,
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        created_at: null,
        updated_at: null
    };
    UserModel.insertUser(userData, function(error, data) {
        //si el usuario se ha insertado correctamente mostramos su info
        if (data && data.insertId) {
            res.redirect("/users/" + data.insertId);
        } else {
            res.status(500).json({ "msg": "Error" });
        }
    });
});
router.post("/userslogin", (req, res) => {

    var uDataLogin = {
        id: req.body.id,
        pass: req.body.password
    };
    console.log(uDataLogin);
    UserModel.validarLogin(uDataLogin, (error, data) => {
        if (data) {
            res.status(200).json(data);
        } else {
            res.status(500).json({ "Error": "true", "Mensaje": "Usuario no encotrado. \n" + error });
        }
    });
});
router.put("/users", (req, res) => {
    //almacenamos los datos del formulario en un objeto
    var userData = { id: req.param('id'), username: req.param('username'), email: req.param('email') };
    UserModel.updateUser(userData, function(error, data) {
        //si el usuario se ha actualizado correctamente mostramos un mensaje
        if (data && data.msg) {
            res.status(200).json(data);
        } else {
            res.status(500).json({ "msg": "Error" });
        }
    });
});
router.delete("/users", (req, res) => {
    //id del usuario a eliminar
    var id = req.params.id;
    UserModel.deleteUser(id, function(error, data) {
        if (data && data.msg === "deleted" || data.msg === "notExist") {
            res.status(200).json(data);
        } else {
            res.status(500).json({ "msg": "Error" });
        }
    });
});
router.get("/roles", (req, res) => {
    UserModel.getRoles(function(error, data) {
        res.status(200).json(data);
    });
});

/*obtenemos el modelo PacienteModel con toda la funcionalidad*/
var PacienteModel = require('../models/paciente');
router.get("/pacientes", (req, res) => {
    PacienteModel.getPacientes((error, data) => {
        res.status(200).json(data);
    });
});
router.post("/paciente", (req, res) => {
    var data = {
        id: null,
        Identificacion: req.body.Identificacion,
        Nombre: req.body.Nombre,
        Direccion: req.body.Direccion,
        FechaNacimiento: req.body.FechaNacimiento,
        Telefonos: req.body.Telefonos,
        TipoIdentificacion: req.body.TipoIdentificacion,
        Sexo: req.body.Sexo,
        Estado: req.body.Estado
    };
    PacienteModel.insertPaciente(data, (error, data) => {
        if (data && data.insertId) {
            res.status(200).json(data);
        } else {
            res.status(500).json({ "msg": "Error" });
        }
    })
});
router.put("/paciente", (req, res) => {
    var data = {
        id: req.body.id,
        Identificacion: req.body.Identificacion,
        Nombre: req.body.Nombre,
        Direccion: req.body.Direccion,
        FechaNacimiento: req.body.FechaNacimiento,
        Telefonos: req.body.Telefonos,
        TipoIdentificacion: req.body.TipoIdentificacion,
        Sexo: req.body.Sexo,
        Estado: req.body.Estado
    };
    PacienteModel.updatePaciente(data, (error, data) => {
        if (data && data.msg) {
            res.status(200).json(data);
        } else {
            res.status(500).json(error);
        }
    })
});
router.delete("/paciente/:id", (req, res) => {
    var id = req.params.id;
    PacienteModel.deletePaciente(id, (error, data) => {
        if (data && data.msg === "deleted" || data.msg === "notExist") {
            res.status(200).json(data);
        } else {
            res.status(500).json({ "msg": "Error" });
        }
    });
});

/*obtenemos el modelo CitasModel con toda la funcionalidad*/
var CitasModel = require('../models/citas');
router.get("/citas", (req, res) => {
    CitasModel.getCitas((error, data) => {
        res.status(200).json(data);
    });
});
router.post("/cita", (req, res) => {
    var data = {
        idPaciente: req.body.idpaciente,
        fechacita: req.body.fechacita,
        horacita: req.body.horacita
    };
    CitasModel.insertCita(data, (error, data) => {
        if (data && data.insertId) {
            res.status(200).json(data);
        } else {
            res.status(500).json({ "msg": "Error" });
        }
    });
});
router.put("/cita", (req, res) => {
    var data = {
        id: req.body.id,
        fechacita: req.body.fechacita,
        horacita: req.body.horacita
    };
    CitasModel.updateCita(data, (error, data) => {
        if (data) {
            res.status(200).json(data);
        } else {
            res.status(500).json({ "msg": "Error" });
        }
    })
})
router.delete("/cita/:id", (req, res) => {
    var id = req.params.id;
    CitasModel.deleteCita(id, (error, data) => {
        if (data && data.msg === "deleted" || data.msg === "notExist") {
            res.status(200).json(data);
        } else {
            res.status(500).json({ "msg": "Error" });
        }
    });
});

/*obtenemos el modelo de RegistroModel con toda la funcionalidad*/
var RegistroModel = require('../models/registro');
router.get("/sesiones/:id", (req, res) => {
    var id = req.params.id;
    RegistroModel.getSesionesByid(id, (error, data) => {
        if (data) {
            res.status(200).json(data);
        }
    })
})
router.get("/registro/:id", (req, res) => {
    var id = req.params.id;
    RegistroModel.getRegitroByid(id, (error, data) => {
        if (data) {
            res.status(200).json(data);
        }
    })
})
router.post("/registro", (req, res) => {
        var data = {
            idPaciente: req.body.idpaciente,
            datosconsulta: req.body.datosconsulta
        };
        try {
            RegistroModel.insertRegistro(data, (error, data) => {
                if (data) {
                    res.status(200).json(data);
                } else {
                    res.status(500).json({ "msg": "Error" });
                }
            });
        } catch (error) {
            console.log(error);
        }
    })
    /*Exportamos el router*/
module.exports = router;