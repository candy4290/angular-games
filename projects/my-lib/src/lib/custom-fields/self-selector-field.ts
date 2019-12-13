import { Svgs } from '../constants/src';

declare var Blockly: any;

export class SelfSelectorField {
    options = [['a', 'a'], ['b', 'b']];
    constructor() {
      Blockly.SelfSelectorField = function (menuGenerator, opt_value, opt_validator) {
        menuGenerator = menuGenerator || [];
        this.variables = {};
        menuGenerator.forEach(item => {
          this.variables[item[0]] = {
            key: item[0],
            value: item[1]
          };
        });
        opt_value = this.doClassValidation_(opt_value);
        // 检查输入是否有效
        this.doClassValidation_ = function(opt_newValue) {
          if (opt_newValue === null || opt_newValue === undefined) {
            return null;
          }
          if (!this.variables[opt_newValue]) {
            // 筛选下拉列表
            const lists = [];
            menuGenerator.forEach(item => {
              if (item[0].includes(opt_newValue)) {
                lists.push(item);
              }
            });
            if (lists.length > 0) {
              for (let i = 0, len =  this.imageElement_.children.length; i < len; i++) {
                const item = this.imageElement_.children.item(i);
                if (i === 0) {
                  item.style.display = 'none';
                  continue;
                }
                if (item && !item.innerText.includes(opt_newValue)) {
                  item.style.display = 'none';
                } else {
                  item.style.display = 'block';
                }
              }
            } else {
              // 没有搜索结果
              console.log('无搜索结果');
              for (let i = 0, len =  this.imageElement_.children.length; i < len; i++) {
                const item = this.imageElement_.children.item(i);
                if (i === 0) {
                  item.style.display = 'block';
                } else {
                  item.style.display = 'none';
                }
              }
            }
            return null;
          } else {
            if (this.imageElement_) {
              for (let i = 0, len =  this.imageElement_.children.length; i < len; i++) {
                const item = this.imageElement_.children.item(i);
                if (i === 0) {
                  item.style.display = 'none';
                  continue;
                }
                if (item && !item.innerText.includes(opt_newValue)) {
                  item.style.display = 'none';
                } else {
                  item.style.display = 'block';
                }
              }
            }
            return opt_newValue;
          }
        };
        if (opt_value === null) {
          opt_value = Blockly.SelfSelectorField.DEFAULT_VALUE || menuGenerator[0][0];
          this.selectedValue = opt_value;
        }  // Else the original value is fine.
        this.dropdownCreate_ = function() {
          this.imageElement_ = document.createElement('div');
          this.imageElement_.className = 'goog-menu goog-menu-vertical blocklyNonSelectable blocklyDropdownMenu';
          const noSeacher = document.createElement('div');
          noSeacher.style.width = '100px';
          const img = document.createElement('img');
          img.src =  Svgs.emptyImg;
          img.style.height = '35px';
          img.style.display = 'block';
          img.style.margin = '0 auto';
          noSeacher.appendChild(img);
          const text = document.createElement('div');
          text.innerText = '暂无数据';
          text.style.textAlign = 'center';
          text.style.fontSize = '14px';
          text.style.color = 'rgba(0,0,0,.25)';
          noSeacher.appendChild(text);
          noSeacher.style.display = 'none';
          this.imageElement_.appendChild(noSeacher);
          menuGenerator.forEach(item => {
            const div = document.createElement('div');
            div.className = 'goog-menuitem goog-option';
            if (this.selectedValue === item[0]) {
              div.className += ' goog-option-selected';
            }
            const innerDiv = document.createElement('div');
            innerDiv.className = 'goog-menuitem-content';
            innerDiv.innerText = item[0];
            innerDiv.title = item[1];
            const checkbox = document.createElement('div');
            checkbox.className = 'goog-menuitem-checkbox';
            innerDiv.appendChild(checkbox);
            div.appendChild(innerDiv);
            this.imageElement_.appendChild(div);
          });
          return this.imageElement_;
        };
        this.hide_ = () => {
          Blockly.WidgetDiv.hide();
          Blockly.DropDownDiv.hideWithoutAnimation();
        };
        this.dropdownDispose_ = function() {
          Blockly.unbindEvent_(this.clickWrapper_);
        };

        // 更新选中项(展示值更新,选中项目的样式更新)
        this.updateSelected = (e: any) => {
          console.log(e);
          const text = e.target.innerText;
          if (text === '暂无数据') {
            return;
          }
          this.hide_();
          this.setEditorValue_(text);
          this.selectedValue = this.variables[e.target.innerText].key;
        };
        this.showEditor_ = function() {
          Blockly.SelfSelectorField.superClass_.showEditor_.call(this);
          const div = Blockly.WidgetDiv.DIV;
          if (!div.firstChild) {
            // Mobile interface uses Blockly.prompt.
            return;
          }
          // Build the DOM.
          const editor = this.dropdownCreate_();
          Blockly.DropDownDiv.getContentDiv().appendChild(editor);
          Blockly.DropDownDiv.setColour(this.sourceBlock_.colour_, this.sourceBlock_.colour_);

          Blockly.DropDownDiv.showPositionedByField(
              this, this.dropdownDispose_.bind(this));

          this.clickWrapper_ =
              Blockly.bindEvent_(this.imageElement_, 'click', this,
                  this.updateSelected);
        };
        Blockly.SelfSelectorField.superClass_.constructor.call(this, opt_value, opt_validator);
      };
      Blockly.utils.object.inherits(Blockly.SelfSelectorField, Blockly.FieldTextInput);

      Blockly.SelfSelectorField.fromJson = (options) => {
        const value = Blockly.utils.replaceMessageReferences(options['value']);
        return new Blockly.SelfSelectorField(value);
      };

      Blockly.fieldRegistry.register('self-selector', Blockly.SelfSelectorField);

    }
}
