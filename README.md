# AngularGames

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 8.3.18.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

resizable workspace原理：定义一个空div，areaBlockly,并且让其占满你希望blackly占据的区域，然后监听窗口resize事件，将blackly的大小覆盖到areaBlockly之上。
ngx-blockly默认是position:absolute;height:100%;width:100%;可以通过获取其封装的组件，动态改变其样式.

shadow block:占位符块
xml直接转为代码
自定义block
自定义field
block factory tab && block云存储
block library
语言
实时看到对应的代码
可视化新增toolbar和block（包括自定义的block）
theme配置
https://scratch.mit.edu/ ---- 基于blockly做的

value input :连接到output connection of a value block;
statement input: 连接到previous connection of a statement block
Dummy input: don't have a block collection

Fields:
field_input
field_dropdown
field_checkbox
field_colour
field_number
field_angle
field_variable
field_date
field_label
field_image.
Inputs:
input_value
input_statement
input_dummy

alt字段，如果blockly无法识别该对象的type,则使用该alt对象代替其位置
inputsInline: false, // 控制输入是否是内联
helpUrl: 鼠标右键出现的弹窗，点帮助访问的URL


blockly提供了九种常用颜色变亮
'%{BKY_LOGIC_HUE}'
'%{BKY_LOOPS_HUE}'
'%{BKY_MATH_HUE}'
'%{BKY_TEXTS_HUE}'
'%{BKY_LISTS_HUE}'
'%{BKY_COLOUR_HUE}'
'%{BKY_VARIABLES_HUE}'
'%{BKY_VARIABLES_DYNAMIC_HUE}'
'%{BKY_PROCEDURES_HUE}'
