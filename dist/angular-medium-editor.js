'use strict';

angular.module('angular-medium-editor', [])

  .directive('mediumEditor', function() {

    return {
      template: "<div class='mediumContent'></div><div ng-transclude></div>",
      require: ['ngModel', 'mediumEditor'],
      restrict: 'AE',
      scope: { bindOptions: '=' },
      transclude: true,
      controller: function() {
      },
      link: function(scope, iElement, iAttrs, ctrl) {

        var contentElement = iElement.children('.mediumContent')

        ctrl[1].editorElement = contentElement

        angular.element(contentElement).addClass('angular-medium-editor');

        ctrl[1].editor = new MediumEditor(contentElement, opts);

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
          ctrl[1].editor = new MediumEditor(contentElement, opts);
        });

        var onChange = function() {

          scope.$apply(function() {

            // If user cleared the whole text, we have to reset the editor because MediumEditor
            // lacks an API method to alter placeholder after initialization
            if (contentElement.html() === '<p><br></p>' || contentElement.html() === '') {
              opts.placeholder = placeholder;
              ctrl[1].editor = new MediumEditor(contentElement, opts);
            }

            ctrl[0].$setViewValue(ctrl[1].editor.serialize()['element-0'].value);
          });
        };

        // view -> model
        contentElement.on('blur', onChange);
        contentElement.on('input', onChange);

        // model -> view
        ctrl[0].$render = function() {

          if (!ctrl[1].editor) {
            // Hide placeholder when the model is not empty
            if (!ctrl[0].$isEmpty(ctrl[0].$viewValue)) {
              opts.placeholder = '';
            }

            ctrl[1].editor = new MediumEditor(contentElement, opts);
          }

          contentElement.html(ctrl[0].$isEmpty(ctrl[0].$viewValue) ? '' : ctrl[0].$viewValue);

          // hide placeholder when view is not empty
          if(!ctrl[0].$isEmpty(ctrl[0].$viewValue)) angular.element(contentElement).removeClass('medium-editor-placeholder');
        };

      }
    };

  });
