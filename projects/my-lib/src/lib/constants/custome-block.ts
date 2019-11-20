declare let Blockly: any;
Blockly.Msg['VARIABLES_SELF_CXX'] = 'cxx%1';

export class CustomeBlocks {
  static jsonBlock = {
    type: 'length of',
    message0: '%{BKY_VARIABLES_SELF_CXX}', // %1指的是第一个参数
    args0: [
      {
        type: 'input_value',
        name: 'VALUE',
      }
    ],
    message1: 'subject %1',
    args1: [
      {
        type: 'input_value',
        name: 'VALUE',
      }
    ],
    message2: 'secure %1',
    args2: [
      {
        type: 'field_checkbox',
        name: 'VALUE',
        checked: true
      }
    ],
    message3: 'angle %1',
    args3: [
      {
        type: 'field_angle',
        name: 'FIELDNAME',
        angle: 90,
        ROUND: 70
      }
    ],
    message4: 'color: %1',
    args4: [
      {
        type: 'field_colour',
        name: 'xxx',
        colour: '#ff0000'
      }
    ],
    previousStatement: null, // 前面的连接块-不可与output一起使用, 连接到statement
    nextStatement: null, // 后面的连接块
    inputsInline: false, // 控制输入是否是内联
    // output: 'Number', // 前面凸起的部分，output 连接到 value input
    colour: 160,
    tooltip: 'Returns number of letters in the provided text.',
    helpUrl: 'http://www.w3schools.com/jsref/jsref_length_string.asp',
    // extensions: ['length of']
    // mutator: 'length of'
  };

  static vGet = {
    type: 'variables_get',
    message0: '%1',
    args0: [
      {    // Beginning of the field variable dropdown
        type: 'field_variable',
        name: 'VAR',    // Static name of the field
        variable: '%{BKY_VARIABLES_DEFAULT_NAME}'    // Given at runtime
      }    // End of the field variable dropdown
    ],
    output: null,    // Null means the return value can be of any type
  };

  static vSet = {
    type: 'variables_set',
    message0: '%{BKY_VARIABLES_SET}',
    args0: [
      {
        type: 'field_variable',
        name: 'VAR',
        variable: '%{BKY_VARIABLES_DEFAULT_NAME}'
      },
      {
        type: 'input_value',    // This expects an input of any type
        name: 'VALUE'
      }
    ]
  };

  static pG = {
    type: 'variables_get_panda',
    message0: '%1',
    args0: [
      {
        type: 'field_variable',
        name: 'VAR',
        variable: '%{BKY_VARIABLES_DEFAULT_NAME}',
        variableTypes: ['Panda'],    // Specifies what types to put in the dropdown
        defaultType: 'Panda'
      }
    ],
    output: 'Panda',    // Returns a value of 'Panda'
  };

   // Block for Panda variable setter.
  static pS = {
    type: 'variables_set_panda',
    message0: '%{BKY_VARIABLES_SET}',
    args0: [
      {
        type: 'field_variable',
        name: 'VAR',
        variable: '%{BKY_VARIABLES_DEFAULT_NAME}',
        variableTypes: ['Panda'],
        defaultType: 'Panda'
      },
      {
        type: 'input_value',
        name: 'VALUE',
        check: 'Panda'    // Checks that the input value is of type 'Panda'
      }
    ],
    previousStatement: null,
    nextStatement: null,
  };
}