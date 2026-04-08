// packages/interactive-quiz-kit/src/services/QuestionImportService.ts
import { z } from "zod";
import type {
	QuizQuestion,
	MultipleChoiceQuestion,
	MultipleResponseQuestion,
	TrueFalseQuestion,
	ShortAnswerQuestion,
	NumericQuestion,
	SequenceQuestion,
	MatchingQuestion,
	FillInTheBlanksQuestion,
	DragAndDropQuestion,
	BaseQuestion,
	QuestionTypeStrings,
} from "../types/questions";
import type { ImportError } from "../types/misc";
import { generateUniqueId } from "../utils/idGenerators";

const CONTEXT_CODES = [
	"THEO_ABS",
	"SPEC_CASE",
	"NAT_OBS",
	"TECH_ENG",
	"EXP_INV",
	"REAL_PROB",
	"DATA_MOD",
	"HIST_SCI",
	"INTERDISC",
	"HYPO_COMP",
] as const;

// Schemas for initial parsing from TSV/JSON - kept loose on purpose
const BaseRawQuestionSchema = z
	.object({
		code: z.string().optional(),
		questionTypeCode: z.string(),
		prompt: z.string().min(1, { message: "Prompt cannot be empty." }),
		points: z.number().optional(),
		explanation: z.string().optional(),
		difficultyCode: z
			.enum(["VERY_EASY", "EASY", "MEDIUM", "HARD", "VERY_HARD"])
			.optional(),
		bloomLevelCode: z
			.enum([
				"REMEMBER",
				"UNDERSTAND",
				"APPLY",
				"ANALYZE",
				"EVALUATE",
				"CREATE",
			])
			.optional(),
		contextCode: z.enum(CONTEXT_CODES).optional(),
		knowledgeDimensionCode: z
			.enum(["FACTUAL", "CONCEPTUAL", "PROCEDURAL", "METACOGNITIVE"])
			.optional(),

		learningObjectiveCodes: z.array(z.string()).optional(),
		conceptCodes: z.array(z.string()).optional(),
		topicCodes: z.array(z.string()).optional(),
		categoryCodes: z.array(z.string()).optional(),
		subjectCodes: z.array(z.string()).optional(),
		fieldCodes: z.array(z.string()).optional(),
		gradeLevelCodes: z.array(z.string()).optional(),
	})
	.passthrough(); // Use passthrough to allow extra fields from different question types

export class QuestionImportService {
	public static processJSON(jsonString: string): {
		validQuestions: QuizQuestion[];
		errors: ImportError[];
	} {
		try {
			const rawData = JSON.parse(jsonString);
			if (!Array.isArray(rawData)) {
				return {
					validQuestions: [],
					errors: [
						{
							index: 0,
							message:
								"JSON content must be an array of question objects.",
							data: rawData,
						},
					],
				};
			}
			return this.processRawObjects(rawData);
		} catch (e) {
			const message =
				e instanceof Error ? e.message : "Invalid JSON format.";
			return {
				validQuestions: [],
				errors: [
					{ index: 0, message, data: jsonString.substring(0, 500) },
				],
			};
		}
	}

