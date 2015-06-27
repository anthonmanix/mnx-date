(function (angular) {
  'use strict';
  var ns = 'mnx-date';

  function renderCalendar(year, month, fow, sel, min, max, filter) {
    var d = new Date(year, month, -fow), f, s, m = ['<tbody>'], wi, di;
    d = new Date(year, month, -d.getDay());
    s = filter('date')(sel, 'yyyy-MM-dd');
    for (wi = 0; wi < 6; wi += 1) {
      m.push('<tr>');
      for (di = 0; di < 7; di += 1) {
        f = filter('date')(d, 'yyyy-MM-dd');
        if ((!min || d >= min) && (!max || d <= max)) {
          m.push(
            '<td data-date="', f,
            '" title="', filter('date')(d, 'fullDate'),
            '" class="', ns, '-cal-day', d.getMonth() != month ? '-alt' : (f === s ? '-sel' : ''),
            '">', d.getDate(), '</td>');
        } else {
          m.push('<td disabled></td>');
        }
        d.setDate(d.getDate() + 1);
      }
      m.push('</tr>');
    }
    m.push('</tbody>');
    return m.join('');
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
          cal = angular.element([
            '<table class="' + ns + '-calendar">',
              '<thead><tr>',
                '<th title="', dayNames[0], '">', dayNames[0][0], '</th>',
                '<th title="', dayNames[1], '">', dayNames[1][0], '</th>',
                '<th title="', dayNames[2], '">', dayNames[2][0], '</th>',
                '<th title="', dayNames[3], '">', dayNames[3][0], '</th>',
                '<th title="', dayNames[4], '">', dayNames[4][0], '</th>',
                '<th title="', dayNames[5], '">', dayNames[5][0], '</th>',
                '<th title="', dayNames[6], '">', dayNames[6][0], '</th>',
              '</tr></thead>',
            '</table>'
          ].join('')),
          calDays = angular.element('<tbody></tbody>');

        function inputUpdate(event) {
          var dir, target;
          if (event) {
            target = event.target || event.srcElement;
            dir = +angular.element(target).attr('data-dir');
            event.stopPropagation();
            event.preventDefault();
            if (minDate && refDate.getMonth() + dir < minDate.getMonth() ||
                maxDate && refDate.getMonth() + dir > maxDate.getMonth()) return;
            refDate.setMonth(refDate.getMonth() + dir);
          }
          btnMode.text(dateFormats.MONTH[refDate.getMonth()] + ' ' + refDate.getFullYear());
          calDays.html(renderCalendar(refDate.getFullYear(), refDate.getMonth(), firstDay, ctrl.$modelValue, minDate, maxDate, $filter));
          btnPrev.removeAttr('disabled');
          if (minDate && refDate.getMonth() - 1 < minDate.getMonth()) {
            btnPrev.attr('disabled', true);
          }
          btnNext.removeAttr('disabled');
          if (maxDate && refDate.getMonth() + 1 > maxDate.getMonth()) {
            btnNext.attr('disabled', true);
          }
        }

        function pickerUpdate(event) {
          var target = event.target || event.srcElement;
          var clickDate = angular.element(target).attr('data-date');
          event.stopPropagation();
          event.preventDefault();
          if (clickDate) {
            refDate = new Date(clickDate);
            ctrl.$setViewValue($filter('date')(refDate, format));
            ctrl.$render();
          }
        }

        function keypress(event) {
          if (/[^\d\.\-\/]/g.test(String.fromCharCode(event.which || event.keyCode))) {
            event.preventDefault();
          }
        }

        if (attrs.mnxMin) {
          scope.$watch(attrs.mnxMin, function (value) {
            if (value) {
              minDate = new Date(value);
              minDate.setHours(0, 0, 0, 0);
              ctrl.$validators.min = function (modelValue) {
                return !minDate || modelValue >= minDate;
              };
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
              ctrl.$setViewValue($filter('date')(refDate, format));
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
