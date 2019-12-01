export class Toolboxs {
  static defaultToolbox = `<xml id="toolbox" style="display: none">
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
      <block type="length of"  id=".I+Y4^!yXG]zE70!ywTT" x="10" y="10">
        <field name="VALUE">FALSE</field>
      </block>
      <button text="create Panda" callbackKey="createPanda"></button>
      <block type="math_number_property">
        <mutation divisor_input="true"></mutation>
        <field name="PROPERTY">DIVISIBLE_BY</field>
      </block>
      <block type="logic_block_self_add">
        <mutation items="2"></mutation>
        <field name="NAME">&amp;&amp;</field>
      </block>
    </category>
    <category name="dynamic" custom="COLOUR_PALETTE"></category>
  </xml>`;
  static defaultToolbox2 = `<xml id="toolbox" style="display: none">
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
    <block type="length of"  id=".I+Y4^!yXG]zE70!ywTT" x="10" y="10">
      <field name="VALUE">FALSE</field>
    </block>
    <button text="create Panda" callbackKey="createPanda"></button>
    <block type="math_number_property">
      <mutation divisor_input="true"></mutation>
      <field name="PROPERTY">DIVISIBLE_BY</field>
    </block>
    <block type="logic_block_self_add">
      <mutation items="2"></mutation>
      <field name="NAME">&amp;&amp;</field>
    </block>
  </category>
</xml>`;
}
