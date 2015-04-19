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
        if (d >= min && d <= max) {
          m.push(
            '<td data-date="', f,
            '" title="', filter('date')(d, 'fullDate'),
            '" class="', ns, '-cal-day', d.getMonth() != month ? '-alt' : (f === s ? '-sel' : ''),
            '">', d.getDate(), '</td>');
        } else {
          m.push('<td></td>');
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
          var dir;
          if (event) {
            dir = +angular.element(event.srcElement).attr('data-dir');
            event.stopPropagation();
            event.preventDefault();
            if (minDate && refDate.getMonth() + dir < minDate.getMonth() ||
                maxDate && refDate.getMonth() + dir > maxDate.getMonth()) return;
            refDate.setMonth(refDate.getMonth() + dir);
          }
          btnMode.text(dateFormats.MONTH[refDate.getMonth()] + ' ' + refDate.getFullYear());
          calDays.html(renderCalendar(refDate.getFullYear(), refDate.getMonth(), firstDay, ctrl.$modelValue, minDate, maxDate, $filter));
          btnPrev.css({ opacity: minDate && refDate.getMonth() - 1 < minDate.getMonth() ? 0 : 1 });
          btnNext.css({ opacity: maxDate && refDate.getMonth() + 1 > maxDate.getMonth() ? 0 : 1 });
        }
        
        function pickerUpdate(event) {
            var clickDate = angular.element(event.srcElement).attr('data-date');
            event.stopPropagation();
            event.preventDefault();
            if (clickDate) {
              refDate = new Date(clickDate);
              ctrl.$setViewValue($filter('date')(refDate, format));
              ctrl.$render();
            }
          }
        
        ctrl.$parsers.push(function (value) {
          var d = value.match(/(\d+)/g);
          if (d && d.length === 3) {
            ctrl.$modelValue = new Date(
              +d[order.indexOf('y')],
              +d[order.indexOf('m')] - 1,
              +d[order.indexOf('d')]
            );
            refDate = new Date(ctrl.$modelValue);
            inputUpdate();
            return new Date(ctrl.$modelValue);
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
          return angular.isDate(modelValue);
        };
        ctrl.$validators.min = function (modelValue) {
          return !minDate || modelValue >= minDate;
        };
        ctrl.$validators.max = function (modelValue) {
          return !maxDate || modelValue <= maxDate;
        };
        
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
          refDate = (ctrl.$modelValue && new Date(ctrl.$modelValue)) || new Date();
          refDate.setHours(0, 0, 0, 0);
          minDate = scope.$eval(attrs.mnxMin);
          minDate.setHours(0, 0, 0, 0);
          maxDate = scope.$eval(attrs.mnxMax);
          maxDate.setHours(0, 0, 0, 0);
          inputUpdate();
          element.on('blur', function blur() {
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
