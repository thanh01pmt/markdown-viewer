# Canonical Question Payloads

## FILL_IN_THE_BLANKS
The interactive-quiz-kit standardizes on the following format for Fill-in-the-Blanks questions:
```typescript
{
  questionTypeCode: 'FILL_IN_THE_BLANKS',
  prompt: string,
  segments: Array<{ type: 'text' | 'blank', content?: string, id?: string }>,
  answers: Array<{ blankId: string, acceptedValues: string[], options?: string[] }>,
  isCaseSensitive?: boolean
}
```
*Note: Legacy TSV formats using `sentenceWithPlaceholders` and `blanks` map are automatically normalized by `adaptLegacyQuestion` at the UI layer.*

## DRAG_AND_DROP
The interactive-quiz-kit standardizes on the following format for Drag-and-Drop questions:
```typescript
{
  questionTypeCode: 'DRAG_AND_DROP',
  prompt: string,
  draggableItems: Array<{ id: string, content: string }>,
  dropZones: Array<{ id: string, label: string }>,
  answerMap: Array<{ draggableId: string, dropZoneId: string }>
}
```
*Note: Legacy formats passing primitive string arrays for `draggableItems` or `dropZones` are automatically normalized by `adaptLegacyQuestion` at the UI layer to generate unique identifiers and structurally safe `answerMap` entries.*
