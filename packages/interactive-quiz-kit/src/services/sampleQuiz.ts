// packages/interactive-quiz-kit/src/services/sampleQuiz.ts
import type { QuizConfig, TrueFalseQuestion, MultipleChoiceQuestion, MultipleResponseQuestion, ShortAnswerQuestion, NumericQuestion, FillInTheBlanksQuestion, SequenceQuestion, SequenceItem, MatchingQuestion, MatchPromptItem, MatchOptionItem, DragAndDropQuestion, DraggableItem, DropZone, HotspotQuestion, HotspotArea, BlocklyProgrammingQuestion, ScratchProgrammingQuestion, CodingQuestion } from '..';
import { generateUniqueId } from '../utils/idGenerators';

const trueFalseQ1: TrueFalseQuestion = {
  id: generateUniqueId('tfq_'),
  questionTypeCode: 'TRUE_FALSE',
  prompt: "Bầu trời có màu xanh do hiện tượng tán xạ Rayleigh.",
  correctAnswer: true,
  points: 10,
  explanation: "Tán xạ Rayleigh khiến ánh sáng xanh tán xạ nhiều hơn các màu khác vì nó truyền đi dưới dạng sóng ngắn hơn, nhỏ hơn.",
  difficultyCode: 'EASY',
  meta: { learningObjectiveCodes: ['PHYSICS_OPTICS_01'] },
};

const mcq1: MultipleChoiceQuestion = {
  id: generateUniqueId('mcq_'),
  questionTypeCode: 'MULTIPLE_CHOICE',
  prompt: "Thủ đô của Pháp là gì?",
  options: [
    { id: generateUniqueId('opt_'), text: "Berlin" },
    { id: generateUniqueId('opt_'), text: "Madrid" },
    { id: generateUniqueId('opt_'), text: "Paris" },
    { id: generateUniqueId('opt_'), text: "Rome" },
  ],
  correctAnswerId: '',
  points: 15,
  difficultyCode: 'EASY',
  meta: { learningObjectiveCodes: ['GEO_CAPITALS_EU_01'] },
};
const parisOption = mcq1.options.find(opt => opt.text === "Paris");
if (parisOption) {
    mcq1.correctAnswerId = parisOption.id;
}

const mrq1_opt1_id = generateUniqueId('opt_');
const mrq1_opt2_id = generateUniqueId('opt_');
const mrq1_opt3_id = generateUniqueId('opt_');
const mrq1_opt4_id = generateUniqueId('opt_');
const mrq1_opt5_id = generateUniqueId('opt_');

const mrq1: MultipleResponseQuestion = {
  id: generateUniqueId('mrq_'),
  questionTypeCode: 'MULTIPLE_RESPONSE',
  prompt: "Những hành tinh nào sau đây thuộc Hệ Mặt Trời có vành đai (rings)?",
  options: [
    { id: mrq1_opt1_id, text: "Sao Thổ (Saturn)" },
    { id: mrq1_opt2_id, text: "Sao Mộc (Jupiter)" },
    { id: mrq1_opt3_id, text: "Sao Thiên Vương (Uranus)" },
    { id: mrq1_opt4_id, text: "Sao Hải Vương (Neptune)" },
    { id: mrq1_opt5_id, text: "Trái Đất (Earth)" },
  ],
  correctAnswerIds: [mrq1_opt1_id, mrq1_opt2_id, mrq1_opt3_id, mrq1_opt4_id],
  points: 20,
  explanation: "Sao Thổ nổi tiếng với hệ thống vành đai phức tạp. Sao Mộc, Sao Thiên Vương và Sao Hải Vương cũng có vành đai, mặc dù chúng mờ hơn và khó quan sát hơn nhiều so với vành đai của Sao Thổ.",
  difficultyCode: 'MEDIUM',
  meta: { learningObjectiveCodes: ['ASTRONOMY_SOLAR_SYSTEM_02'] },
};

const shortAnswerQ1: ShortAnswerQuestion = {
  id: generateUniqueId('saq_'),
  questionTypeCode: 'SHORT_ANSWER',
  prompt: "Ngôn ngữ lập trình nào thường được sử dụng chủ yếu cho phát triển web phía client-side để làm cho các trang web trở nên tương tác?",
  acceptedAnswers: ["JavaScript", "Javascript", "javascript", "JS", "js"],
  points: 10,
  explanation: "JavaScript là ngôn ngữ kịch bản chính chạy trên trình duyệt của người dùng để tạo ra các trang web tương tác.",
  difficultyCode: 'EASY',
  meta: { learningObjectiveCodes: ['PROG_WEB_FRONTEND_01'] },
  isCaseSensitive: false,
};

