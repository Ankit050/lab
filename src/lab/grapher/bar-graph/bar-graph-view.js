/*global define, d3 */

define(function (require) {
  // Dependencies.
  var Backbone = require('backbone'),

      VIEW = {
        padding: {
          left:   10,
          top:    10,
          right:  10,
          bottom: 10
        }
      },

      // Tested empirically that works pretty well.
      getFontSize = function(height) {
        return 7 + height / 60;
      },

      BarGraphView = Backbone.View.extend({
        // Container is a DIV.
        tagName: "div",

        className: "bar-graph",

        initialize: function () {
          // Create all variables.
          // Avoid recreation of SVG elements while rendering.
          this.vis = d3.select(this.el).append("svg");
          this.bar = this.vis.append("rect");
          this.title = this.vis.append("text");
          this.axisContainer = this.vis.append("g");

          this.yScale = d3.scale.linear();
          this.heightScale = d3.scale.linear();
          this.yAxis = d3.svg.axis();

          // Register callbacks!
          this.model.on("change", this.modelChanged, this);
        },

        render: function () {
              // toJSON() returns all attributes of the model.
              // This is equivalent to many calls like:
              // property1 = model.get("property1");
              // property2 = model.get("property2");
              // etc.
          var options    = this.model.toJSON(),
              fontSize   = getFontSize(options.height),
              rightShift = VIEW.padding.right;

          // Setup SVG element.
          this.vis
            .attr({
              width:  options.width,
              height: options.height
            })
            .style({
              "font-size": fontSize + "px"
            });

          // Setup Y scale.
          this.yScale
            .domain([options.minValue, options.maxValue])
            .range([options.height - VIEW.padding.top, VIEW.padding.bottom]);

          // Setup scale used to translation of the bar height.
          this.heightScale
            .domain([options.minValue, options.maxValue])
            .range([0, options.height - VIEW.padding.top - VIEW.padding.bottom]);

          // Setup Y axis.
          this.yAxis
            .scale(this.yScale)
            .ticks(options.ticks)
            .orient("right");

          // Add title.
          if (options.title !== undefined) {
            rightShift += fontSize;
            this.title
              .text( options.title)
              .attr("transform", "translate(" + (options.width - rightShift) + ", " + options.height / 2 + ") rotate(90)")
              .style({
                "font-size": "150%",
                "text-anchor": "middle",
                "fill": options.textColor
              });
          }

          // Append Y axis.
          rightShift += 3 * fontSize;
          this.axisContainer
            .attr("transform", "translate(" + (options.width - rightShift) + ", 0)")
            .call(this.yAxis);

          // Style Y axis.
          this.axisContainer
            .style("fill", options.textColor);

          // Setup bar.
          rightShift += 5;
          this.bar
            .attr({
              width: (options.width - VIEW.padding.left - rightShift),
              x: VIEW.padding.left
            })
            .style({
              fill: options.barColor
            });

          // Finally, update bar.
          this.updateBar();
        },

        // Updates only bar height.
        updateBar: function () {
          var value = this.model.get("value");
          this.bar
            .attr("height", this.heightScale(value))
            .attr("y", this.yScale(value));
        },

        getParentHeight: function () {
          return this.$el.parent().height();
        },

        getParentWidth: function () {
          return this.$el.parent().width();
        },

        // Function called whenever model attribute is changed.
        modelChanged: function () {
          var changedAttributes = this.model.changedAttributes(),
              changedAttrsCount = 0,
              name;

          // There are two possible cases.
          // Only "value" has changed, so update only bar height.
          // Other attributes have changed, so redraw whole bar graph.

          // Case 1. Check how many attributes have been changed.
          for (name in changedAttributes) {
            if (changedAttributes.hasOwnProperty()) {
              changedAttrsCount++;
              if (changedAttrsCount > 1) {
                // If 2 or more, redraw whole bar graph.
                this.render();
                return;
              }
            }
          }

          // Case 2. Only one attribute has changed, check if it's "value".
          if (changedAttributes.value) {
            this.updateBar();
          } else {
            this.render();
          }
        }
      });

  return BarGraphView;
});
