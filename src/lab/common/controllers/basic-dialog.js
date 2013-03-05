/*global define, $ */

define(function () {

  var defOptions = {
    autoOpen: false,
    dialogClass: "interactive-dialog",
    // Ensure that font is being scaled dynamically!
    appendTo: "#responsive-content",
    width: "80%"
  };

  /**
   * Simple wrapper around the jQuery UI Dialog,
   * which provides useful defaults and simple interface.
   *
   * @constructor
   * @param {Object} options jQuery UI Dialog options.
   */
  function BasicDialog(options) {
    /**
     * Basic dialog elements.
     * @type {jQuery}
     */
    this.$element = $('<div>');
    // Create jQuery UI Dialog.
    this.$element.dialog($.extend({}, defOptions, options));
  }

  /**
   * Opens the dialog.
   */
  BasicDialog.prototype.open = function() {
    this.$element.dialog("open");
  };

  /**
   * Sets jQuery UI Dialog option.
   *
   * @param {string} key
   * @param {Object} value
   */
  BasicDialog.prototype.set = function(key, value) {
    this.$element.dialog("option", key, value);
  };

  /**
   * Sets content of the dialog.
   *
   * @param {jQuery|DOM|string} $content Any value that can be accepted by the jQuery constructor.
   */
  BasicDialog.prototype.setContent = function ($content) {
    this.$element.empty();
    // Not very pretty, but probably the simplest and most reliable way to
    // disable autofocus in jQuery UI dialogs. See:
    // http://jqueryui.com/upgrade-guide/1.10/#added-ability-to-specify-which-element-to-focus-on-open
    this.$element.append('<input type="hidden" autofocus="autofocus" />');
    this.$element.append($content);
  };

  return BasicDialog;
});
