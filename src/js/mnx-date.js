(function (angular) {
  'use strict';
  var ns = 'mnx-date';
  
  function renderCalendar(year, month, fow, sel, filter) {
    var d = new Date(year, month, -fow), f, s, m = ['<tbody>'], wi, di;
    d = new Date(year, month, -d.getDay());
    s = filter('date')(sel, 'yyyy-MM-dd');
    for (wi = 0; wi < 6; wi += 1) {
      m.push('<tr>');
      for (di = 0; di < 7; di += 1) {
        f = filter('date')(d, 'yyyy-MM-dd');
        m.push(
          '<td data-date="', f,
          '" title="', filter('date')(d, 'fullDate'),
          '" class="', ns, '-cal-day', d.getMonth() != month ? '-alt' : (f === s ? '-sel' : ''),
          '">', d.getDate(), '</td>');
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
          refDate = (ctrl.$modelValue && new Date(ctrl.$modelValue)) || new Date(),
          dateFormats = $locale.DATETIME_FORMATS,
          // date settings
          format = attrs.mnxFormat || dateFormats.shortDate,
          firstDay = attrs.mnxFirstday || 0,
          order = dateFormats.shortDate.replace(/[^dmy]*([dmy])+[^dmy]*/gi, '$1').toLocaleLowerCase(),
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
        
        format.replace(/^([yMd]+)([^yMd]*)([yMd]+)([^yMd]*)([yMd]+)$/, function (m, p1, p2, p3, p4, p5) {
          format = {
            str: m,
            yPos: /y+/.test(p1) ? 1 : (/y+/.test(p3) ? 2 : 3),
            mPos: /M+/.test(p1) ? 1 : (/M+/.test(p3) ? 2 : 3),
            dPos: /d+/.test(p1) ? 1 : (/d+/.test(p3) ? 2 : 3),
            regx: new RegExp([
              '(\\d{' + p1.length + '})', p2,
              '(\\d{' + p3.length + '})', p4,
              '(\\d{' + p5.length + '})'
            ].join(''))
          };
          return;
        });
        
        function inputUpdate(event) {
          if (event) {
            event.stopPropagation();
            event.preventDefault();
            refDate.setMonth(refDate.getMonth() + +angular.element(event.srcElement).attr('data-dir'));
          }
          btnMode.text(dateFormats.MONTH[refDate.getMonth()] + ' ' + refDate.getFullYear());
          calDays.html(renderCalendar(refDate.getFullYear(), refDate.getMonth(), firstDay, ctrl.$modelValue, $filter));
        }
        
        function pickerUpdate(event) {
            event.stopPropagation();
            event.preventDefault();
            refDate = new Date(angular.element(event.srcElement).attr('data-date'));
            ctrl.$setViewValue($filter('date')(refDate, format.str));
            ctrl.$render();
          }
        
        ctrl.$parsers.push(function (value) {
          var d;
          if (d = format.regx.exec(value)) {
            ctrl.$modelValue = new Date(+d[format.yPos], +d[format.mPos]-1, +d[format.dPos]);
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
            value = $filter('date')(value, format.str);
          }
          return value;
        });
        ctrl.$validators.date = function (modelValue) {
          return angular.isDate(modelValue);
        };
        ctrl.$validators.min = function (modelValue) {
          if (attrs.mnxMin) {
            return scope.$eval(attrs.mnxMin) <= modelValue;
          }
          return true;
        };
        ctrl.$validators.max = function (modelValue) {
          if (attrs.mnxMax) {
            return scope.$eval(attrs.mnxMax) >= modelValue;
          }
          return true;
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
