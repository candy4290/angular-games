export class Toolboxs {
  static defaultToolbox = `<xml id="toolbox" style="display: none">
    <category name="Logic" categorystyle="logic_category"></category>
    <category name="Loops" colour="120"></category>
    <category name="Math" colour="230"></category>
    <category name="Colour" colour="20"></category>
    <category name="Variables" colour="330" custom="VARIABLE"></category>
    <category name="Functions" colour="290" custom="PROCEDURE"></category>
    <category name="Colours" colour="80" custom="COLOUR_PALETTE"></category>
    <category name="Core" expanded="true" categorystyle="cxx_xxx">
      <category name="Control">
        <block type="controls_if"></block>
        <block type="controls_whileUntil"></block>
      </category>
      <category name="Logic">
        <block type="logic_compare"></block>
        <block type="logic_operation"></block>
        <block type="logic_boolean"></block>
      </category>
    </category>
    <category name="Blocks" colour="0">
      <block type="logic_boolean"></block>

      <block type="math_number">
        <field name="NUM">42</field>
      </block>

      <block type="controls_for">
        <value name="FROM">
          <block type="math_number">
            <field name="NUM">1</field>
          </block>
        </value>
        <value name="TO">
          <block type="math_number">
            <field name="NUM">10</field>
          </block>
        </value>
        <value name="BY">
          <block type="math_number">
            <field name="NUM">1</field>
          </block>
        </value>
      </block>

      <block type="math_arithmetic">
        <field name="OP">ADD</field>
        <value name="A">
          <shadow type="math_number">
            <field name="NUM">1</field>
          </shadow>
        </value>
        <value name="B">
          <shadow type="math_number">
            <field name="NUM">1</field>
          </shadow>
        </value>
      </block>

      <block type="math_arithmetic">
        <field name="VAR" id=".n*OKd.u}2UD9QFicbEX" variabletype="Panda">Bai Yun</field>
      </block>
      <block type="length of"  id=".I+Y4^!yXG]zE70!ywTT" x="10" y="10" deletable="false" movable="false">
        <field name="VALUE">FALSE</field>
      </block>
      <button text="create Panda" callbackKey="createPanda"></button>
    </category>
  </xml>`
}