const numericQ1: NumericQuestion = {
  id: generateUniqueId('nq_'),
  questionTypeCode: 'NUMERIC',
  prompt: "Nhiệt độ sôi của nước ở áp suất khí quyển tiêu chuẩn là bao nhiêu độ C?",
  answer: 100,
  tolerance: 1,
  points: 10,
  explanation: "Nước sôi ở 100 độ C (212 độ F) ở áp suất khí quyển tiêu chuẩn.",
  difficultyCode: 'EASY',
  meta: { learningObjectiveCodes: ['CHEM_PROPERTIES_01'] },
};

const fillInTheBlanksQ1: FillInTheBlanksQuestion = {
  id: generateUniqueId('fitb_'),
  questionTypeCode: 'FILL_IN_THE_BLANKS',
  prompt: "Điền vào chỗ trống để hoàn thành câu sau:",
  segments: [
    { type: 'text', content: 'Nước được cấu tạo từ hai nguyên tố là ' },
    { type: 'blank', id: 'fitb_h' },
    { type: 'text', content: ' và ' },
    { type: 'blank', id: 'fitb_o' },
    { type: 'text', content: '.' }
  ],
  answers: [
    { blankId: 'fitb_h', acceptedValues: ['Hydro', 'Hydrogen', 'H'] },
    { blankId: 'fitb_o', acceptedValues: ['Oxy', 'Oxygen', 'O'] }
  ],
  isCaseSensitive: false,
  points: 15,
  explanation: "Nước (H₂O) được tạo thành từ hai nguyên tử Hydro và một nguyên tử Oxy.",
  difficultyCode: 'EASY',
  meta: { learningObjectiveCodes: ['CHEM_BASICS_01'] },
};

const sequenceQ1_item1_id = generateUniqueId('seqi_');
const sequenceQ1_item2_id = generateUniqueId('seqi_');
const sequenceQ1_item3_id = generateUniqueId('seqi_');
const sequenceQ1_item4_id = generateUniqueId('seqi_');

const sequenceQ1: SequenceQuestion = {
  id: generateUniqueId('seqq_'),
  questionTypeCode: 'SEQUENCE',
  prompt: "Sắp xếp các hành tinh sau theo thứ tự từ gần Mặt Trời nhất đến xa nhất:",
  items: [
    { id: sequenceQ1_item1_id, content: "Sao Hỏa (Mars)" },
    { id: sequenceQ1_item2_id, content: "Trái Đất (Earth)" },
    { id: sequenceQ1_item3_id, content: "Sao Thủy (Mercury)" },
    { id: sequenceQ1_item4_id, content: "Sao Kim (Venus)" },
  ],
  correctOrder: [sequenceQ1_item3_id, sequenceQ1_item4_id, sequenceQ1_item2_id, sequenceQ1_item1_id],
  points: 20,
  explanation: "Thứ tự đúng của các hành tinh từ gần Mặt Trời nhất là: Sao Thủy, Sao Kim, Trái Đất, Sao Hỏa.",
  difficultyCode: 'MEDIUM',
  meta: { learningObjectiveCodes: ['ASTRONOMY_SOLAR_SYSTEM_01'] },
};

const matchingQ1_prompt_vn = generateUniqueId('matp_');
const matchingQ1_prompt_jp = generateUniqueId('matp_');
const matchingQ1_prompt_us = generateUniqueId('matp_');
const matchingQ1_opt_hanoi = generateUniqueId('mato_');
const matchingQ1_opt_tokyo = generateUniqueId('mato_');
const matchingQ1_opt_dc = generateUniqueId('mato_');