	public static processTSV(tsvString: string): {
		validQuestions: QuizQuestion[];
		errors: ImportError[];
	} {
		const lines = tsvString
			.split(/\r?\n/)
			.filter((line) => line.trim() !== "");
		if (lines.length < 2) {
			return {
				validQuestions: [],
				errors: [
					{
						index: 0,
						message:
							"TSV file must have a header and at least one data row.",
						data: tsvString,
					},
				],
			};
		}

		const header = lines
			.shift()!
			.split("\t")
			.map((h) => h.trim());
		const rawObjects: any[] = [];
		const errors: ImportError[] = [];

		lines.forEach((line, index) => {
			const values = line.split("\t");
			const rowObject: Record<string, string> = {};
			header.forEach((h, i) => {
				let val = values[i] || "";
				// Unescape literal "\n" sequences to actual newlines, but preserve other escapes (like Swift interpolation \()
				// We use a callback to ensure we consume the backslash and the next character together,
				// preventing issues like \\n being misinterpreted.
				val = val.replace(/\\(.)/g, (match, char) => {
					return char === "n" ? "\n" : match;
				});
				rowObject[h] = val;
			});

			try {
				const transformedObject =
					this.transformTsvRowToRawObject(rowObject);
				rawObjects.push(transformedObject);
			} catch (e) {
				const message =
					e instanceof Error
						? e.message
						: "Error transforming TSV row.";
				errors.push({ index: index + 2, message, data: line });
			}
		});

		const processedResult = this.processRawObjects(rawObjects);
		// Adjust index to match original TSV line number
		processedResult.errors.forEach((err) => {
			err.index = err.index + 1;
		});
		return {
			validQuestions: processedResult.validQuestions,
			errors: [...errors, ...processedResult.errors],
		};
	}

	private static processRawObjects(rawObjects: any[]): {
		validQuestions: QuizQuestion[];
		errors: ImportError[];
	} {
		const validQuestions: QuizQuestion[] = [];
		const errors: ImportError[] = [];

		rawObjects.forEach((rawQ, index) => {
			try {
				// First, do a basic validation of common fields
				BaseRawQuestionSchema.parse(rawQ);
				const question = this.createQuestionFromRawObject(rawQ);
				validQuestions.push(question);
			} catch (e) {
				const message =
					e instanceof z.ZodError
						? e.errors
								.map(
									(err) =>
										`${err.path.join(".")} - ${err.message}`,
								)
								.join("; ")
						: e instanceof Error
							? e.message
							: "Unknown validation error.";
				errors.push({ index: index + 1, message, data: rawQ });
			}
		});

		return { validQuestions, errors };
	}

