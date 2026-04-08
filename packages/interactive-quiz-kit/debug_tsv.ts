
import { QuestionImportService } from './src/services/QuestionImportService';
import { z } from 'zod';

const tsvContent = `code	prompt	options	correctAnswer	tolerance	explanation	points	learningObjectiveCodes	questionTypeCode	bloomLevelCode	difficultyCode	contextCode	knowledgeDimensionCode
Q_SWIFT_0160979	You encounter the following code snippet:\\n\\n\`\`\`swift\\nlet x = 5\\nlet y = 2.0\\nlet result = Double(x) / y\\n\`\`\`\\n\\nWhat is the inferred type of \`result\`?	Int|Double|Float|NSNumber	Double	0	x is explicitly converted to Double. y is inferred as Double. Operations between two Doubles result in a Double.	2.4		MULTIPLE_CHOICE	UNDERSTAND	MEDIUM	TECH_ENG	CONCEPTUAL
Q_SWIFT_0250728	Why does this code fail to compile?\\n\\n\`\`\`swift\\nlet balance = 100.0\\nif true {\\n    balance += 50.0\\n}\\n\`\`\`	\`balance\` is a constant (let) and cannot be changed.|Double cannot use \`+=\` operator.|\`balance\` is inferred as Int.|The \`if\` condition is invalid.	\`balance\` is a constant (let) and cannot be changed.	0	Constants declared with \`let\` are immutable. You must use \`var\` if you intend to modify the value later.	3.6		MULTIPLE_CHOICE	APPLY	MEDIUM	TECH_ENG	CONCEPTUAL
Q_SWIFT_0384874	Calculate the result of this Swift expression:\\n\\n\`\`\`swift\\n(10 + 2) * 4 % 5\\n\`\`\`\\nEnter only the number.		3	0	1. (10+2)=12. 2. 12*4=48. 3. 48 % 5 = 3 (since 45 is divisible by 5, remainder is 3).	4.8		NUMERIC	APPLY	MEDIUM	TECH_ENG	PROCEDURAL
Q_SWIFT_0466618	In Swift, which special character sequence is used to insert a variable \`name\` inside a string like \`"Hello ___"\`?	$name|{name}|(name)|\\(name)	\\(name)	0	Swift uses the backslash and parentheses syntax \`\\(variable)\` for string interpolation.	2.0		MULTIPLE_CHOICE	APPLY	EASY	TECH_ENG	FACTUAL
Q_SWIFT_0553867	Trace this code. Which output is printed?\\n\\n\`\`\`swift\\nlet t = 25\\nif t < 10 { print("A") }\\nelse if t < 20 { print("B") }\\nelse if t < 30 { print("C") }\\nelse { print("D") }\\n\`\`\`	A|B|C|D	C	0	25 is not < 10 or < 20. But 25 IS < 30. So "C" is printed and the rest is skipped.	4.0		MULTIPLE_CHOICE	ANALYZE	MEDIUM	TECH_ENG	PROCEDURAL
Q_SWIFT_0698994	Which \`switch\` statement for an \`Int\` variable \`x\` is valid and exhaustive?	switch x { case 1: print(1) }|switch x { default: print("Any") }|switch x { case 1...100: print("Range") }|switch x { case 1: print(1); case 2: print(2) }	switch x { default: print("Any") }	0	When switching on \`Int\`, you cannot cover all possible numbers with cases alone. A \`default\` case is required to be exhaustive.	3.6		MULTIPLE_CHOICE	APPLY	MEDIUM	TECH_ENG	CONCEPTUAL
Q_SWIFT_0763163	Arrange code to print even numbers from 1 to 10.	for n in 1...10 {|if n % 2 == 0 {|    print(n)|}|}	for n in 1...10 {|if n % 2 == 0 {|    print(n)|}|}	0	Loop through range -> Check even condition (modulo 2 is 0) -> Print.	5.2		SEQUENCE	APPLY	HARD	TECH_ENG	PROCEDURAL
Q_SWIFT_0888371	What happens when running this code?\\n\\n\`\`\`swift\\nlet arr = ["A", "B", "C"]\\nfor i in 0...3 {\\n    print(arr[i])\\n}\\n\`\`\`	Prints A, B, C then crashes.|Prints A, B, C then prints nil.|Prints A, B, C, A.|Crashes immediately without printing.	Prints A, B, C then crashes.	0	The loop runs for i=0, 1, 2 (prints A, B, C successfully). Then it runs for i=3. Accessing arr[3] causes "Index out of range" crash.	6.0		MULTIPLE_CHOICE	ANALYZE	HARD	TECH_ENG	PROCEDURAL
Q_SWIFT_0991510	Order the commands to transform empty \`items\` array into \`["B", "C"]\`.	items.append("A")|items.append("B")|items.append("C")|items.remove(at: 0)	items.append("A")|items.append("B")|items.append("C")|items.remove(at: 0)	0	Start: []. Append A -> ["A"]. Append B -> ["A","B"]. Append C -> ["A","B","C"]. Remove at 0 -> ["B","C"].	5.2		SEQUENCE	APPLY	MEDIUM	TECH_ENG	PROCEDURAL
Q_SWIFT_1049475	For function \`func move(to x: Int, duration t: Double)\`, drag labels to call it: \`move(___: 10, ___: 5.0)\`.	to|duration|x|t	to#duration	0	We use external parameter names (argument labels) when calling functions: \`to\` and \`duration\`.	6.0		DRAG_AND_DROP	APPLY	HARD	TECH_ENG	PROCEDURAL
Q_SWIFT_1116442	Given \`func getAge() -> Int\`, what is the return type?	Int|Void|Optional Int|String	Int	0	The syntax \`-> Type\` defines the return type. Here it is clearly \`Int\`.	2.4		MULTIPLE_CHOICE	UNDERSTAND	MEDIUM	TECH_ENG	FACTUAL
Q_SWIFT_1230158	Why must a mutating method in a struct use the \`mutating\` keyword?	Structs are value types and their properties are immutable by default within methods.|Structs are reference types.|To allow the method to be overridden.|To make the method thread-safe.	Structs are value types and their properties are immutable by default within methods.	0	In value types (struct/enum), \`self\` is immutable. To modify properties, the method must explicitly state it is \`mutating\`.	6.0		MULTIPLE_CHOICE	ANALYZE	HARD	TECH_ENG	CONCEPTUAL
Q_SWIFT_1331020	Which initializers are automatically generated for \`struct User { var name: String; var age: Int = 18 }\`? (Select two)	User(name: "A", age: 20)|User(name: "B")|User()|User("C", 20)	User(name: "A", age: 20)|User(name: "B")	0	Memberwise initializer allows providing all values. Since \`age\` has a default, a version omitting \`age\` is also available.	4.8		MULTIPLE_RESPONSE	APPLY	MEDIUM	TECH_ENG	PROCEDURAL
Q_SWIFT_1422819	Which statement unwraps an optional \`email\` and exits the function if it is nil?	if let e = email { ... }|guard let e = email else { return }|let e = email!|guard email != nil else { return }	guard let e = email else { return }	0	\`guard let\` is specifically designed for early exit (returning) if the value is missing, avoiding nested braces.	6.0		MULTIPLE_CHOICE	ANALYZE	HARD	TECH_ENG	PROCEDURAL
Q_UI_1588340	To layout an icon on the LEFT and text on the RIGHT, which stack do you use?	VStack|HStack|ZStack|LazyVGrid	HStack	0	Horizontal Stack (HStack) arranges items horizontally (side-by-side).	4.0		MULTIPLE_CHOICE	ANALYZE	MEDIUM	TECH_ENG	PROCEDURAL
Q_UI_1635829	Arrange code to overlay Text on top of an Image, aligned to the top-right.	ZStack(alignment: .topTrailing) {|    Image("bg")|    Text("New")|}	ZStack(alignment: .topTrailing) {|    Image("bg")|    Text("New")|}	0	ZStack layers views back-to-front. Image is background (first), Text is foreground (second). Alignment places them correctly.	5.2		SEQUENCE	APPLY	MEDIUM	TECH_ENG	PROCEDURAL
Q_UI_1778446	How does \`.padding().background(.red)\` differ visually from \`.background(.red).padding()\`?	First has red spacing around content; Second has red content box with transparent spacing.|First has transparent spacing; Second has red spacing.|No difference.|Second one crashes.	First has red spacing around content; Second has red content box with transparent spacing.	0	Modifiers apply sequentially. 1. Padding adds space -> Background fills that space red. 2. Background fills content red -> Padding adds transparent space around it.	6.0		MULTIPLE_CHOICE	ANALYZE	HARD	TECH_ENG	PROCEDURAL
Q_UI_1897601	What does \`Spacer()\` do inside an \`HStack\`?	Expands horizontally to push views apart.|Expands vertically.|Adds fixed 10pt space.|Draws a separator line.	Expands horizontally to push views apart.	0	Spacer consumes all available flexible space along the stack's axis.	2.0		MULTIPLE_CHOICE	UNDERSTAND	EASY	TECH_ENG	FACTUAL
Q_UI_1935394	To make an \`Image("logo")\` resize to fit a frame, which TWO modifiers are needed?	.resizable()|.scaledToFit()|.bold()|.padding()	.resizable()|.scaledToFit()	0	Images are fixed-size by default. \`.resizable()\` enables resizing. \`.scaledToFit()\` maintains aspect ratio within bounds.	4.8		MULTIPLE_RESPONSE	APPLY	MEDIUM	TECH_ENG	PROCEDURAL
Q_UI_2012628	Match modifiers to their effect.	.font()|.foregroundColor()|.opacity()#Sets text style|Sets text color|Sets transparency	.font():Sets text style|.foregroundColor():Sets text color|.opacity():Sets transparency	0	Basic styling modifiers mapping.	2.0		MATCHING	UNDERSTAND	EASY	TECH_ENG	FACTUAL
Q_UI_2139450	What is the purpose of \`@State\` in a View?	To manage local mutable data that triggers UI updates.|To store data in a database.|To pass data to a parent view.|To handle navigation.	To manage local mutable data that triggers UI updates.	0	@State creates a source of truth owned by the View. Changes to it cause the View to re-render.	2.4		MULTIPLE_CHOICE	UNDERSTAND	MEDIUM	TECH_ENG	CONCEPTUAL
Q_UI_2263310	Fill in the blank to increase the \`@State var count\` by 1 inside a Button action.\\n\\n\`Button("Add") { count ____ 1 }\`		\`+=	0	The operator \`+=\` adds and assigns the value.	3.6		SHORT_ANSWER	APPLY	MEDIUM	TECH_ENG	PROCEDURAL
Q_UI_2387133	You have a child view \`MySwitch(isOn: Binding<Bool>)\`. How do you pass \`@State var wifiOn\` to it?	\`MySwitch(isOn: $wifiOn)\`|\`MySwitch(isOn: wifiOn)\`|\`MySwitch(isOn: &wifiOn)\`|\`MySwitch(isOn: #wifiOn)\`	\`MySwitch(isOn: $wifiOn)\`	0	The \`$\` prefix projects a Binding from a State variable.	6.0		MULTIPLE_CHOICE	ANALYZE	HARD	TECH_ENG	PROCEDURAL
Q_UI_2438321	Drag parts to build a TextField bound to \`$name\`.	TextField|("Name",|text:|$name)	TextField|("Name",|text:|$name)	0	Syntax: \`TextField("Label", text: $binding)\`.	5.2		DRAG_AND_DROP	APPLY	MEDIUM	TECH_ENG	PROCEDURAL
Q_UI_2575956	When does the code inside a Button's closure run?	When the user taps the button.|When the view appears.|Continuously.|When the app crashes.	When the user taps the button.	0	Button actions are event handlers for tap interactions.	3.6		MULTIPLE_CHOICE	APPLY	MEDIUM	TECH_ENG	FACTUAL
Q_UI_2692977	You have \`let items = ["A", "B"]\` (Strings). How do you validly list them in SwiftUI?	List(items, id: \\.self) { item in Text(item) }|List(items) { item in Text(item) }|ForEach(items) { item in Text(item) }|List { Text(items) }	List(items, id: \\.self) { item in Text(item) }	0	Since String is not Identifiable, you MUST provide \`id: \\.self\` to uniquely identify rows.	4.0		MULTIPLE_CHOICE	APPLY	MEDIUM	TECH_ENG	PROCEDURAL
Q_UI_2769207	To use an SF Symbol "gear", you initialize an Image with which parameter name? (e.g., \`Image(___: "gear")\`)		systemName	0	\`Image(systemName: "name")\` is the API for SF Symbols.	2.0		SHORT_ANSWER	UNDERSTAND	EASY	TECH_ENG	FACTUAL
Q_UI_2838166	Which view is typically the root of a navigation hierarchy?	NavigationStack (or NavigationView)|TabView|List|Form	NavigationStack (or NavigationView)	0	These containers manage the navigation stack and bar.	3.6		MULTIPLE_CHOICE	APPLY	MEDIUM	TECH_ENG	CONCEPTUAL
Q_UI_2951385	Which App Icon attribute is REQUIRED by iOS?	No transparency (Opaque)|Round shape|Text label|Shadow	No transparency (Opaque)	0	iOS icons must be square and opaque. The OS applies the corner radius mask.	2.0		MULTIPLE_CHOICE	UNDERSTAND	EASY	TECH_ENG	FACTUAL
Q_UI_3056377	What are the three main design themes of iOS? (Select valid ones)	Clarity|Deference|Depth|Skeuomorphism	Clarity|Deference|Depth	0	According to Apple's Human Interface Guidelines (HIG).	4.8		MULTIPLE_RESPONSE	EVALUATE	MEDIUM	TECH_ENG	CONCEPTUAL
Q_UI_3126532	What modifier implicitly animates changes to a view when a specific value changes?	.animation(_:value:)|.transition()|.animate()|.move()	.animation(_:value:)	0	This modifier watches a value and animates view changes caused by that value.	3.6		MULTIPLE_CHOICE	APPLY	MEDIUM	TECH_ENG	PROCEDURAL
Q_UI_3278890	What is the primary benefit of Xcode Canvas?	Real-time UI preview without running Simulator.|Compilation speed.|Code formatting.|Git management.	Real-time UI preview without running Simulator.	0	Canvas (Previews) speeds up UI iterations.	2.0		MULTIPLE_CHOICE	UNDERSTAND	EASY	TECH_ENG	FACTUAL
Q_OTHER_3358678	Match Xcode areas to functions.	Project Navigator|Inspector|Console#Manage files|Edit attributes|View logs	Project Navigator:Manage files|Inspector:Edit attributes|Console:View logs	0	Standard Xcode layout functions.	2.0		MATCHING	UNDERSTAND	EASY	TECH_ENG	FACTUAL
Q_OTHER_3420693	What does a RED symbol in Xcode usually indicate?	Compiler/Syntax Error|Warning|Runtime crash|Breakpoint	Compiler/Syntax Error	0	Red stops the build. Yellow (Warning) allows build.	4.0		MULTIPLE_CHOICE	ANALYZE	MEDIUM	TECH_ENG	FACTUAL
Q_OTHER_3576952	What happens when execution hits a Breakpoint?	App pauses to allow inspection.|App crashes.|App takes a screenshot.|App restarts.	App pauses to allow inspection.	0	Purpose of breakpoints is to pause and debug.	3.6		MULTIPLE_CHOICE	APPLY	MEDIUM	TECH_ENG	PROCEDURAL
Q_OTHER_3646091	What does this loop print?\\n\\n\`\`\`swift\\nvar i = 1\\nwhile i <= 3 {\\n    print(i)\\n    i += 1\\n}\\n\`\`\`	1 2 3|0 1 2|1 2 3 4|1 2	\`1 2 3	0	Loop runs for i=1, i=2, i=3. Stops when i=4.	4.0		MULTIPLE_CHOICE	ANALYZE	MEDIUM	TECH_ENG	PROCEDURAL
Q_OTHER_3713347	Where can you inspect local variable values while paused at a breakpoint?	Variables View (Debug Area)|Project Navigator|Organizer|Menu Bar	Variables View (Debug Area)	0	The bottom-left pane in Debug Area shows current scope variables.	3.6		MULTIPLE_CHOICE	APPLY	MEDIUM	TECH_ENG	PROCEDURAL
Q_OTHER_3810625	Order the app states during a typical launch.	Not Running|Inactive|Active	Not Running|Inactive|Active	0	App starts from Not Running, briefly passes Inactive (loading UI), then becomes Active (ready for user).	4.0		SEQUENCE	UNDERSTAND	MEDIUM	TECH_ENG	CONCEPTUAL
Q_OTHER_3981097	Why does accessing User Location crash the app if \`Info.plist\` is missing a key?	Privacy violation protection.|Memory leak.|Hardware failure.|Network error.	Privacy violation protection.	0	iOS terminates apps that try to access sensitive data without declared permission description strings.	3.6		MULTIPLE_CHOICE	UNDERSTAND	MEDIUM	TECH_ENG	PROCEDURAL
Q_OTHER_4034825	Which attribute helps VoiceOver users understand an icon-only button?	Accessibility Label|Accessibility Hint|Accessibility Trait|Color	Accessibility Label	0	Since there is no text, the Label provides the essential "What is this?" information (e.g., "Settings").	4.8		MULTIPLE_CHOICE	EVALUATE	MEDIUM	TECH_ENG	CONCEPTUAL
Q_OTHER_4168496	What data is best stored in \`UserDefaults\`?	User preferences (e.g. settings)|Large images|Passwords|Video files	User preferences (e.g. settings)	0	Lightweight key-value store suitable for small configs.	3.6		MULTIPLE_CHOICE	APPLY	MEDIUM	TECH_ENG	CONCEPTUAL
Q_OTHER_4263991	The \`Codable\` protocol is primarily used to map Swift objects to and from which data format?		JSON	0	While Codable supports other formats (Plist), JSON is the primary use case in app development.	2.4		SHORT_ANSWER	UNDERSTAND	MEDIUM	TECH_ENG	CONCEPTUAL
Q_OTHER_4340746	How do you view "Quick Help" for a keyword in Xcode?	Option-click|Command-click|Right-click|Double-click	Option-click	0	Standard Xcode shortcut for documentation popover.	2.0		MULTIPLE_CHOICE	APPLY	EASY	TECH_ENG	FACTUAL
Q_OTHER_4450521	Match MVVM components.	Model|View|ViewModel#Data|UI|Logic	Model:Data|View:UI|ViewModel:Logic	0	Standard MVVM roles.	2.4		MATCHING	UNDERSTAND	MEDIUM	TECH_ENG	CONCEPTUAL
Q_OTHER_4549948	For a "Minimum Viable Product" (MVP) To-Do app, which feature is highest priority?	Create Task|Change Theme|Share to Facebook|Voice Control	Create Task	0	Core functionality comes first in MVP.	4.8		MULTIPLE_CHOICE	EVALUATE	MEDIUM	TECH_ENG	METACOGNITIVE`;

