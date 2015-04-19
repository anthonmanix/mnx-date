# mnx-date

AngularJS date picker directive

### Features

+ Angular i18n support
+ Dynamic minimum and maximum date limits

### Setup

Include required libraries

``` html
<link rel="stylesheet" href="mnx-date.css">

<script src="angular.js"></script>
<script src="mnx-date.js"></script>
```

Inject the `mnxDate` module

``` js
angular.module('app', ['mnxDate']);
```

### Usage

Add `mnx-date` attribute to an input element

``` html
<input
  ng-model=""
  mnx-date
 [mnx-format=""]
 [mnx-firstday=""]
 [mnx-min=""]
 [mnx-max=""]>
```

#### `mnx-format`
*Optional*

Sets the format of the date.
Accepts a string value that represents the format. Example: `d.M.y`.
Defaults to the `shortDate` format from the `$locale` service.

#### `mnx-firstday`
*Optional*

Sets the first day of the week.
Accepts a number value that represents the weekday: `0 - sunday, 1 - monday, ...`.

#### `mnx-min`
*Optional*

Sets the minimum allowed date.
Accepts a binding to a Date object.

#### `mnx-max`
*Optional*

Sets the maximum allowed date.
Accepts a binding to a Date object.

### License

The MIT License (MIT)

Copyright (c) 2015 Aljoša Žagar

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