const matchingQ1: MatchingQuestion = {
  id: generateUniqueId('matq_'),
  questionTypeCode: 'MATCHING',
  prompt: "Hãy ghép mỗi quốc gia với thủ đô tương ứng.",
  prompts: [
    { id: matchingQ1_prompt_vn, content: "Việt Nam" },
    { id: matchingQ1_prompt_jp, content: "Nhật Bản" },
    { id: matchingQ1_prompt_us, content: "Hoa Kỳ" },
  ],
  options: [
    { id: matchingQ1_opt_tokyo, content: "Tokyo" },
    { id: matchingQ1_opt_hanoi, content: "Hà Nội" },
    { id: matchingQ1_opt_dc, content: "Washington D.C." },
  ],
  correctAnswerMap: [
    { promptId: matchingQ1_prompt_vn, optionId: matchingQ1_opt_hanoi },
    { promptId: matchingQ1_prompt_jp, optionId: matchingQ1_opt_tokyo },
    { promptId: matchingQ1_prompt_us, optionId: matchingQ1_opt_dc },
  ],
  points: 15,
  explanation: "Hà Nội là thủ đô của Việt Nam, Tokyo là của Nhật Bản, và Washington D.C. là của Hoa Kỳ.",
  difficultyCode: 'EASY',
  meta: { learningObjectiveCodes: ['GEO_CAPITALS_AS_NA_01'] },
  shuffleOptions: true,
};

const dndQ1_drag_apple = generateUniqueId('dndi_');
const dndQ1_drag_banana = generateUniqueId('dndi_');
const dndQ1_drag_orange = generateUniqueId('dndi_');
const dndQ1_drop_red = generateUniqueId('dndz_');
const dndQ1_drop_yellow = generateUniqueId('dndz_');
const dndQ1_drop_orange_color = generateUniqueId('dndz_');

const dragAndDropQ1: DragAndDropQuestion = {
  id: generateUniqueId('dndq_'),
  questionTypeCode: 'DRAG_AND_DROP',
  prompt: "Kéo các loại trái cây vào đúng giỏ màu của chúng (theo logic ghép nối đơn giản).",
  draggableItems: [
    { id: dndQ1_drag_apple, content: "Táo" },
    { id: dndQ1_drag_banana, content: "Chuối" },
    { id: dndQ1_drag_orange, content: "Cam" },
  ],
  dropZones: [
    { id: dndQ1_drop_red, label: "Giỏ Đỏ" },
    { id: dndQ1_drop_yellow, label: "Giỏ Vàng" },
    { id: dndQ1_drop_orange_color, label: "Giỏ Cam" },
  ],
  answerMap: [
    { draggableId: dndQ1_drag_apple, dropZoneId: dndQ1_drop_red },
    { draggableId: dndQ1_drag_banana, dropZoneId: dndQ1_drop_yellow },
    { draggableId: dndQ1_drag_orange, dropZoneId: dndQ1_drop_orange_color },
  ],
  points: 15,
  explanation: "Táo thường có màu đỏ (giỏ đỏ), chuối màu vàng (giỏ vàng), và cam có màu cam (giỏ cam).",
  difficultyCode: 'EASY',
  meta: { learningObjectiveCodes: ['EARLY_LEARNING_COLORS_01'] },
  backgroundImageUrl: 'https://placehold.co/600x200.png',
  imageAltText: 'colored baskets'
};

const hotspotQ1_engine_left = generateUniqueId('hs_');
const hotspotQ1_engine_right = generateUniqueId('hs_');
const hotspotQ1_cockpit = generateUniqueId('hs_');

const hotspotQ1: HotspotQuestion = {
  id: generateUniqueId('hsq_'),
  questionTypeCode: 'HOTSPOT',
  prompt: "Nhấp vào (các) động cơ của máy bay trong hình.",
  imageUrl: "https://placehold.co/600x400.png",
  imageAltText: "airplane diagram",
  hotspots: [
    { id: hotspotQ1_engine_left, shape: 'rect', coords: [150, 200, 80, 60], description: "Động cơ bên trái" },
    { id: hotspotQ1_engine_right, shape: 'rect', coords: [370, 200, 80, 60], description: "Động cơ bên phải" },
    { id: hotspotQ1_cockpit, shape: 'rect', coords: [250, 120, 100, 70], description: "Buồng lái" },
  ],
  correctHotspotIds: [hotspotQ1_engine_left, hotspotQ1_engine_right],
  points: 15,
  explanation: "Máy bay này có hai động cơ chính, nằm dưới cánh.",
  difficultyCode: 'MEDIUM',
  meta: { learningObjectiveCodes: ['AVIATION_PARTS_01'] },
};

