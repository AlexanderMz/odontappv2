'use strict';

angular.module('API', []);
angular.module('Directives', []);
angular.module('CONFIG', [])
    .constant('ConfigAPI', {
        'APP_NAME': 'OdontApp',
        'APP_VERSION': '1.0.0',
        'GOOGLE_ANALYTICS_ID': '',
        'BASE_URL': '',
        'SYSTEM_LANGUAGE': '',
        'SERVICE_URL': '',
        'HEADER': {
            'headers': {
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=utf8'
            }
        }
    });
angular.module('OdontApp', [
        'CONFIG',
        'API',
        'Directives',
        'dataGrid',
        'pagination',
        'ui.router',
        'ui.bootstrap',
        'ngCookies'
    ])
    .config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $locationProvider) {
        //$urlRouterProvider.otherwise('/otherwise');
        $stateProvider
            .state('/', { url: '/', templateUrl: 'views/login/login.view.html', controller: 'LoginController', data: { pageTitle: 'Inicio de sesión' } })
            .state('home', { url: '/home', template: '<center><p><h3>Bienvenido a</h3><h1>OdontApp</h1></p></center>', data: { pageTitle: 'Inicio' } })
            .state('login', { url: '/login', templateUrl: 'views/login/login.view.html', controller: 'LoginController', data: { pageTitle: 'Inicio de sesión' } })
            .state('pacientes', { url: '/regpacientes', templateUrl: 'views/pacientes/pacientes.view.html', controller: 'PacientesCtrl', data: { pageTitle: 'Administración de pacientes' } })
            .state('perfil', { url: '/perfil', templateUrl: 'views/usuarios/perfilUsuario.view.html', controller: 'ClienteController', data: { pageTitle: '' } })
            .state('userAdm', { url: '/AdmUsuarios', templateUrl: 'views/usuarios/crearUsuario.view.html', controller: 'UsuariosController', data: { pageTitle: 'Administración de usuarios' } })
            .state('newHC', { url: '/historia', templateUrl: 'views/registro/registro.view.html', controller: 'RegistroCtrl', data: { pageTitle: 'Registro' } })
            .state('newCita', { url: '/gestioncitas', templateUrl: 'views/citas/citas.view.html', controller: 'CitasController', data: { pageTitle: 'Gestión de citas' } })
            .state('ConsultarHC', { url: '/consultarhistoria', templateUrl: 'views/registro/consultar.view.html', controller: 'RegistroCtrl', data: { pageTitle: 'Consulta' } })
            .state('otherwise', {
                url: '/nofound',
                template: '<center><p><h3>{{title}}</h3><h1>{{message}}</h1></p></center>',
                params: {
                    title: 'Page not found',
                    message: 'Could not find a state associated with url'
                },
                controller: function($scope, $stateParams) {
                    $scope.title = $stateParams.title;
                    $scope.message = $stateParams.message;
                },
                data: { pageTitle: 'OJO!' }
            });

        $locationProvider.html5Mode({
            enabled: false,
            requireBase: false
        });
        $urlRouterProvider.otherwise(function($injector, $location) {
            var $state = $injector.get('$state');

            $state.go('otherwise', {
                title: "Page not found",
                message: 'Could not find a state associated with url "' + $location.$location.$$url + '"'
            });
        });
    }])
    .run(['$rootScope', '$state', '$cookieStore', '$http', 'AuthenticationService', function($rootScope, $state, $cookieStore, $http, AuthenticationService) {
        // keep user logged in after page refresh
        $rootScope.$state = $state;
        $rootScope.globals = $cookieStore.get('globals') || {};
        $rootScope.userData = $cookieStore.get('userData') || {};

        if ($rootScope.globals.currentUser) {
            $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.authdata;
            $rootScope.isLogin = true;
        }
        $rootScope.$on('$locationChangeStart', function(event, next, current) {
            // redirect to login page if not logged in
            if (!$rootScope.globals.currentUser || !AuthenticationService.isAuthenticated()) {
                $state.go('/');
            }
        });
        $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
            toTop();
        });
    }])
    .config(['$httpProvider', function($httpProvider) {
        $httpProvider.defaults.headers.common['Access-Control-Allow-Origin'] = true;
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
        $httpProvider.defaults.headers.common = {
            'Content-Type': 'application/json, charset=UTF-8'
        };
        $httpProvider.defaults.headers.post = {};
        $httpProvider.defaults.headers.put = {};
        $httpProvider.defaults.headers.patch = {};
    }])
    .controller('MainController', ['$scope', '$rootScope', '$cookieStore', '$state', function($scope, $rootScope, $cookieStore, $state) {
        $scope.userData = $rootScope.userData;

        $scope.capitalize = (string) => {
            return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
        }
    }])
    .controller('LoginController', ['$scope', '$rootScope', '$cookieStore', '$state', 'AuthenticationService', '$sce', function($scope, $rootScope, $cookieStore, $state, AuthenticationService, $sce) {
        // reset login status
        $scope.isLogin = false;
        $rootScope.isLogin = false;
        AuthenticationService.ClearCredentials();
        //$state.reload();
        $scope.login = function() {
            $scope.dataLoading = true;
            var data = {
                id: $scope.id,
                password: $scope.pass
            };
            AuthenticationService.Login(data, (response, error) => {
                if (response && !error) {
                    $scope.userData = response;
                    $rootScope.userData = response;
                    $cookieStore.put('userData', $rootScope.userData);
                    $scope.isLogin = true;
                    $rootScope.isLogin = true;
                    AuthenticationService.SetCredentials($scope.id, $scope.pass);
                    $state.go('home');
                } else {
                    $scope.error = true;
                    bootbox.alert({
                        message: response.Mensaje,
                        size: 'small'
                    });
                    $scope.isLogin = false;
                    $rootScope.isLogin = false;
                    $scope.dataLoading = false;
                }
            });
        };
        $('#enviar').on('click', () => {
            $scope.login();
        });
    }])
    .controller('UsuariosController', ['$scope', '$rootScope', '$cookieStore', '$state', 'AuthenticationService', 'Usuarios', function($scope, $rootScope, $cookieStore, $state, AuthenticationService, Usuarios) {
        $scope.Usuario = [];
        Usuarios.getRoles();
        Usuarios.Listar();
        $scope.rolUsuario = [];
        $scope.listadoUsuarios = [];
        $scope.listadoUsuarios = Usuarios.listado;
        $scope.rolUsuario = Usuarios.roles;
        $scope.gridUsuarios = {
            data: $scope.listadoUsuarios
        };

        $scope.guardarUsuario = (usuario) => {
            Usuarios.Guardar();
        }

        $scope.actualizarUsuario = (usuario) => {
            var data = {
                id: usuario.id,
                identificacion: usuario.Identificacion,
                nombre: usuario.Nombre,
                direccion: usuario.Direccion,
                correo: usuario.Correo,
                telefonos: usuario.Telefonos,
                TipId: usuario.TipoIdentificacion,
                rolid: '' + usuario.RolId + '',
                nroReg: usuario.NroRegistro,
                activo: '' + usuario.Activo + ''
            };
            $scope.Usuario = data;
            toTop();
        }
        $scope.cancelar = () => {
            $state.reload();
        }
    }])
    .controller('PacientesCtrl', ['$scope', '$rootScope', '$cookieStore', '$state', 'Pacientes', '$timeout', function($scope, $rootScope, $cookieStore, $state, Pacientes, $timeout) {
        // gridOPpendientes
        Pacientes.Listar();
        $scope.paciente = [];
        $scope.listadoPacientes = [];
        $scope.serverPagination = true;
        $scope.listadoPacientes = Pacientes.listado;
        $scope.gridPacientes = {
            data: $scope.listadoPacientes,
            pagination: {
                itemsPerPage: 10
            }
        };
        $scope.guardarPaciente = (paciente) => {
            blockui(".panel", () => {
                var data = {
                    Identificacion: paciente.identificacion,
                    Nombre: paciente.nombre,
                    Direccion: paciente.direccion,
                    FechaNacimiento: paciente.fechaNac,
                    Telefonos: paciente.telefonos,
                    TipoIdentificacion: paciente.TipId,
                    Sexo: paciente.sexo,
                    Estado: paciente.estado
                };
                if (paciente.id) {
                    data.id = paciente.id
                    Pacientes.Actualizar(data, (response) => {
                        if (response) {
                            Example.show('Paciente actualizado!');
                            $state.reload();
                        }
                    });
                } else {
                    data.Estado = 1;
                    Pacientes.Guardar(data, (response) => {
                        if (response != null) {
                            Example.show('Paciente registrado!');
                            $state.reload();
                        } else {
                            Pacientes.dataLoading = false;
                            Example.show('Error al procesar la orden.');
                        }
                    });
                }
            });
        }
        $scope.eliminarPaciente = (paciente) => {
            bootbox.confirm({
                title: "<b>Eliminar paciente</b>",
                message: "¿Esta seguro que desea borrar este paciente?<br><b>" + paciente.Nombre + "</b>",
                buttons: {
                    confirm: { label: '<b><i class="icon-check"></i></b>    Si', className: 'btn btn-success btn-labeled btn-labeled-left btn-sm text-bold' },
                    cancel: { label: '<b><i class="icon-x"></i></b>    No', className: 'btn bg-danger btn-labeled btn-labeled-left btn-sm text-bold' }
                },
                callback: function(result) {
                    if (result) {
                        blockui(".panel-body", () => {
                            Pacientes.Eliminar(paciente.id, (res) => {
                                if (res) {
                                    Example.show('Paciente eliminado!');
                                    $state.reload();
                                } else {
                                    bootbox.alert("Este paciente aun tiene citas en el sistema");
                                }
                            });
                        });
                    }
                }
            });
        };
        $scope.actualizarPaciente = (paciente) => {
            var data = {
                id: paciente.id,
                identificacion: paciente.Identificacion,
                nombre: paciente.Nombre,
                direccion: paciente.Direccion,
                fechaNac: paciente.FechaNacimiento,
                telefonos: paciente.Telefonos,
                TipId: paciente.TipoIdentificacion,
                sexo: paciente.Sexo,
                estado: '' + paciente.Estado + ''
            };
            $scope.paciente = data;
            toTop();
            if (!document.querySelector('.transition.collapsible').classList.contains('collapsed')) {
                document.querySelector('.transition.collapsible').classList.toggle('collapsed');
            }
        };
        $scope.cancelar = () => {
            $state.reload();
        }

        $('#nuevoPaciente').on('click', () => {
            if (!document.querySelector('.transition.collapsible').classList.contains('collapsed')) {
                document.querySelector('.transition.collapsible').classList.toggle('collapsed');
            } else {

            }
        });

        $('.daterange-basic').daterangepicker({
            locale: { format: 'YYYY/MM/DD' },
            singleDatePicker: true,
            showDropdowns: true,
            minYear: 1901,
            maxYear: parseInt(moment().format('YYYY'), 10)
        }, (start, end) => {
            $scope.paciente.fechaNac = end.format("YYYY/MM/DD");
        });
    }])
    .controller('RegistroCtrl', ['$scope', '$rootScope', '$compile', '$cookieStore', '$state', 'Registro', function($scope, $rootScope, $compile, $cookieStore, $state, Registro) {
        $scope.paciente = {};
        $scope.registro = {};
        $scope.gridActions12 = {};
        $scope.gridSesiones = {
            data: []
        };
        $scope.buscarPaciente = () => {
                var d = new $('#buscarPaciente');
                d.init(() => {
                    d.find('.bootbox-body').html($compile('<buscar-paciente></buscar-paciente>')($scope));
                    d.find('.modal-title').html("<b>Busqueda de pacientes</b>");
                })
                d.modal('show');
                d.on('hidden.bs.modal', () => {
                    var p = d.data('paciente')
                    if (p) {
                        $scope.registro.idPaciente = p.id;
                        $scope.registro.identificacion = p.Identificacion;
                        $scope.registro.nombrepaciente = p.Nombre;
                        $scope.registro.fechaNacimiento = p.FechaNacimiento;
                        $scope.$apply();
                        Registro.getSesionesById(p.id, (data) => {
                            $scope.gridSesiones.data = data;
                        })
                    }
                });
            }
            /*Consulta*/
        $scope.selectSesion = (event, elem) => {
            $(event.originalEvent.path).find('tr.success').removeClass('success');
            $(event.currentTarget).removeClass('success');
            $(event.currentTarget).addClass('success');
            //$scope.cita.idpaciente = elem.item.id;
            Registro.getRegitroById(elem.item.id, (data) => {
                $scope.registro.datosconsulta = JSON.parse(data.datosconsulta);
            })
        };

        /*Registro*/
        $scope.GuardarRegistro = (registro) => {
            var data = {
                idpaciente: registro.idPaciente,
                datosconsulta: JSON.stringify(registro.datosconsulta || {})
            };
            Registro.Guardar(data, (response) => {
                if (response) {
                    Example.show('Registro guardado');
                    $state.reload();
                }
            });
        }
    }])
    .controller('CitasController', ['$scope', '$sce', '$cookieStore', '$state', '$compile', '$filter', 'Citas', 'Pacientes', function($scope, $sce, $cookieStore, $state, $compile, $filter, Citas, Pacientes) {
        Citas.getCitas();
        $scope.listadoCitas = [];
        $scope.listadoCitas = Citas.listado;
        $scope.gridActions = {};
        $scope.infohtml = $sce.trustAsHtml("<i class='icon-info22'></b> Nueva cita");
        $scope.gridCitas = {
            data: $scope.listadoCitas,
            customFilters: {
                mesNumber: (items, value, predicate) => {
                    return items.filter((item) => {
                        var mes = new Date(item[predicate]).getMonth() + 1;
                        return value && item[predicate] ? mes === parseInt(value) : true;
                    });
                }
            },
            pagination: {
                itemsPerPage: 10
            }
        };
        //$filter("date")(var, "dd/MM/yyyy")
        $scope.eliminarCita = (cita) => {
            bootbox.confirm({
                title: "<b>Eliminar cita</b>",
                message: "¿Esta seguro que desea eliminar esta cita? <br> Paciente: <b>" + cita.nombre + "</b><br> Fecha cita: <b>" + cita.fechacita + "</b><br> Hora: <b>" + cita.horacita + "</b>",
                buttons: {
                    confirm: { label: '<b><i class="icon-check"></i></b>Si', className: 'btn btn-success btn-labeled btn-labeled-left btn-sm text-bold text-right' },
                    cancel: { label: '<b><i class="icon-x"></i></b>No', className: 'btn bg-danger btn-labeled btn-labeled-left btn-sm text-bold text-right' }
                },
                callback: function(result) {
                    if (result) {
                        blockui("#listadoCita", () => {
                            Citas.Eliminar(cita.id, (res) => {
                                if (res) {
                                    Example.show('Cita Eliminada!');
                                    $state.reload();
                                }
                            });
                        });
                    }
                }
            });
        };
        $scope.editarCita = (datoscita) => {
            $scope.datoscita = datoscita;
            var d = new $('#nuevaCita');
            d.init(() => {
                d.find('.bootbox-body').html($compile('<nueva-cita bind="false"></nueva-cita>')($scope));
                d.find('.modal-title').html("<b>Reprogramar cita</b>");
                $('.daterange-basic').daterangepicker({
                    locale: { format: 'YYYY/MM/DD' },
                    singleDatePicker: true,
                    showDropdowns: true,
                    minDate: moment(),
                    maxYear: parseInt(moment().format('YYYY'), 10),
                    parentEl: 'div.modal'
                }, (start, end) => {
                    $scope.datoscita.fechacita = end.format("YYYY/MM/DD");
                });
            })
            d.modal('show');

            AnyTime.noPicker('horacita');
            $("#horacita").AnyTime_picker({
                format: "%H:%i"
            });
        };
        $scope.nuevaCita = () => {
            $scope.datoscita = {};
            var d = new $('#nuevaCita');
            d.init(() => {
                d.find('.bootbox-body').html($compile('<nueva-cita bind="true"></nueva-cita>')($scope));
                d.find('.modal-title').html("<b>Nueva cita</b>");
                $('.daterange-basic').daterangepicker({
                    locale: { format: 'YYYY/MM/DD' },
                    singleDatePicker: true,
                    showDropdowns: true,
                    minDate: moment(),
                    maxYear: parseInt(moment().format('YYYY'), 10),
                    parentEl: 'div.modal'
                }, (start, end) => {
                    $scope.datoscita.fechacita = end.format("YYYY/MM/DD");
                });
            });
            d.modal('show');

            AnyTime.noPicker('horacita');
            $("#horacita").AnyTime_picker({
                format: "%H:%i"
            });
        };
    }])
    .filter('cortarTexto', function() {
        return function(input, len) {
            return (input.length > len) ? input.substr(0, len) + '...' : input;
        };
    });