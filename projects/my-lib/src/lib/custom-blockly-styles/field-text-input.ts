declare var Blockly: any;
// file输入的最大字符数，超出显示省略号
// Blockly.Field.prototype.maxDisplayLength = 10;

export default Blockly.FieldTextInput.prototype.showInlineEditor_ = function(quietInput) {
  Blockly.WidgetDiv.show(
      this, this.sourceBlock_.RTL, this.widgetDispose_.bind(this));
  this.htmlInput_ = this.widgetCreate_();
  this.isBeingEdited_ = true;
  if (!quietInput) {
    if (this.multipleMode) {
      this.htmlInput_.focus();
    } else {
      this.htmlInput_.focus();
      this.htmlInput_.select();
    }
  }
};

Blockly.FieldTextInput.prototype.editUlList = function(e: HTMLElement) {
  const values = this.getEditorText_(this.value_).split(',');
  const htmlUl = document.getElementsByClassName('app-blockly-ul')[0];
  for (let i = 0, len = htmlUl.children.length - 1; i < len; i++) {
    const li = <HTMLElement>htmlUl.children[i].firstChild;
    const index = values.indexOf(li.innerText);
    if (index === -1) {
      htmlUl.removeChild(li.parentElement);
      li.parentElement.removeEventListener('click', this.deleteEleEvent.bind(this));
      e.className = 'goog-menuitem goog-option';
      i--; len --;
    } else {
      values.splice(index, 1);
    }
  }
  // 新增li
  values.forEach(value => {
    if (value) {
      e.className += ' goog-option-selected';
      const htmlLi = this.createLi(value);
      htmlUl.insertBefore(htmlLi, htmlUl.lastChild);
    }
  });
  this.htmlInput_.focus();
  const scrollFather = this.htmlInput_.parentNode.parentNode;
  scrollFather.scrollLeft = 1000;
  this.forceRerender();
  if (Blockly.DropDownDiv.isVisible()) {
    Blockly.DropDownDiv.showPositionedByField(this, this.dropdownDispose_.bind(this));
  }
};

Blockly.FieldTextInput.prototype.deleteEleEvent = function(e) {
  const text = (<HTMLElement>(<HTMLElement>e.target).previousElementSibling).innerText;
  this.updateSelected(this.findDropDownItemByName(text));
};

Blockly.FieldTextInput.prototype.createLi = function(value) {
  const htmlLi = document.createElement('li');
  htmlLi.className = 'app-blockly-li';
  const innerText = document.createElement('div');
  innerText.innerText = value;
  htmlLi.appendChild(innerText);
  const deleteEle = document.createElement('div');
  deleteEle.innerText = 'x';
  deleteEle.style.color = 'rgba(0,0,0,.45)';
  deleteEle.style.padding = '0 4px';
  deleteEle.style.cursor = 'pointer';
  deleteEle.setAttribute('title', '点击删除');
  (<Element>deleteEle).addEventListener('click', this.deleteEleEvent.bind(this));
  htmlLi.appendChild(deleteEle);
  return htmlLi;
};

