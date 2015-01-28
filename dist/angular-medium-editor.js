'use strict';

angular.module('angular-medium-editor', [])

  .directive('mediumEditor', function() {

    return {
      require: ['ngModel', 'mediumEditor'],
      restrict: 'AE',
      scope: { bindOptions: '=' },
      controller: function() {},
      link: function(scope, iElement, iAttrs, ctrl) {

        angular.element(iElement).addClass('angular-medium-editor');

        ctrl[1].editor = new MediumEditor(iElement, opts);

        // Parse options
        var opts = {},
            placeholder = '';
        var prepOpts = function() {
          if (iAttrs.options) {
            opts = scope.$eval(iAttrs.options);
          }
          var bindOpts = {};
          if (scope.bindOptions !== undefined) {
            bindOpts = scope.bindOptions;
          }
          opts = angular.extend(opts, bindOpts);
        };
        prepOpts();
        placeholder = opts.placeholder;
        scope.$watch('bindOptions', function() {
          // in case options are provided after mediumEditor directive has been compiled and linked (and after $render function executed)
          // we need to re-initialize
          if (ctrl[1].editor) {
            ctrl[1].editor.deactivate();
          }
          prepOpts();
          // Hide placeholder when the model is not empty
          if (!ctrl[0].$isEmpty(ctrl[0].$viewValue)) {
            opts.placeholder = '';
          }
          ctrl[1].editor = new MediumEditor(iElement, opts);
        });

        var onChange = function() {

          scope.$apply(function() {

            // If user cleared the whole text, we have to reset the editor because MediumEditor
            // lacks an API method to alter placeholder after initialization
            if (iElement.html() === '<p><br></p>' || iElement.html() === '') {
              opts.placeholder = placeholder;
              ctrl[1].editor = new MediumEditor(iElement, opts);
            }

            ctrl[0].$setViewValue(iElement.html());
          });
        };

        // view -> model
        iElement.on('blur', onChange);
        iElement.on('input', onChange);

        // model -> view
        ctrl[0].$render = function() {

          if (!ctrl[1].editor) {
            // Hide placeholder when the model is not empty
            if (!ctrl[0].$isEmpty(ctrl[0].$viewValue)) {
              opts.placeholder = '';
            }

            ctrl[1].editor = new MediumEditor(iElement, opts);
          }

          iElement.html(ctrl[0].$isEmpty(ctrl[0].$viewValue) ? '' : ctrl[0].$viewValue);

          // hide placeholder when view is not empty
          if(!ctrl[0].$isEmpty(ctrl[0].$viewValue)) angular.element(iElement).removeClass('medium-editor-placeholder');
        };

      }
    };

  });
