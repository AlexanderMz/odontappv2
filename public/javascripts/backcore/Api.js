'use strict';

angular.module('API', [
    'CONFIG'
])

.factory('Pacientes', ['ConfigAPI', '$http', function(ConfigAPI, $http) {
        var Paciente = {};

        Paciente.listado = [];

        Paciente.Guardar = (paciente, callback) => {
            $http.post('/paciente', paciente, ConfigAPI.HEADER)
                .then((res) => {
                    callback(res.data);
                }, (response) => {

                });
        };
        Paciente.Listar = () => {
            $http.get('/pacientes')
                .then((res) => {
                    angular.copy(res.data, Paciente.listado);
                }, (response) => {

                });
        };
        Paciente.Eliminar = (id, callback) => {
            $http.delete("/paciente/" + id)
                .then((res) => {
                    callback(res.data);
                }, (response) => {
                    callback(null);
                });
        };
        Paciente.Actualizar = (paciente, callback) => {
            $http.put('/paciente', paciente, ConfigAPI.HEADER)
                .then((res) => {
                    callback(res.data);
                }, (response) => {
                    callback(null);
                });
        };
        Paciente.VerificarTemp = () => {
            Paciente.OrdenProceso.Productos.forEach((items) => {
                Paciente.OrdenProcesoInventario.forEach((item) => {
                    if (item.CodigoLote == items.CodigoLote && items.Estado == false) {
                        items.Estado = true;
                    }
                });
            });
        };

        return Paciente;
    }])
    .factory('Usuarios', ['ConfigAPI', '$http', function(ConfigAPI, $http) {
        var Usuarios = {};
        Usuarios.listado = [],
            Usuarios.roles = [];
        Usuarios.Guardar = () => {
            alert('asdasd');
        };
        Usuarios.getRoles = () => {
            $http.get('/roles')
                .then((res) => {
                    angular.copy(res.data, Usuarios.roles);
                });
        };
        Usuarios.Listar = () => {
            $http.get('/users')
                .then((res) => {
                    angular.copy(res.data, Usuarios.listado);
                });
        };

        return Usuarios;
    }])
    .factory('Citas', ['ConfigAPI', '$http', function(ConfigAPI, $http) {
        var Citas = {};
        Citas.listado = [];
        Citas.Guardar = (citaData, callback) => {
            $http.post("/cita", citaData, ConfigAPI.HEADER)
                .then((res) => {
                    callback(res.data);
                });
        };
        Citas.Actualizar = (citaData, callback) => {
            $http.put('/cita', citaData, ConfigAPI.HEADER)
                .then((res) => {
                    callback(res.data);
                }, (response) => {

                });
        }
        Citas.getCitas = () => {
            $http.get("/citas").then((res) => { angular.copy(res.data, Citas.listado); });
        }
        Citas.Eliminar = (id, callback) => {
            $http.delete("/cita/" + id).then((res) => { callback(res.data); });
        }

        return Citas;
    }])
    .factory('Registro', ['ConfigAPI', '$http', function(ConfigAPI, $http) {
        var Registro = {};
        Registro.listado = [];
        Registro.Guardar = (registroData, callback) => {
            $http.post("/registro", registroData, ConfigAPI.HEADER)
                .then((res) => {
                    callback(res.data);
                });
        };
        Registro.Actualizar = (registroData, callback) => {
            $http.put('/registro', registroData, ConfigAPI.HEADER)
                .then((res) => {
                    callback(res.data);
                }, (response) => {

                });
        }
        Registro.getSesionesById = (id, callback) => {
            $http.get("/sesiones/" + id).then((res) => {
                if (res.data) {
                    var data = res.data;
                    callback(data);
                }
            });
        }
        Registro.getRegitroById = (id, callback) => {
            $http.get("/registro/" + id).then((res) => { callback(res.data); });
        }

        return Registro;
    }])
    .factory('AuthenticationService', ['Base64', 'ConfigAPI', '$http', '$cookieStore', '$rootScope', '$timeout', function(Base64, ConfigAPI, $http, $cookieStore, $rootScope, $timeout) {
        var ser = {};
        ser.Login = (data, callback) => {
            $http.post('/userslogin', data, ConfigAPI.HEADER)
                .then((response) => {
                    callback(response.data, false);
                }, (response) => {
                    callback(response.data, true);
                });
        };

        ser.hacerConsulta = (data, callback) => {
            $http.post(ConfigAPI.SERVICE_URL + '/consultas', data, ConfigAPI.HEADER)
                .then((response) => {
                    callback(true, response.data.Table);
                }, (response) => {
                    callback(false, response.data);
                });
        };
        // Checks if it's authenticated
        ser.isAuthenticated = function() {
            return !($cookieStore.get('globals') === undefined);
        };
        ser.SetCredentials = function(usr, pass) {
            var authdata = Base64.encode(usr + ':' + pass);

            $rootScope.globals = {
                currentUser: {
                    usr: usr,
                    isLoged: true,
                    authdata: authdata
                }
            };

            $http.defaults.headers.common['Authorization'] = 'Basic ' + authdata; // jshint ignore:line
            $cookieStore.put('globals', $rootScope.globals);
        };
        ser.ClearCredentials = function() {
            $rootScope.globals = {};
            $cookieStore.remove('globals');
            $cookieStore.remove('userData');
            $http.defaults.headers.common.Authorization = 'Basic ';
        };
        return ser;
    }])
    .factory('Base64', function() {
        var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
        return {
            encode: function(input) {
                var output = "";
                var chr1, chr2, chr3 = "";
                var enc1, enc2, enc3, enc4 = "";
                var i = 0;

                do {
                    chr1 = input.charCodeAt(i++);
                    chr2 = input.charCodeAt(i++);
                    chr3 = input.charCodeAt(i++);

                    enc1 = chr1 >> 2;
                    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                    enc4 = chr3 & 63;

                    if (isNaN(chr2)) {
                        enc3 = enc4 = 64;
                    } else if (isNaN(chr3)) {
                        enc4 = 64;
                    }

                    output = output +
                        keyStr.charAt(enc1) +
                        keyStr.charAt(enc2) +
                        keyStr.charAt(enc3) +
                        keyStr.charAt(enc4);
                    chr1 = chr2 = chr3 = "";
                    enc1 = enc2 = enc3 = enc4 = "";
                } while (i < input.length);

                return output;
            },
            decode: function(input) {
                var output = "";
                var chr1, chr2, chr3 = "";
                var enc1, enc2, enc3, enc4 = "";
                var i = 0;

                // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
                var base64test = /[^A-Za-z0-9\+\/\=]/g;
                if (base64test.exec(input)) {
                    window.alert("There were invalid base64 characters in the input text.\n" +
                        "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
                        "Expect errors in decoding.");
                }
                input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

                do {
                    enc1 = keyStr.indexOf(input.charAt(i++));
                    enc2 = keyStr.indexOf(input.charAt(i++));
                    enc3 = keyStr.indexOf(input.charAt(i++));
                    enc4 = keyStr.indexOf(input.charAt(i++));

                    chr1 = (enc1 << 2) | (enc2 >> 4);
                    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                    chr3 = ((enc3 & 3) << 6) | enc4;

                    output = output + String.fromCharCode(chr1);

                    if (enc3 != 64) {
                        output = output + String.fromCharCode(chr2);
                    }
                    if (enc4 != 64) {
                        output = output + String.fromCharCode(chr3);
                    }

                    chr1 = chr2 = chr3 = "";
                    enc1 = enc2 = enc3 = enc4 = "";

                } while (i < input.length);

                return output;
            }
        };
        /* jshint ignore:end */
    });