const blocklyQ1: BlocklyProgrammingQuestion = {
  id: generateUniqueId('blkq_'),
  questionTypeCode: 'BLOCKLY_PROGRAMMING',
  prompt: "Sử dụng các khối lệnh để tạo một chương trình in ra dòng chữ 'Hello, World!' vào console.",
  points: 25,
  difficultyCode: 'EASY',
  meta: { learningObjectiveCodes: ['PROG_BASICS_OUTPUT_01'] },
  toolboxDefinition: `
    <xml xmlns="https://developers.google.com/blockly/xml">
      <category name="Text" colour="%{BKY_TEXTS_HUE}">
        <block type="text"></block>
        <block type="text_print"></block>
      </category>
    </xml>
  `,
  initialWorkspace: `
    <xml xmlns="https://developers.google.com/blockly/xml">
      <block type="text_print" id="${generateUniqueId('blki_')}" x="70" y="70">
        <value name="TEXT">
          <shadow type="text" id="${generateUniqueId('blki_')}">
            <field name="TEXT">abc</field>
          </shadow>
        </value>
      </block>
    </xml>
  `,
  solutionWorkspaceXML: `
    <xml xmlns="https://developers.google.com/blockly/xml">
      <block type="text_print" id="${generateUniqueId('blki_solution_')}" x="70" y="70">
        <value name="TEXT">
          <block type="text" id="${generateUniqueId('blki_text_solution_')}">
            <field name="TEXT">Hello, World!</field>
          </block>
        </value>
      </block>
    </xml>
  `,
  solutionGeneratedCode: "window.alert('Hello, World!');",
  explanation: "Chương trình cần sử dụng khối 'print' với đầu vào là khối văn bản chứa 'Hello, World!'."
};

const codeBlockTestQ: MultipleChoiceQuestion = {
  id: generateUniqueId('mcq_'),
  questionTypeCode: 'MULTIPLE_CHOICE',
  prompt: `**Test Code Blocks Rendering**
  
### 1. Inline Code
Normal inline code: \`const x = 10;\` should look like code.
Scratch inline code: \`move (10) steps\` should render as a scratch block.
Scratch inline mixed: \`turn right (15) degrees\` and \`say [Hello!] for (2) secs\`.

### 2. Fence Code Blocks

**Python:**
\`\`\`python
def hello():
    print("Hello Markdown")
\`\`\`

**JavaScript:**
\`\`\`javascript
const arr = [1, 2, 3];
arr.map(x => x * 2);
\`\`\`

**Scratch (Fence):**
\`\`\`scratch
when green flag clicked
move (10) steps
turn right (15) degrees
say [Hello!] for (2) secs
\`\`\`

### 3. Edge Cases
- Empty code block: \`\`\` \`\`\`
- Plain text block:
\`\`\`text
Plain text content
\`\`\`
`,
  options: [
    { id: generateUniqueId('opt_'), text: "All render correctly" },
    { id: generateUniqueId('opt_'), text: "Scratch inline broken" },
    { id: generateUniqueId('opt_'), text: "Scratch fence broken" },
    { id: generateUniqueId('opt_'), text: "Standard fence broken" },
  ],
  correctAnswerId: '',
  points: 5,
  difficultyCode: 'EASY',
  meta: { learningObjectiveCodes: ['TEST_RENDERING'] },
};
const correctOption = codeBlockTestQ.options.find(opt => opt.text === "All render correctly");
if (correctOption) {
  codeBlockTestQ.correctAnswerId = correctOption.id;
}

const scratchQ1: ScratchProgrammingQuestion = {
  id: generateUniqueId('scrq_'),
  questionTypeCode: 'SCRATCH_PROGRAMMING',
  prompt: "Dùng khối lệnh Scratch để di chuyển nhân vật về phía trước `move (10) steps` khi cờ xanh được click.",
  points: 20,
  difficultyCode: 'EASY',
  meta: { learningObjectiveCodes: ['SCRATCH_BASICS_MOTION_01'] },
  toolboxDefinition: `
    <xml xmlns="https://developers.google.com/blockly/xml">
      <category name="Motion" categorystyle="motion">
        <block type="motion_movesteps"></block>
      </category>
      <category name="Events" categorystyle="events">
        <block type="event_whenflagclicked"></block>
      </category>
    </xml>
  `,
  initialWorkspace: `
    <xml xmlns="https://developers.google.com/blockly/xml"></xml>
  `,
  solutionWorkspaceXML: `
    <xml xmlns="https://developers.google.com/blockly/xml">
      <block type="event_whenflagclicked" id="${generateUniqueId('scr_event_')}" x="50" y="50">
        <next>
          <block type="motion_movesteps" id="${generateUniqueId('scr_motion_')}">
            <value name="STEPS">
              <shadow type="math_number">
                <field name="NUM">10</field>
              </shadow>
            </value>
          </block>
        </next>
      </block>
    </xml>
  `,
  solutionGeneratedCode: "whenGreenFlagClicked(() => { move(10); });",
  explanation: "Sử dụng khối 'when green flag clicked' từ Events và khối 'move 10 steps' từ Motion.\n\n```scratch\nwhen green flag clicked\nmove (10) steps\n```"
};

