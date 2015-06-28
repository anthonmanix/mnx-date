(function (angular) {
  'use strict';
  var ns = 'mnx-date';

  function renderWeekdays(dayNames) {
    var w = '', i;
    for (i = 0; i < 7; i += 1) { w += '<th title="' + dayNames[i] + '">' + dayNames[i][0] + '</th>'; }
    return '<table class="' + ns + '-calendar"><thead><tr>' + w  + '</tr></thead></table>';
  }

  function renderCalendar(year, month, fow, sel, min, max, filter) {
    var
      d = new Date(year, month, -(new Date(year, month, -fow)).getDay()),
      s = (new Date(sel)).setHours(0, 0, 0, 0), m = '', i;
    for (i = 0; i < 42; i += 1) {
      if (i && i % 7 === 0) { m += '</tr><tr>'; }
      m += '<td title="' + filter('date')(d, 'fullDate') + '" class="';
      if (d.getMonth() !== month) { m += ns + '-alt '; }
      if (+d === s) { m += ns + '-sel'; }
      if ((min && d < min) || (max && d > max)) {
        m += '" disabled>';
      } else {
        m += '" data-date="' + (+d) + '">';
      }
      m += d.getDate() + '</td>';
      d.setDate(d.getDate() + 1);
    }
    return '<tbody><tr>' + m + '</tr></tbody>';
  }

  function MnxDate($filter, $locale) {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function link(scope, element, attrs, ctrl) {
        var
          refDate, minDate, maxDate,
          dateFormats = $locale.DATETIME_FORMATS,
          // date settings
          format = attrs.mnxFormat || dateFormats.shortDate,
          firstDay = attrs.mnxFirstday || 0,
          order = format.replace(/[^dmy]*([dmy])+[^dmy]*/gi, '$1').toLocaleLowerCase(),
          dayNames = dateFormats.DAY.slice(firstDay, 7).concat(dateFormats.DAY.slice(0, firstDay)),
          // DOM elemnts
          container = angular.element('<div class="' + ns + '-container"></div>'),
          head = angular.element('<div class="' + ns + '-head"></div>'),
          btnMode = angular.element('<div class="' + ns + '-btn-mode"></div>'),
          btnPrev = angular.element('<div class="' + ns + '-btn-prev" data-dir="-1">&lt;</div>'),
          btnNext = angular.element('<div class="' + ns + '-btn-next" data-dir="1">&gt;</div>'),
          cal = angular.element(renderWeekdays(dayNames)),
          calDays = angular.element('<tbody></tbody>');

        function inputUpdate(event) {
          var month = refDate.getMonth();
          if (event) {
            event.stopPropagation();
            event.preventDefault();
            refDate.setMonth(month + (+angular.element(event.target || event.srcElement).attr('data-dir')));
            month = refDate.getMonth();
          }
          btnMode.text(dateFormats.MONTH[month] + ' ' + refDate.getFullYear());
          calDays.html(renderCalendar(refDate.getFullYear(), month, firstDay, ctrl.$modelValue, minDate, maxDate, $filter));
        }

        function pickerUpdate(event) {
          var
            target = event.target || event.srcElement,
            clickDate = angular.element(target).attr('data-date');
          event.stopPropagation();
          event.preventDefault();
          if (clickDate) {
            refDate = new Date(+clickDate);
            ctrl.$setViewValue($filter('date')(refDate, format));
            ctrl.$render();
          }
        }

        function keypress(event) {
          var charCode = angular.isNumber(event.which) ? event.which :
                        (angular.isNumber(event.keyCode) ? event.keyCode : 0);
          if (charCode < 28 || event.altKey || event.ctrlKey ||
              /[\d\b\.\-\/]/.test(String.fromCharCode(charCode))) { return; }
          event.preventDefault();
        }

        if (attrs.mnxMin) {
          scope.$watch(attrs.mnxMin, function (value) {
            if (value) {
              minDate = new Date(value);
              minDate.setHours(0, 0, 0, 0);
              ctrl.$validators.min = function (modelValue) {
                return !minDate || modelValue >= minDate;
              };
              ctrl.$validate();
            } else {
              minDate = null;
              delete ctrl.$validators.min;
            }
          });
        }
        if (attrs.mnxMax) {
          scope.$watch(attrs.mnxMax, function (value) {
            if (value) {
              maxDate = new Date(value);
              maxDate.setHours(0, 0, 0, 0);
              ctrl.$validators.max = function (modelValue) {
                return !maxDate || modelValue <= maxDate;
              };
              ctrl.$validate();
            } else {
              maxDate = null;
              delete ctrl.$validators.max;
            }
          });
        }

        ctrl.$parsers.push(function (value) {
          var parts = value.match(/(\d+)/g), y, m, d, date;
          if (parts && parts.length === 3) {
            y = +parts[order.indexOf('y')];
            m = +parts[order.indexOf('m')] - 1;
            d = +parts[order.indexOf('d')];
            date = new Date(y, m, d);
            if (y === date.getFullYear() && m === date.getMonth() && d === date.getDate()) {
              ctrl.$modelValue = date;
              refDate = new Date(ctrl.$modelValue);
              inputUpdate();
              return new Date(ctrl.$modelValue);
            }
          }
          return value;
        });
        ctrl.$formatters.push(function (value) {
          if (angular.isDate(value)) {
            refDate = new Date(value);
            inputUpdate();
            value = $filter('date')(value, format);
          }
          return value;
        });
        ctrl.$validators.date = function (modelValue) {
          if (modelValue) {
            return angular.isDate(modelValue);
          } else {
            return true;
          }
        };

        element.attr('placeholder', format);
        container
          .append(head.append(btnMode).append(btnPrev).append(btnNext))
          .append(cal.append(calDays));
        element.on('focus', function focus() {
          container.css({
            top: element[0].offsetTop + element[0].offsetHeight + 'px',
            left: element[0].offsetLeft + 'px'
          });
          element.after(container);
          btnPrev.on('mousedown', inputUpdate);
          btnNext.on('mousedown', inputUpdate);
          calDays.on('mousedown', pickerUpdate);
          element.on('keypress', keypress);
          refDate = (ctrl.$modelValue && new Date(ctrl.$modelValue)) || new Date();
          refDate.setHours(0, 0, 0, 0);
          inputUpdate();
          element.on('blur', function blur() {
            if (ctrl.$modelValue && ctrl.$valid) {
              ctrl.$setViewValue($filter('date')(ctrl.$modelValue, format));
              ctrl.$render();
            }
            element.off('keypress', keypress);
            element.off('blur', blur);
            container.remove();
          });
        });
      }
    };
  }
  MnxDate.$inject = ['$filter', '$locale'];

  angular.module('mnxDate', []).directive('mnxDate', MnxDate);
}(window.angular));
