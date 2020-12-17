'use strict';

angular.module('Directives')

.directive('bbAlert', [function () {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            stitle: "="
        },
        template:`<div class="bb-alert alert alert-info" style="display:none;">
                    <span>The examples populate this alert with dummy content</span>
                 </div>`,
        link: function (scope, iElement, iAttrs) {
        }
    };
}])
.directive('nuevaCita', ['Pacientes', 'Citas', (Pacientes, Citas) => {
    return {
        restrict: 'E',        
        scope: {
            'mostrarGrid': '=bind'
        },
        replace: true,
        template: `<div>
                    <div class="row" ng-if="!mostrarGrid">
                        <div class="form-group col-md-3">
                            <span>Identificacion</span>
                            <input type="text" id="ident" ng-model="cita.identificacion" class="form-control form-control-sm input-sm" disabled required />
                        </div>
                        <div class="form-group col-md-9">
                            <span>Nombre</span>
                            <input type="text" ng-model="cita.nombre" class="form-control form-control-sm input-sm" disabled required />
                        </div>
                    </div>     
                    <div class="row">
                        <div class="form-group col-md-6">
                            <span>Fecha cita</span>
                            <div class="input-group">
                                <div class="input-group-addon">
                                    <i class="icon-calendar22"></i>
                                </div>
                                <input type="text" ng-model="cita.fechacita" class="form-control form-control-sm input-sm daterange-basic" id="fechacita" required />
                            </div>
                        </div>
                        <div class="form-group col-md-6">
                            <span>Hora cita</span>
                            <div class="input-group">
                                <div class="input-group-addon">
                                    <i class="icon-watch2"></i>
                                </div>
                                <input type="text" ng-model="cita.horacita" class="form-control form-control-sm input-sm" id="horacita" required />
                            </div>
                        </div>
                    </div>        
                    <div ng-if="mostrarGrid" grid-data id="listadoCitaPaciente" grid-options="gridCitaPacientes" grid-actions="gridActions2">
                        <table class="table table-xxs table-striped table-bordered table-hover datatable-selection-single">
                            <thead>
                                <tr>
                                    <th>Identificacion</th>
                                    <th>Nombre</th>
                                </tr>
                                <tr>
                                    <td>
                                        <input type="text" class="form-control input-sm form-control-sm" ng-change="gridActions2.filter()" ng-model="item.Identificacion" filter-by="Identificacion" filter-type="text" grid-id="listadoCitaPaciente">
                                    </td>
                                    <td>
                                        <input type="text" class="form-control input-sm form-control-sm" ng-change="gridActions2.filter()" ng-model="item.Nombre" filter-by="Nombre" filter-type="text" grid-id="listadoCitaPaciente">
                                    </td>
                                </tr>
                            </thead>
                            <tbody>
                                <tr grid-item ng-click="selectItm($event, this)" class="odd">
                                    <td ng-bind="item.Identificacion"> </td>
                                    <td ng-bind="item.Nombre"> </td>
                                </tr>
                            </tbody>
                        </table>
                        <div class="col-md-12 text-center" ng-hide="filtered.length">
                            SIN REGISTROS
                        </div><br>
                        <paginacion-element></paginacion-element><br>
                    </div>            
                </div>
        `,
        controller: ['$scope', function nuevaCitaController($scope) {
            Pacientes.Listar();            
            $scope.cita = $scope.$parent.datoscita || {};
            $scope.listadoPacientes = [];
            $scope.listadoPacientes = Pacientes.listado;
            $scope.gridActions2 = {};
            $scope.gridCitaPacientes = {
                data: $scope.listadoPacientes,
                pagination: {
                    itemsPerPage: 5
                }
            };     
            $scope.selectItm = (event, elem) => {
                if ($(event.currentTarget).hasClass('success')) {
                    $(event.currentTarget).removeClass('success');
                    $scope.cita.idpaciente = null;
                }
                else {
                    $(event.path).find('tr.success').removeClass('success');
                    $(event.currentTarget).removeClass('success');
                    $(event.currentTarget).addClass('success');
                    $scope.cita.idpaciente = elem.item.id;
                }
            };
            $('#modalform').on('submit', () => {
                $scope.cita.horacita = $("#horacita").val();
                if (!$scope.cita.id) {
                    Citas.Guardar($scope.cita, (response) => {
                        if (response != null) {
                            $('#nuevaCita').modal('hide');
                            blockui("#listadoCita", () =>{
                                Example.show('Cita creada con exito!');
                                $scope.$parent.$state.reload();               
                            });
                        } else {
                            Example.show('Error al procesar la orden.');
                        }
                    });
                } else {
                    Citas.Actualizar($scope.cita, (response) => {
                        if (response != null) {
                            $('#nuevaCita').modal('hide');
                            bootbox.alert({
                                message: "La cita queda para el "+ response.fechacita + " a las "+ response.horacita,
                                callback: () => {
                                    blockui("#listadoCita", () =>{
                                        Example.show('Cita reprogramada con exito!');
                                        $scope.$parent.$state.reload();
                                    });
                                }
                            });                                
                        } else {
                            Example.show('Error al procesar la orden.');
                        }
                    });
                }
            });            
            $('.modal-footer button.bg-danger').on('click', (event)=>{                
                $('#nuevaCita').modal('hide');
            });
        }]
    }
}])
.directive('buscarPaciente', ['Pacientes', function(Pacientes){
    return {
        restrict: 'E', //  = Element, A = Attribute, C = Class, M = Comment
        replace: true,
        template: `
        <div>        
            <div grid-data id="buscaPaciente" grid-options="buscaPaciente" grid-actions="gridActions">
                <table class="table table-xxs table-striped table-bordered table-hover datatable-selection-single">
                    <thead>
                        <tr>
                            <th>Identificacion</th>
                            <th>Nombre</th>
                        </tr>
                        <tr>
                            <td>
                                <input type="text" class="form-control input-sm form-control-sm" ng-change="gridActions.filter()" ng-model="item.Identificacion" filter-by="Identificacion" filter-type="text">
                            </td>
                            <td>
                                <input type="text" class="form-control input-sm form-control-sm" ng-change="gridActions.filter()" ng-model="item.Nombre" filter-by="Nombre" filter-type="text">
                            </td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr grid-item ng-click="selectItm($event, this)" class="odd">
                            <td ng-bind="item.Identificacion"> </td>
                            <td ng-bind="item.Nombre"> </td>
                        </tr>
                    </tbody>
                </table>
                <div class="col-md-12 text-center" ng-hide="filtered.length">
                    SIN REGISTROS
                </div><br>
                <paginacion-element></paginacion-element><br>
            </div>            
        </div>`,
        controller: ['$scope', function buscarPacienteController($scope) {
            Pacientes.Listar();            
            $scope.buscaPacientes = [];
            $scope.buscaPacientes = Pacientes.listado;
            $scope.gridActions = {};
            $scope.buscaPaciente = {
                data: $scope.buscaPacientes,
                pagination: {
                    itemsPerPage: 5
                }
            };     
            $scope.selectItm = (event, elem) => {
                if ($(event.currentTarget).hasClass('success')) {
                    $(event.currentTarget).removeClass('success');
                    $scope.cita.idpaciente = null;
                }
                else {
                    $(event.path).find('tr.success').removeClass('success');
                    $(event.currentTarget).removeClass('success');
                    $(event.currentTarget).addClass('success');
                    
                    $('#buscarPaciente').data('paciente', elem.item);
                    $('#buscarPaciente').modal('hide');
                }
            };
        }],
        link: function($scope, iElm, iAttrs, controller) {
            
        }
    };
}])
.directive('paginacionElement', [function () {
    return {
        restrict: 'E',
        replace: true,
        template: `<div class="col-md-12 text-right">
                    <form class="form-inline pull-right margin-bottom-basic" ng-model="paginationOptions.itemsPerPage"> 
                        <div class="form-group"> 
                            <grid-pagination max-size="5" boundary-links="true" 
                                class="pagination-sm" 
                                total-items="paginationOptions.totalItems" 
                                ng-model="paginationOptions.currentPage" 
                                ng-change="reloadGrid()" 
                                items-per-page="paginationOptions.itemsPerPage">
                            </grid-pagination> 
                        </div> 
                    </form>
                <div>`,

        link: function (scope, iElement, iAttrs) {
        }
    };
}])
.directive("compareTo", function() {
    return {
        require: "ngModel",
        scope: {
            confirmPassword: "=compareTo"
        },
        link: function(scope, element, attributes, modelVal) {
            modelVal.$validators.compareTo = function(val) {
                return val == scope.confirmPassword;
            };
            scope.$watch("confirmPassword", function() {
                modelVal.$validate();
            });
        }
    };
})