const codingQ1: CodingQuestion = {
  id: generateUniqueId('codeq_'),
  questionTypeCode: 'CODING',
  prompt: "Viết hàm `find_max(numbers)` nhận vào một danh sách các số nguyên và trả về số lớn nhất trong danh sách đó. Giả định danh sách không rỗng.",
  points: 30,
  difficultyCode: 'MEDIUM',
  meta: { learningObjectiveCodes: ['PROG_PY_ALGO_01'] },
  codingLanguage: 'python',
  functionSignature: "def find_max(numbers):\n    # Viết mã của bạn ở đây\n    pass",
  solutionCode: "def find_max(numbers):\n    return max(numbers)",
  testCases: [
    { id: 'tc1', input: [[1, 2, 3, 4, 5]], expectedOutput: 5, isPublic: true },
    { id: 'tc2', input: [[-10, -5, -20]], expectedOutput: -5, isPublic: true },
    { id: 'tc3', input: [[100]], expectedOutput: 100, isPublic: false }
  ],
  explanation: "Sử dụng hàm build-in `max()` của Python để tìm giá trị lớn nhất một cách hiệu quả."
};

const codingLuaQ: CodingQuestion = {
  id: generateUniqueId('codeq_lua_'),
  questionTypeCode: 'CODING',
  prompt: "Viết hàm `square(n)` trong Lua trả về bình phương của số `n`.",
  points: 20,
  difficultyCode: 'EASY',
  codingLanguage: 'lua',
  functionSignature: "function square(n)\n    -- Viết mã ở đây\nend",
  solutionCode: "function square(n)\n    return n * n\nend",
  testCases: [
    { id: 'tc1', input: [5], expectedOutput: 25, isPublic: true },
    { id: 'tc2', input: [-3], expectedOutput: 9, isPublic: true }
  ],
  explanation: "Trong Lua, toán tử nhân là `*`. Hàm trả về giá trị bằng từ khóa `return`."
};

const codingCQ: CodingQuestion = {
  id: generateUniqueId('codeq_c_'),
  questionTypeCode: 'CODING',
  prompt: "Viết hàm `add(a, b)` trong C trả về tổng của hai số nguyên.",
  points: 20,
  difficultyCode: 'EASY',
  codingLanguage: 'c',
  functionSignature: "int add(int a, int b) {\n    // Viết mã ở đây\n}",
  solutionCode: "int add(int a, int b) {\n    return a + b;\n}",
  testCases: [
    { id: 'tc1', input: [10, 20], expectedOutput: 30, isPublic: true },
    { id: 'tc2', input: [-1, 5], expectedOutput: 4, isPublic: true }
  ],
  explanation: "Hàm trong C cần khai báo kiểu trả về. Sử dụng toán tử `+` để cộng hai số."
};


export const sampleQuiz: QuizConfig = {
  id: "sample-quiz-001",
  title: "Sample Quiz for Testers",
  description: "A short quiz with a few different question types to test the QuizKit functionality.",
  questions: [
    codeBlockTestQ,
    trueFalseQ1,
    mcq1,
    mrq1,
    shortAnswerQ1,
    numericQ1,
    fillInTheBlanksQ1,
    sequenceQ1,
    matchingQ1,
    dragAndDropQ1,
    hotspotQ1,
    blocklyQ1,
    scratchQ1,
    codingQ1,
    codingLuaQ,
    codingCQ,
  ],
  settings: {
    shuffleQuestions: true,
    shuffleOptions: true,
    showCorrectAnswers: 'end_of_quiz',
    passingScorePercent: 70,
    timeLimitMinutes: 25,
  }
};


export const emptyQuiz: QuizConfig = {
  id: generateUniqueId('quiz_'),
  title: "New Quiz",
  description: "",
  questions: [],
  settings: {
    language: 'English',
    shuffleQuestions: false,
    shuffleOptions: false,
    showCorrectAnswers: 'end_of_quiz',
    passingScorePercent: 0,
    timeLimitMinutes: 0,
  }
};