	private static transformTsvRowToRawObject(
		row: Record<string, string>,
	): any {
		const questionTypeCode = (
			row.questionTypeCode ||
			row.question_type_code ||
			row.questionType ||
			row.question_type
		)?.toUpperCase();
		if (!questionTypeCode)
			throw new Error("`questionTypeCode` column is missing or empty.");

		const cleanArray = (
			str: string | undefined,
			separator: string = "|",
		) =>
			str
				? str
						.split(separator)
						.map((s) => s.trim())
						.filter(Boolean)
				: [];

		const base = {
			code: row.code,
			questionTypeCode,
			prompt: row.prompt,
			points: row.points ? parseInt(row.points, 10) : undefined,
			explanation: row.explanation,
			difficultyCode: (row.difficultyCode ||
				row.difficulty_code ||
				row.difficulty ||
				row.level) as any,
			learningObjectiveCodes: cleanArray(
				row.learningObjectiveCodes ??
					row.learning_objective_codes ??
					row.learningObjectives ??
					row.los,
			),
			conceptCodes: cleanArray(
				row.conceptCodes ?? row.concept_codes ?? row.concepts,
			),
			topicCodes: cleanArray(
				row.topicCodes ?? row.topic_codes ?? row.topics,
			),
			categoryCodes: cleanArray(
				row.categoryCodes ?? row.category_codes ?? row.categories,
			),
			subjectCodes: cleanArray(
				row.subjectCodes ?? row.subject_codes ?? row.subjects,
			),
			fieldCodes: cleanArray(
				row.fieldCodes ?? row.field_codes ?? row.fields,
			),
			bloomLevelCode:
				(row.bloomLevelCode ??
					row.bloom_level_code ??
					row.bloomLevel ??
					row.bloom) ||
				undefined,
			contextCode:
				(row.contextCode ?? row.context_code ?? row.context) ||
				undefined,
			knowledgeDimensionCode:
				(row.knowledgeDimensionCode ??
					row.knowledge_dimension_code ??
					row.knowledgeDimension) ||
				undefined,
			gradeLevelCodes: cleanArray(
				row.gradeLevelCodes ??
					row.grade_level_codes ??
					row.gradeLevels ??
					row.grades,
			),
		};
		switch (questionTypeCode) {
			case "MULTIPLE_CHOICE":
				return {
					...base,
					options: cleanArray(row.options),
					correctAnswer: row.correctAnswer?.trim(),
				};
			case "MULTIPLE_RESPONSE":
				return {
					...base,
					options: cleanArray(row.options),
					correctAnswers: cleanArray(row.correctAnswer),
				};
			case "TRUE_FALSE":
				return {
					...base,
					correctAnswer:
						(row.correctAnswer ?? "").toLowerCase().trim() ===
						"true",
				};
			case "SHORT_ANSWER":
				return {
					...base,
					acceptedAnswers: cleanArray(row.correctAnswer),
				};
			case "NUMERIC":
				return {
					...base,
					answer: parseFloat(row.correctAnswer),
					tolerance: row.tolerance
						? parseFloat(row.tolerance)
						: undefined,
				};
			case "SEQUENCE":
				return {
					...base,
					items: cleanArray(row.options),
					correctOrder: cleanArray(row.correctAnswer),
				};
			case "MATCHING": {
				// Handles "Prompts # Options" format in valid TSV
				let promptsSource = row.options;
				if (promptsSource.includes("#")) {
					promptsSource = promptsSource.split("#")[0];
				}
				const prompts = cleanArray(promptsSource);

				const correctAnsStr = row.correctAnswer;
				if (!correctAnsStr)
					throw new Error(
						"Matching 'correctAnswer' column is missing.",
					);

				// Validation Hint: Check for separator misuse (Matching)
				if (
					!correctAnsStr.includes("#") &&
					correctAnsStr.includes("|") &&
					(correctAnsStr.match(/:/g) || []).length > 1
				) {
					console.warn(
						`[Import Warning] Matching question "${row.code}" might be using '|' to separate pairs. Use '#' to separate distinct prompt:option pairs.`,
					);
				}

				// Use hash separator as per documentation (consistent with FIB/DND)
				const answerPairs = cleanArray(correctAnsStr, "#");
				const correctAnswerMap: Record<string, string> = {};
				const allOptionsSet = new Set<string>();

				answerPairs.forEach((pair) => {
					const firstColonIndex = pair.indexOf(":");
					if (firstColonIndex === -1)
						throw new Error(
							`Invalid pair in correctAnswer: "${pair}". Expected "prompt:option".`,
						);

					const promptText = pair
						.substring(0, firstColonIndex)
						.trim();
					const optionText = pair
						.substring(firstColonIndex + 1)
						.trim();

					correctAnswerMap[promptText] = optionText;
					allOptionsSet.add(optionText);
				});

				// If extra options (distractors) were provided in the TSV options string (after #),
				// we could parse them, but generally we rely on the pairs + manual checking.
				// For now, let's stick to the options derived from pairs to ensure validity.

				return {
					...base,
					prompts,
					options: Array.from(allOptionsSet),
					correctAnswerMap,
				};
			}
			case "FILL_IN_THE_BLANKS": {
				const sentence = row.prompt;
				const blankDefsStr = row.correctAnswer;
				if (!sentence || !blankDefsStr)
					throw new Error(
						"For FIB, 'prompt' and 'correctAnswer' columns must be filled.",
					);

				// Validation Hint: Check for separator misuse
				if (
					!blankDefsStr.includes("#") &&
					blankDefsStr.includes("|") &&
					(blankDefsStr.match(/:/g) || []).length > 1
				) {
					console.warn(
						`[Import Warning] FIB question "${row.code}" might be using '|' to separate definitions. use '#' to separate multiple blanks.`,
					);
					// We don't throw here to avoid blocking if it's actually valid single blank with pipes, but it's a good hint for debugging.
				}

				const parsedBlanks = cleanArray(blankDefsStr, "#").reduce(
					(acc: Record<string, any>, part: string) => {
						const firstColonIndex = part.indexOf(":");
						if (firstColonIndex === -1)
							throw new Error(
								`Invalid blank definition: "${part}". Expected at least "placeholder:correctAnswer".`,
							);

						const placeholder = part
							.substring(0, firstColonIndex)
							.trim();
						const rest = part.substring(firstColonIndex + 1).trim();

						const secondColonIndex = rest.indexOf(":");
						let acceptedValuesStr: string;
						let optionsStr: string | undefined;

						if (secondColonIndex !== -1) {
							acceptedValuesStr = rest
								.substring(0, secondColonIndex)
								.trim();
							optionsStr = rest
								.substring(secondColonIndex + 1)
								.trim();
						} else {
							acceptedValuesStr = rest;
						}

						if (placeholder && acceptedValuesStr) {
							const acceptedValues =
								cleanArray(acceptedValuesStr);
							acc[placeholder] = { acceptedValues };

							if (optionsStr) {
								const options = cleanArray(optionsStr);
								if (!options.includes(acceptedValues[0])) {
									options.push(acceptedValues[0]);
								}
								acc[placeholder].options = [
									...new Set(options),
								];
							}
						}
						return acc;
					},
					{},
				);

				return {
					...base,
					sentenceWithPlaceholders: sentence,
					blanks: parsedBlanks,
				};
			}
			case "DRAG_AND_DROP": {
				const draggableItems = cleanArray(row.options);
				const answerDefsStr = row.correctAnswer;
				if (draggableItems.length === 0 || !answerDefsStr) {
					throw new Error(
						"For DND, 'options' (draggable items) and 'correctAnswer' (zone definitions) are required.",
					);
				}

				// Validation Hint: Check for separator misuse
				if (
					!answerDefsStr.includes("#") &&
					answerDefsStr.includes("|") &&
					(answerDefsStr.match(/:/g) || []).length > 1
				) {
					// Check if it looks like "Zone1:A|B | Zone2:C" vs "Zone1:A|B"
					// Simple heuristic: if we have multiple colons and pipes but no hash, it's suspicious.
					console.warn(
						`[Import Warning] DND question "${row.code}" might be using '|' to separate zones. Use '#' to separate distinct drop zones.`,
					);
				}

				const dropZones: string[] = [];
				const answerMap: Record<string, string[]> = {};

				cleanArray(answerDefsStr, "#").forEach((zoneDef) => {
					const firstColonIndex = zoneDef.indexOf(":");
					if (firstColonIndex === -1)
						throw new Error(
							`Invalid DND zone definition: "${zoneDef}". Expected "zone_name:item1|item2".`,
						);

					const zoneName = zoneDef
						.substring(0, firstColonIndex)
						.trim();
					const itemsInZoneStr = zoneDef
						.substring(firstColonIndex + 1)
						.trim();
					const itemsInZone = cleanArray(itemsInZoneStr);

					if (zoneName) {
						dropZones.push(zoneName);
						answerMap[zoneName] = itemsInZone;
					}
				});

				if (dropZones.length === 0) {
					throw new Error(
						"No valid drop zones found in 'correctAnswer' for DND.",
					);
				}

				return { ...base, draggableItems, dropZones, answerMap };
			}
			default:
				throw new Error(
					`Unsupported questionTypeCode "${questionTypeCode}" in TSV.`,
				);
		}
	}

