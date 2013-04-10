/*global $: false, define: false, model: false */

// Bar graph controller.
// It provides specific interface used in MD2D environment
// (by interactives-controller and layout module).
define(function (require) {
  var BarGraphModel = require('grapher/bar-graph/bar-graph-model'),
      BarGraphView  = require('grapher/bar-graph/bar-graph-view'),
      metadata      = require('common/controllers/interactive-metadata'),
      validator     = require('common/validator'),

      // Note: We always explicitly copy properties from component spec to bar graph options hash,
      // in order to avoid tighly coupling an externally-exposed API (the component spec) to an
      // internal implementation detail (the bar graph options format).
      barGraphOptionForComponentSpecProperty = {
        // Min value displayed.
        min:  'min',
        // Max value displayed.
        max:  'max',
        // Graph title.
        title:     'title',
        // Color of the main bar.
        barColor:  'barColor',
        // Color of the area behind the bar.
        fillColor: 'fillColor',
        // Number of labels displayed on the left side of the graph.
        // This value is *only* a suggestion. The most clean
        // and human-readable values are used.
        // You can also specify value-label pairs, e.g.:
        // [
        //   {
        //     "value": 0,
        //     "label": "low"
        //   },
        //   {
        //     "value": 10,
        //     "label": "high"
        //   }
        // ]
        // Use 0 or null to disable labels completely.
        labels:      'labels',
        // Number of grid lines displayed on the bar.
        // This value is *only* a suggestion, it's similar to 'ticks'.
        gridLines:  'gridLines',
        // Format of labels.
        // See the specification of this format:
        // https://github.com/mbostock/d3/wiki/Formatting#wiki-d3_format
        // or:
        // http://docs.python.org/release/3.1.3/library/string.html#formatspec
        labelFormat: 'labelFormat'
      },

      // Limit options only to these supported.
      filterOptions = function(inputHash) {
        var options = {},
            cName, gName;

        for (cName in barGraphOptionForComponentSpecProperty) {
          if (barGraphOptionForComponentSpecProperty.hasOwnProperty(cName)) {
            gName = barGraphOptionForComponentSpecProperty[cName];
            if (inputHash[cName] !== undefined) {
              options[gName] = inputHash[cName];
            }
          }
        }
        return options;
      };

  return function BarGraphController(component) {
    var // Object with Public API.
        controller,
        // Model with options and current value.
        barGraphModel,
        // Main view.
        barGraphView,
        // First data channel.
        property,
        // Second data channel.
        secondProperty,

        update = function () {
          barGraphModel.set({value: model.get(property)});
        },
        updateSecondProperty = function () {
          barGraphModel.set({secondValue: model.get(secondProperty)});
        };

    //
    // Initialization.
    //
    // Validate component definition, use validated copy of the properties.
    component = validator.validateCompleteness(metadata.barGraph, component);
    barGraphModel = new BarGraphModel(filterOptions(component));
    barGraphView  = new BarGraphView({model: barGraphModel, id: component.id});
    // Each interactive component has to have class "component".
    barGraphView.$el.addClass("component");
    property = component.property;
    secondProperty = component.secondProperty;

    controller = {
      // This callback should be trigger when model is loaded.
      modelLoadedCallback: function () {
        model.addPropertiesListener([property], update);
        if (typeof component.averagePeriod !== 'undefined' && component.averagePeriod !== null) {
          // This option is for authors convenience. It causes that filtered
          // output is automatically defined (it uses basic property as an
          // input). Author doesn't have to define it manually.
          secondProperty = property + "-bargraph-" + component.id + "-average";
          model.defineFilteredOutput(secondProperty, {}, property, "RunningAverage", component.averagePeriod);
        }
        if (secondProperty) {
          model.addPropertiesListener([secondProperty], updateSecondProperty);
        }
        // Apply custom width and height settings.
        // Do it in modelLoadedCallback, as during its execution,
        // the view container is already added to the document and
        // calculations of the size work correctly.
        barGraphModel.set({
          barWidth: component.barWidth,
          height: component.height
        });
        // Initial render...
        barGraphView.render();
        // and update.
        update();
      },

      // Returns view container (div).
      getViewContainer: function () {
        return barGraphView.$el;
      },

      // Method required by layout module.
      resize: function () {
        // Just render bar graph again.
        barGraphView.render();
      },

      // Returns serialized component definition.
      serialize: function () {
        var result = $.extend(true, {}, component);
        // Return updated definition.
        return result;
      }
    };

    // Return Public API object.
    return controller;
  };
});
