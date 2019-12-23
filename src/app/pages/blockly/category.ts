import { Category, XmlBlock } from 'ngx-blockly';
import { AndOrBlock } from 'my-lib';

export const LOGIC_CATEGORY: Category = new Category([
  new AndOrBlock('logic_block_self_add', null, null),
  // new XmlBlock('controls_if'),
  new XmlBlock('logic_compare'),
  // new XmlBlock('logic_operation'),
  // new XmlBlock('logic_negate'),
  // new XmlBlock('logic_boolean'),
  // new XmlBlock('logic_null'),
  // new XmlBlock('logic_ternary'),
], '%{BKY_LOGIC_HUE}', '逻辑', null);

export const LOOP_CATEGORY: Category = new Category([
  new XmlBlock('controls_repeat_ext'),
  new XmlBlock('controls_whileUntil'),
  new XmlBlock('controls_for'),
  new XmlBlock('controls_forEach'),
  new XmlBlock('controls_flow_statements'),
  new XmlBlock('controls_flow_statements')
], '%{BKY_LOOPS_HUE}', '循环', null);


export const MATH_CATEGORY: Category = new Category([
  new XmlBlock('math_number'),
  new XmlBlock('math_arithmetic'),
  // new XmlBlock('math_single'),  // 平方根，绝对值等等
  // new XmlBlock('math_trig'),  // sin,cos等等
  // new XmlBlock('math_constant'), // 3.14等常亮
  new XmlBlock('math_number_property'), // 判断整数，小数等等
  new XmlBlock('math_round'), // 四舍五入
  new XmlBlock('math_on_list'), // 列表中数值的和，平均数等等
  new XmlBlock('math_modulo'), // 两数取余
  // new XmlBlock('math_constrain'), // math.min(Math.max(0,5), 100)
  new XmlBlock('math_random_int'), // 生成a-b间的随机整数
  new XmlBlock('math_random_float'), // 生成0-1间的随机数
  // new XmlBlock('math_atan2') // 计算方位角
], '%{BKY_MATH_HUE}', '数学', null);

export const TEXT_CATEGORY: Category = new Category([
  new XmlBlock('text'),
  new XmlBlock('text_join'), // 合并文本
  new XmlBlock('text_append'), // 附加文本
  new XmlBlock('text_length'), // 文本长度
  new XmlBlock('text_isEmpty'),
  new XmlBlock('text_indexOf'),
  new XmlBlock('text_charAt'),
  new XmlBlock('text_getSubstring'),
  new XmlBlock('text_changeCase'), // 大小写转换
  new XmlBlock('text_trim'), // 消除字符串空白
  new XmlBlock('text_print'), // alert
  new XmlBlock('text_prompt_ext'), // 让用户输入，并给其提示
], '%{BKY_TEXTS_HUE}', '文本', null);

export const LISTS_CATEGORY: Category = new Category([
  new XmlBlock('lists_create_with'), // 建立列表---数组
  // new XmlBlock('lists_repeat'), // 建立多个一样的列表
  // new XmlBlock('lists_length'),
  // new XmlBlock('lists_isEmpty'),
  // new XmlBlock('lists_indexOf'),
  // new XmlBlock('lists_getIndex'),
  // new XmlBlock('lists_setIndex'),
  // new XmlBlock('lists_getSublist'),
  new XmlBlock('lists_split'),
  new XmlBlock('lists_sort'), // 列表排序
], '%{BKY_LISTS_HUE}', '列表', null);

export const COLOUR_CATEGORY: Category = new Category([
  new XmlBlock('colour_picker'),
  new XmlBlock('colour_random'),
  new XmlBlock('colour_random'),
  new XmlBlock('colour_blend')
], '%{BKY_COLOUR_HUE}', 'Colours', '');

export const VARIABLES_CATEGORY: Category = new Category([], '%{BKY_VARIABLES_HUE}', '变量', 'VARIABLE');

export const FUNCTIONS_CATEGORY: Category = new Category([], '%{BKY_PROCEDURES_HUE}', 'Functions', 'PROCEDURE');
