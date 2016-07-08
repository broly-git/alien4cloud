/**
* Main controller for topology edition.
* It loads topology and manage common server communication and topology refresh through common parent scope.
*/
define(function (require) {
  'use strict';

  var modules = require('modules');
  var _ = require('lodash');
  var angular = require('angular');

  require('scripts/topology/controllers/editor_browser');
  require('scripts/topology/controllers/editor_workflow');

  require('scripts/tosca/services/tosca_cardinalities_service');
  require('scripts/topology/services/topology_json_processor');
  require('scripts/topology/services/topology_services');
  require('scripts/topology/controllers/topology_editor_versions');

  // manage websockets for topology editor
  require('scripts/topology/services/topology_editor_events_services');

  modules.get('a4c-topology-editor', ['a4c-common', 'ui.bootstrap', 'a4c-tosca', 'a4c-styles']).controller('TopologyEditorCtrl',
    ['$scope', 'menu', 'layoutService', 'appVersions', 'topologyServices', 'topologyJsonProcessor', 'toscaCardinalitiesService', 'topoEditVersions', '$alresource',// 'topologyEditorEventFactory',
    function($scope, menu, layoutService, appVersions, topologyServices, topologyJsonProcessor, toscaCardinalitiesService, topoEditVersions, $alresource) {// , topologyEditorEventFactory) {
      // register for websockets events
      // var registration = topologyEditorEventFactory($scope.topologyId, function(event) {
      //   console.log('received event', event);
      // });
      // var operation = {
      //   type: 'org.alien4cloud.tosca.editor.commands.AddNodeTemplateOperation',
      //   message: 'Hello world'
      // };
      // registration.send('/app/topology-editor/' + $scope.topologyId, operation);
      // $scope.$on('$destroy', function() {
      //   registration.close();
      // });

      // This controller acts as a specific layout for the topology edition.
      layoutService.process(menu);
      $scope.menu = menu;
      // Manage topology version selection (version is provided as parameter from the template or application)
      $scope.topologyVersions = appVersions.data;
      $scope.versionContext = {};
      $scope.released = false; // this allow to avoid file edition in the ui-ace.
      topoEditVersions($scope);

      /**
      * Add bounds information to the requirements and capabilities in the topology based on relationships.
      */
      function fillBounds(topology) {
        _.each(topology.nodeTemplates, function(nodeTemplate) {
          toscaCardinalitiesService.fillRequirementBounds($scope.topology.nodeTypes, nodeTemplate);
          toscaCardinalitiesService.fillCapabilityBounds($scope.topology.nodeTypes, $scope.topology.topology.nodeTemplates, nodeTemplate);
        });
      }

      // Version selection management is below, find here topology update handling
      /**
      * refreshTopology has to be triggered when the topology is updated.
      * Added to the scope as right now every operation returns the full and update topology.
      */
      $scope.refreshTopology = function(topologyDTO, selectedNodeTemplate, initial) {
        $scope.topology = topologyDTO;
        $scope.isTopologyTemplate = ($scope.topology.topology.delegateType === 'topologytemplate');
        // Process the topology to enrich it with some additional data
        _.each(topologyDTO.topology.nodeTemplates, function(value, key){
          value.name = key;
        });
        // enrich objects to add maps for the fields that are currently mapped as array of map entries.
        topologyJsonProcessor.process($scope.topology);
        fillBounds($scope.topology.topology);
        _.each($scope.topology.topology.inputs, function(value, key){
          value.inputId = key;
        });

        // trigger refresh event so child scope can update what they need. Initial flag allows to know if this is the initial loading of the topology.
        $scope.$broadcast('topologyRefreshedEvent', {
          initial: initial,
          selectedNodeTemplate: selectedNodeTemplate
        });
      };

      var editorResource = $alresource('rest/latest/editor/:topologyId/execute');
      $scope.execute = function(operation, successCallback, errorCallback, selectedNodeTemplate) {
        operation.previousOperationId = $scope.topology.lastOperationId;
        // execute operations, create is a post
        return editorResource.create({
          topologyId: $scope.topologyId,
        }, angular.toJson(operation), function(result) {
            if(_.undefined(result.error)) {
              $scope.refreshTopology(result.data, selectedNodeTemplate);
            }
            if(_.defined(successCallback)) {
              successCallback(result);
            }
        }, function(error) {
          if(_.defined(errorCallback)){
            errorCallback(error);
          }
          return error;
        }).$promise;
      };

      $scope.save = function() {
        console.log('saving');
      };

      $scope.undo = function() {
        console.log('undo');
      };

      $scope.redo = function() {
        console.log('redo');
      };

      // Initial load of the topology
      topologyServices.dao.get({ topologyId: $scope.topologyId },
        function(successResult) {
          $scope.refreshTopology(successResult.data, null, true);
        });
    }
  ]);
}); // define