	private static createQuestionFromRawObject(rawQ: any): QuizQuestion {
		const baseQuestionData = {
			id: generateUniqueId(rawQ.questionTypeCode),
			code: rawQ.code,
			prompt: rawQ.prompt,
			questionTypeCode: rawQ.questionTypeCode as QuestionTypeStrings,
			points: rawQ.points,
			explanation: rawQ.explanation,
			difficultyCode: rawQ.difficultyCode,
		} as any;

		const meta: BaseQuestion["meta"] = {};
		if (rawQ.learningObjectiveCodes?.length)
			meta.learningObjectiveCodes = rawQ.learningObjectiveCodes;
		if (rawQ.conceptCodes?.length) meta.conceptCodes = rawQ.conceptCodes;
		if (rawQ.topicCodes?.length) meta.topicCodes = rawQ.topicCodes;
		if (rawQ.categoryCodes?.length) meta.categoryCodes = rawQ.categoryCodes;
		if (rawQ.subjectCodes?.length) meta.subjectCodes = rawQ.subjectCodes;
		if (rawQ.fieldCodes?.length) meta.fieldCodes = rawQ.fieldCodes;
		if (rawQ.gradeLevelCodes?.length)
			meta.gradeLevelCodes = rawQ.gradeLevelCodes;
		if (rawQ.bloomLevelCode) meta.bloomLevelCode = rawQ.bloomLevelCode;
		if (rawQ.contextCode) meta.contextCode = rawQ.contextCode;
		if (rawQ.knowledgeDimensionCode)
			meta.knowledgeDimensionCode = rawQ.knowledgeDimensionCode;
		if (Object.keys(meta).length > 0) baseQuestionData.meta = meta;

		switch (rawQ.questionTypeCode) {
			case "MULTIPLE_CHOICE": {
				const options = rawQ.options.map((text: string) => ({
					id: generateUniqueId("opt_"),
					text: text.trim(),
				}));
				const correctOption = options.find(
					(opt: { text: string }) =>
						opt.text === rawQ.correctAnswer.trim(),
				);
				if (!correctOption)
					throw new Error(
						`Correct answer "${rawQ.correctAnswer}" not found in options.`,
					);
				return {
					...baseQuestionData,
					options,
					correctAnswerId: correctOption.id,
				} as MultipleChoiceQuestion;
			}
			case "MULTIPLE_RESPONSE": {
				const options = rawQ.options.map((text: string) => ({
					id: generateUniqueId("opt_mr_"),
					text: text.trim(),
				}));
				const correctAnswersTrimmed = rawQ.correctAnswers.map(
					(c: string) => c.trim(),
				);
				const correctIds = options
					.filter((opt: { text: string }) =>
						correctAnswersTrimmed.includes(opt.text),
					)
					.map((opt: { id: string }) => opt.id);
				if (correctIds.length !== correctAnswersTrimmed.length)
					throw new Error(
						"Some correct answers were not found in options.",
					);
				return {
					...baseQuestionData,
					options,
					correctAnswerIds: correctIds,
				} as MultipleResponseQuestion;
			}
			case "TRUE_FALSE":
				return {
					...baseQuestionData,
					correctAnswer: rawQ.correctAnswer,
				} as TrueFalseQuestion;
			case "SHORT_ANSWER":
				return {
					...baseQuestionData,
					acceptedAnswers: rawQ.acceptedAnswers,
					isCaseSensitive: false,
				} as ShortAnswerQuestion;
			case "NUMERIC":
				return {
					...baseQuestionData,
					answer: rawQ.answer,
					tolerance: rawQ.tolerance,
				} as NumericQuestion;
			case "SEQUENCE": {
				if (rawQ.items.length !== rawQ.correctOrder.length)
					throw new Error(
						"The number of items must match the number of items in the correct order.",
					);
				const items = rawQ.items.map((content: string) => ({
					id: generateUniqueId("seqi_"),
					content: content.trim(),
				}));
				const correctOrderTrimmed = rawQ.correctOrder.map((c: string) =>
					c.trim(),
				);
				const correctOrder = correctOrderTrimmed.map(
					(orderText: string) => {
						const foundItem = items.find(
							(item: { content: string }) =>
								item.content === orderText,
						);
						if (!foundItem)
							throw new Error(
								`Sequence item "${orderText}" in correctOrder not found in items list.`,
							);
						return foundItem.id;
					},
				);
				return {
					...baseQuestionData,
					items,
					correctOrder,
				} as SequenceQuestion;
			}
			case "MATCHING": {
				const prompts = rawQ.prompts.map((p: string) => ({
					id: generateUniqueId("matp_"),
					content: p.trim(),
				}));
				const options = rawQ.options.map((o: string) => ({
					id: generateUniqueId("mato_"),
					content: o.trim(),
				}));
				const correctAnswerMap = Object.entries(
					rawQ.correctAnswerMap,
				).map(([promptText, optionText]) => {
					const prompt = prompts.find(
						(p: { content: string }) =>
							p.content === (promptText as string).trim(),
					);
					const option = options.find(
						(o: { content: string }) =>
							o.content === (optionText as string).trim(),
					);
					if (!prompt || !option)
						throw new Error(
							`Matching pair "${promptText}":"${optionText}" not found in prompts/options.`,
						);
					return { promptId: prompt.id, optionId: option.id };
				});
				return {
					...baseQuestionData,
					prompts,
					options,
					correctAnswerMap,
					shuffleOptions: true,
				} as MatchingQuestion;
			}
			case "FILL_IN_THE_BLANKS": {
				const { sentenceWithPlaceholders, blanks } = rawQ;
				const segments: FillInTheBlanksQuestion["segments"] = [];
				const answers: FillInTheBlanksQuestion["answers"] = [];
				const placeholderMap: Record<string, string> = {};

				Object.keys(blanks).forEach((placeholder) => {
					const blankId = generateUniqueId("blank_");
					placeholderMap[placeholder] = blankId;
					answers.push({
						blankId,
						acceptedValues: blanks[placeholder].acceptedValues,
						options: blanks[placeholder].options,
					});
				});

				const regex = /\{\{([^}]+)\}\}/g;
				let lastIndex = 0;
				let match;
				while (
					(match = regex.exec(sentenceWithPlaceholders)) !== null
				) {
					if (match.index > lastIndex) {
						segments.push({
							type: "text",
							content: sentenceWithPlaceholders.substring(
								lastIndex,
								match.index,
							),
						});
					}
					const placeholder = match[1].trim();
					const blankId = placeholderMap[placeholder];
					if (!blankId)
						throw new Error(
							`Placeholder "{{${placeholder}}}" found in sentence but not defined in blanks definition.`,
						);
					segments.push({ type: "blank", id: blankId });
					lastIndex = regex.lastIndex;
				}
				if (lastIndex < sentenceWithPlaceholders.length) {
					segments.push({
						type: "text",
						content: sentenceWithPlaceholders.substring(lastIndex),
					});
				}

				return {
					...baseQuestionData,
					segments,
					answers,
					isCaseSensitive: false,
				} as FillInTheBlanksQuestion;
			}
			case "DRAG_AND_DROP": {
				const {
					draggableItems: rawDraggableItems,
					dropZones: rawDropZones,
					answerMap: rawAnswerMap,
				} = rawQ;

				const draggableItems = rawDraggableItems.map(
					(content: string) => ({
						id: generateUniqueId("drag_"),
						content: content.trim(),
					}),
				);
				const dropZones = rawDropZones.map((label: string) => ({
					id: generateUniqueId("zone_"),
					label: label.trim(),
				}));

				const answerMap = dropZones.flatMap(
					(zone: { label: string; id: string }) => {
						const itemsForThisZone = rawAnswerMap[zone.label] || [];
						return itemsForThisZone.map((itemContent: string) => {
							const draggableItem = draggableItems.find(
								(d: { content: string }) =>
									d.content === itemContent,
							);
							if (!draggableItem)
								throw new Error(
									`Draggable item "${itemContent}" defined in answerMap not found in the main item list.`,
								);
							return {
								draggableId: draggableItem.id,
								dropZoneId: zone.id,
							};
						});
					},
				);

				return {
					...baseQuestionData,
					draggableItems,
					dropZones,
					answerMap,
				} as DragAndDropQuestion;
			}
			default:
				throw new Error(
					`Unhandled question type in createQuestionFromRawObject: ${(rawQ as any).questionTypeCode}`,
				);
		}
	}
}
