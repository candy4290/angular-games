import { Svgs } from '../constants/src';

declare var Blockly: any;

export class SelfSelectorField {
    constructor() {
      Blockly.SelfSelectorField = function(menuGenerator, optValue, that, multipleMode) {
        this.multipleMode = multipleMode;
        menuGenerator = menuGenerator || [];
        this.variables = {};
        menuGenerator.forEach(item => {
          this.variables[item[0]] = {
            key: item[0],
            value: item[1]
          };
        });
        optValue = this.doClassValidation_(optValue);
        // 没有搜索结果或全显示
        this.controlDIsplayWithoutResult = function(noResult) {
          for (let i = 0, len = this.imageElement_.children.length; i < len; i++) {
            const item = this.imageElement_.children.item(i);
            if (i === 0) {
              item.style.display = noResult ? 'block' : 'none';
              continue;
            }
            item.style.display = noResult ? 'none' : 'block';
          }
          Blockly.DropDownDiv.showPositionedByField(this, this.dropdownDispose_.bind(this));
        };
        // 根据关键字来空值是否显示
        this.controlDisplayByKeyWords = function(keyworks) {
          for (let i = 0, len =  this.imageElement_.children.length; i < len; i++) {
            const item = this.imageElement_.children.item(i);
            if (i === 0) {
              item.style.display = 'none';
              continue;
            }
            if (item && !item.innerText.includes(keyworks)) {
              item.style.display = 'none';
            } else {
              item.style.display = 'block';
            }
          }
          if (Blockly.DropDownDiv.isVisible()) {
            Blockly.DropDownDiv.showPositionedByField(this, this.dropdownDispose_.bind(this));
          }
        };
        // 检查输入是否有效
        this.doClassValidation_ = function(optNewValue) {
          if (optNewValue === null || optNewValue === undefined) {
            return null;
          }
          if (optNewValue.indexOf(',') > -1) {
            const temp = optNewValue.split(',');
            temp.forEach((item, index) => {
              if (item && this.variables[item]) {
              } else {
                temp.splice(index, 1);
              }
            });
            return temp.join(',');
          }
          if (!this.variables[optNewValue]) {
            if (!optNewValue) {
              this.controlDIsplayWithoutResult(false);
              return null;
            } else {
              // 筛选下拉列表
              const lists = []; // 符合模糊匹配的结果集
              menuGenerator.forEach(item => {
                if (item[0].includes(optNewValue)) {
                  lists.push(item);
                }
              });
              if (lists.length > 0) {
                this.controlDisplayByKeyWords(optNewValue);
              } else {
                this.controlDIsplayWithoutResult(true);
              }
              return null;
            }
          } else {
            if (this.imageElement_) {
              this.controlDisplayByKeyWords(optNewValue);
            }
            that.setTooltip(optNewValue);
            return optNewValue;
          }
        };
        // 初始值为空，默认选中第一条
        if (optValue === null) {
          optValue = Blockly.SelfSelectorField.DEFAULT_VALUE || menuGenerator[0][0];
          this.selectedValue = optValue;
        }
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
            if (this.selectedValue.includes(item[0])) {
              div.className += ' goog-option-selected';
              this.selectedMenuItem_ = div;
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
          const text = e.target.innerText;
          if (text === '暂无数据' || !text) {
            return;
          }
          if (this.multipleMode) {
            const preValue = this.getValue();
            if (preValue) {
              if (preValue.includes(text)) {
                // 取消选中
                this.htmlInput_.value = this.value_ = preValue.split(',').filter(item => item !== text).join(',');
              } else {
                this.htmlInput_.value = this.value_ = preValue + `,${text}`;
              }
            } else {
              this.htmlInput_.value = this.value_ = text;
            }
            this.editUlList(e.target);
            this.selectedValue += `,${this.variables[text].key}`;
          } else {
            this.hide_();
            this.setEditorValue_(text);
            this.selectedValue = this.variables[text].key;
          }
        };
        this.showEditor_ = function() {
          this.selectedValue = this.getValue();
          Blockly.SelfSelectorField.superClass_.showEditor_.call(this);
          const div = Blockly.WidgetDiv.DIV;
          if (!div.firstChild) {
            return;
          }
          const editor = this.dropdownCreate_();
          Blockly.DropDownDiv.getContentDiv().appendChild(editor);
          Blockly.DropDownDiv.setColour(this.sourceBlock_.colour_, this.sourceBlock_.colour_);
          Blockly.DropDownDiv.showPositionedByField(this, this.dropdownDispose_.bind(this));
          if (this.selectedMenuItem_) { // 滚动到选中位置
            editor.parentNode.scrollTop = this.selectedMenuItem_.offsetTop - 30;
          }
          this.clickWrapper_ = Blockly.bindEvent_(this.imageElement_, 'click', this, this.updateSelected);
        };
        Blockly.SelfSelectorField.superClass_.constructor.call(this, optValue);
      };
      Blockly.utils.object.inherits(Blockly.SelfSelectorField, Blockly.FieldTextInput);

      Blockly.SelfSelectorField.fromJson = (options) => {
        const value = Blockly.utils.replaceMessageReferences(options.value);
        return new Blockly.SelfSelectorField(value);
      };

      Blockly.fieldRegistry.register('self-selector', Blockly.SelfSelectorField);

    }
}