console.log("--- Starting TSV Debug ---");

try {
  const result = QuestionImportService.processTSV(tsvContent);

  console.log(`Valid Questions: ${result.validQuestions.length}`);
  console.log(`Errors: ${result.errors.length}`);

  if (result.errors.length > 0) {
    console.log("--- ERRORS FOUND ---");
    result.errors.forEach(err => {
      console.log(`Row ${err.index}: ${err.message}`);
      // console.log(`Data: ${err.data}`);
    });
  }

  // Check specific questions for string interpolation validity
  const qSwiftInterpolation = result.validQuestions.find(q => q.code === 'Q_SWIFT_0466618');
  if (qSwiftInterpolation) {
    console.log("\n--- Checking Q_SWIFT_0466618 (Interpolation) ---");
    // Cast to check options - assuming MCQ
    const mcq = qSwiftInterpolation as any; // Using any to access properties easily
    // Use .text instead of .content
    console.log("Options:", JSON.stringify(mcq.options.map((o: any) => o.text)));
    console.log("Correct Answer:", JSON.stringify(mcq.correctAnswerId ? 'IDRef' : mcq.correctAnswer)); 
  } else {
    console.log("\n--- Q_SWIFT_0466618 NOT FOUND (Likely Error) ---");
  }

} catch (error) {
  console.error("Critical Execution Error:", error);
}