Blockly.FieldTextInput.prototype.widgetCreate_ = function() {
  const div = Blockly.WidgetDiv.DIV;
  if (this.multipleMode) {
    const htmlUl = document.createElement('ul');
    htmlUl.className = 'app-blockly-ul';
    const fontSize =
        (Blockly.FieldTextInput.FONTSIZE * this.workspace_.scale) + 'px';
    div.style.fontSize = fontSize;
    const values = this.getEditorText_(this.value_);
    if (values) {
      values.split(',').forEach(value => {
        const htmlLi = this.createLi(value);
        htmlUl.appendChild(htmlLi);
      });
    }
    const htmlLiInput = document.createElement('li');
    const htmlInput = document.createElement('div');
    htmlInput.style.minWidth = '4px';
    htmlInput.setAttribute('contenteditable', 'true');
    htmlLiInput.className = 'app-blockly-li';
    htmlLiInput.appendChild(htmlInput);
    htmlLiInput.style.background = '#fff';
    htmlUl.appendChild(htmlLiInput);
    div.appendChild(htmlUl);

    htmlInput['untypedDefaultValue_'] = this.value_;
    htmlInput['oldValue_'] = null;
    if (Blockly.utils.userAgent.GECKO) {
      setTimeout(this.resizeEditor_.bind(this), 0);
    } else {
      this.resizeEditor_();
    }

    this.bindInputEvents_(htmlInput);
    return htmlInput;
  } else {
    const htmlInput = (document.createElement('input'));
    htmlInput.className = 'blocklyHtmlInput';
    htmlInput.setAttribute('spellcheck', this.spellcheck_);
    const fontSize =
        (Blockly.FieldTextInput.FONTSIZE * this.workspace_.scale) + 'pt';
    div.style.fontSize = fontSize;
    htmlInput.style.fontSize = fontSize;
    const borderRadius =
        (Blockly.FieldTextInput.BORDERRADIUS * this.workspace_.scale) + 'px';
    htmlInput.style.borderRadius = borderRadius;
    div.appendChild(htmlInput);

    htmlInput.value = htmlInput.defaultValue = this.getEditorText_(this.value_);
    htmlInput['untypedDefaultValue_'] = this.value_;
    htmlInput['oldValue_'] = null;
    if (Blockly.utils.userAgent.GECKO) {
      setTimeout(this.resizeEditor_.bind(this), 0);
    } else {
      this.resizeEditor_();
    }
    this.bindInputEvents_(htmlInput);
    return htmlInput;
  }
};

Blockly.FieldTextInput.prototype.onHtmlInputChange_ = function(_e) {
  const text = this.multipleMode ? this.htmlInput_.innerText : this.htmlInput_.value;
  if (text !== this.htmlInput_.oldValue_) {
    this.htmlInput_.oldValue_ = text;
    Blockly.Events.setGroup(true);
    const value = this.getValueFromEditorText_(text);
    if (!this.multipleMode) {
      this.setValue(value);
      this.forceRerender();
    } else {
      this.doClassValidation_(value);
    }
    Blockly.Events.setGroup(false);
  }
};

Blockly.FieldTextInput.prototype.onHtmlInputKeyDown_ = function(e) {
  if (e.keyCode === Blockly.utils.KeyCodes.ENTER) {
    Blockly.WidgetDiv.hide();
    Blockly.DropDownDiv.hideWithoutAnimation();
  } else if (e.keyCode === Blockly.utils.KeyCodes.ESC) {
    this.htmlInput_.value = this.htmlInput_.defaultValue;
    Blockly.WidgetDiv.hide();
    Blockly.DropDownDiv.hideWithoutAnimation();
  } else if (e.keyCode === Blockly.utils.KeyCodes.TAB) {
    Blockly.WidgetDiv.hide();
    Blockly.DropDownDiv.hideWithoutAnimation();
    this.sourceBlock_.tab(this, !e.shiftKey);
    e.preventDefault();
  } else if (this.multipleMode && e.keyCode === Blockly.utils.KeyCodes.BACKSPACE) {
    // 删除inputline text中的一项
    const innerText = (this.htmlInput_.innerText || '');
    if (innerText.length === 0) {
      const htmlUl = document.getElementsByClassName('app-blockly-ul')[0];
      if (htmlUl.children.length > 1) {
        const toDeleteUi = <HTMLElement>htmlUl.children.item(htmlUl.children.length - 2).firstChild;
        this.updateSelected(this.findDropDownItemByName(toDeleteUi.innerText));
      }
    }
  }
};

Blockly.FieldTextInput.prototype.findDropDownItemByName = function(text) {
  const menuItems = document.getElementsByClassName('goog-menuitem');
  for (let i = 0, len = menuItems.length; i < len; i++) {
    const tempElement = <HTMLElement>menuItems.item(i).children.item(0);
    if (tempElement.innerText === text) {
      return {target: tempElement.parentElement};
    }
  }
};


