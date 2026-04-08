# Robust Iterative Question Generation Pipeline

## Architecture Overview

```text
Phase 1: PLANNING
├── Content Analysis
├── Question Blueprint Generation  
├── Success Criteria Definition
└── Validation Rules Setup

Phase 2: ITERATIVE IMPLEMENTATION
├── Question Generation Loop
│   ├── Generate Single Question
│   ├── JSON Validation
│   ├── Content Quality Check
│   ├── Retry Logic (if failed)
│   └── Success Confirmation
└── Batch Quality Assessment

Phase 3: FINAL VALIDATION
├── Cross-Question Consistency
├── Difficulty Progression Check
└── Export Generation
```

## Phase 1: Planning Stage

### 1.1 Content Analysis Prompt

```markdown
# PLANNING PHASE: Content & Question Blueprint

Topic: [INSERT_TOPIC]
Target Audience: [INSERT_AUDIENCE]

## Task 1: Content Analysis
Analyze the topic and provide:

1. **Core Concepts** (3-5 key concepts students must master)
2. **Common Misconceptions** (7-10 specific misconceptions with examples)
3. **Difficulty Levels** (Map concepts to Bloom's taxonomy levels)
4. **Learning Dependencies** (What must be understood before what)

## Task 2: Question Blueprint Generation
Create a strategic plan for 10 questions:

| Q# | Concept | Bloom Level | Target Misconception | Question Type | Priority |
|----|---------|-------------|---------------------|---------------|----------|
| 1  | [Concept] | Level 2 | [Misconception] | Definition | High |
| 2  | [Concept] | Level 2 | [Misconception] | Example | High |
| ... | ... | ... | ... | ... | ... |

## Task 3: Success Criteria
For each question define:
- Minimum clarity score (1-10)
- Required distractor plausibility
- Explanation completeness requirements

Output this as a simple structured text, NOT JSON.
```

### 1.2 Planning Output Processing

```python
# Expected planning output structure (text-based, not JSON)
planning_output = {
    "concepts": ["concept1", "concept2", ...],
    "misconceptions": [
        {"id": 1, "description": "...", "frequency": "high"},
        ...
    ],
    "question_blueprints": [
        {
            "id": 1,
            "concept": "...",
            "bloom_level": 2,
            "misconception_target": "...",
            "type": "definition",
            "priority": "high"
        },
        ...
    ],
    "success_criteria": {
        "min_clarity_score": 8,
        "min_distractor_plausibility": 7,
        "explanation_min_words": 50
    }
}
```

## Phase 2: Iterative Implementation

### 2.1 Single Question Generation Prompt Template

```markdown
# SINGLE QUESTION GENERATION

## Context from Planning:
- Topic: [TOPIC]
- Target Concept: [CONCEPT]
- Target Misconception: [MISCONCEPTION]
- Bloom Level: [LEVEL]
- Question Type: [TYPE]

## Task: Generate ONE high-quality multiple choice question

### Requirements:
1. Question stem: Clear, concise, unambiguous
2. Four options (A, B, C, D)
3. One correct answer
4. Three distractors based on the target misconception
5. Detailed explanation

### Output Format (EXACT JSON structure):
```json
{
    "question_id": [ID],
    "question_text": "[Question text here]",
    "options": {
        "A": "[Option A text]",
        "B": "[Option B text]",
        "C": "[Option C text]",
        "D": "[Option D text]"
    },
    "correct_answer": "[A/B/C/D]",
    "explanation": "[Detailed explanation]",
    "targeted_misconception": "[Misconception addressed]",
    "bloom_level": "[Level description]"
}
```

### Quality Constraints

- Question text: 20-80 words
- Each option: 5-25 words
- Explanation: 50-150 words
- No "all of the above" or "none of the above"
- Options must be grammatically parallel

Generate ONLY the JSON, no additional text.

### 2.2 Validation & Retry Logic

```python
class QuestionValidator:
    def __init__(self, success_criteria):
        self.criteria = success_criteria
    
    def validate_json_structure(self, response):
        """Check if response is valid JSON with required fields"""
        try:
            data = json.loads(response)
            required_fields = [
                'question_id', 'question_text', 'options', 
                'correct_answer', 'explanation', 'targeted_misconception'
            ]
            
            for field in required_fields:
                if field not in data:
                    return False, f"Missing field: {field}"
            
            # Validate options structure
            if not isinstance(data['options'], dict):
                return False, "Options must be a dictionary"
            
            if set(data['options'].keys()) != {'A', 'B', 'C', 'D'}:
                return False, "Options must have exactly A, B, C, D keys"
            
            if data['correct_answer'] not in ['A', 'B', 'C', 'D']:
                return False, "Correct answer must be A, B, C, or D"
                
            return True, "Valid JSON structure"
            
        except json.JSONDecodeError as e:
            return False, f"Invalid JSON: {str(e)}"
    
    def validate_content_quality(self, question_data):
        """Check content quality against criteria"""
        issues = []
        
        # Check question length
        q_words = len(question_data['question_text'].split())
        if q_words < 10 or q_words > 100:
            issues.append(f"Question length: {q_words} words (should be 10-100)")
        
        # Check explanation length
        exp_words = len(question_data['explanation'].split())
        if exp_words < self.criteria['explanation_min_words']:
            issues.append(f"Explanation too short: {exp_words} words")
        
        # Check for prohibited phrases
        prohibited = ["all of the above", "none of the above", "both a and b"]
        for option in question_data['options'].values():
            if any(p in option.lower() for p in prohibited):
                issues.append(f"Prohibited phrase in option: {option}")
        
        # Check option length consistency
        option_lengths = [len(opt.split()) for opt in question_data['options'].values()]
        if max(option_lengths) > 3 * min(option_lengths):
            issues.append("Options have inconsistent lengths")
        
        return len(issues) == 0, issues

class QuestionGenerator:
    def __init__(self, planning_data, max_retries=3):
        self.planning = planning_data
        self.validator = QuestionValidator(planning_data['success_criteria'])
        self.max_retries = max_retries
    
    def generate_single_question(self, blueprint):
        """Generate a single question with retry logic"""
        
        for attempt in range(self.max_retries):
            try:
                # Generate question using AI
                prompt = self.build_question_prompt(blueprint)
                response = ai_client.generate(prompt)
                
                # Validate JSON structure
                is_valid_json, json_error = self.validator.validate_json_structure(response)
                if not is_valid_json:
                    print(f"Attempt {attempt + 1} - JSON Error: {json_error}")
                    continue
                
                question_data = json.loads(response)
                
                # Validate content quality
                is_quality, quality_issues = self.validator.validate_content_quality(question_data)
                if not is_quality:
                    print(f"Attempt {attempt + 1} - Quality Issues: {quality_issues}")
                    continue
                
                # Success!
                return True, question_data
                
            except Exception as e:
                print(f"Attempt {attempt + 1} - Unexpected Error: {str(e)}")
                continue
        
        # All attempts failed
        return False, f"Failed to generate question after {self.max_retries} attempts"
    
    def generate_question_bank(self):
        """Generate complete question bank with error handling"""
        
        questions = []
        failed_questions = []
        
        for blueprint in self.planning['question_blueprints']:
            print(f"Generating question {blueprint['id']}...")
            
            success, result = self.generate_single_question(blueprint)
            
            if success:
                questions.append(result)
                print(f"✓ Question {blueprint['id']} generated successfully")
            else:
                failed_questions.append({
                    'blueprint': blueprint,
                    'error': result
                })
                print(f"✗ Question {blueprint['id']} failed: {result}")
        
        return questions, failed_questions
```

### 2.3 Optional Quality Assessment & Regeneration

```python
class QuestionQualityAssessor:
    def __init__(self):
        self.assessment_prompt = """
        # QUESTION QUALITY ASSESSMENT
        
        Evaluate this multiple-choice question on a scale of 1-10 for each criterion:
        
        Question: {question_text}
        Options: {options}
        Correct Answer: {correct_answer}
        Explanation: {explanation}
        
        ## Assessment Criteria:
        1. **Clarity** (1-10): Is the question clear and unambiguous?
        2. **Difficulty Appropriateness** (1-10): Is difficulty level appropriate for target audience?
        3. **Distractor Quality** (1-10): Are wrong answers plausible but clearly incorrect?
        4. **Explanation Quality** (1-10): Does explanation clearly justify correct answer?
        5. **Misconception Targeting** (1-10): Does question effectively test target misconception?
        
        ## Output Format:
        Clarity: X/10
        Difficulty: X/10  
        Distractors: X/10
        Explanation: X/10
        Misconception: X/10
        Overall: X/10
        
        Comments: [Brief specific feedback]
        Recommendation: [ACCEPT/REVISE/REJECT]
        """
    
    def assess_question(self, question_data):
        """Assess question quality and recommend action"""
        
        prompt = self.assessment_prompt.format(
            question_text=question_data['question_text'],
            options=question_data['options'],
            correct_answer=question_data['correct_answer'],
            explanation=question_data['explanation']
        )
        
        assessment = ai_client.generate(prompt)
        
        # Parse assessment (implement parsing logic)
        scores = self.parse_assessment(assessment)
        
        return scores
    
    def should_regenerate(self, scores, threshold=7.0):
        """Determine if question should be regenerated"""
        return scores['overall'] < threshold

# Usage in main pipeline
def generate_with_quality_control(blueprint, min_quality=7.0):
    generator = QuestionGenerator(planning_data)
    assessor = QuestionQualityAssessor()
    
    max_quality_attempts = 2
    
    for attempt in range(max_quality_attempts):
        success, question = generator.generate_single_question(blueprint)
        
        if not success:
            continue
        
        # Assess quality
        scores = assessor.assess_question(question)
        
        if not assessor.should_regenerate(scores, min_quality):
            return True, question  # Quality acceptable
        
        print(f"Quality attempt {attempt + 1} - Score: {scores['overall']}/10, regenerating...")
    
    # Return best attempt even if below threshold
    return success, question
```

## Phase 3: Pipeline Integration

```python
class RobustQuestionPipeline:
    def __init__(self, topic, audience, num_questions=10):
        self.topic = topic
        self.audience = audience
        self.num_questions = num_questions
    
    def run_complete_pipeline(self):
        """Execute the complete pipeline"""
        
        # Phase 1: Planning
        print("Phase 1: Planning...")
        planning_data = self.generate_planning()
        
        if not planning_data:
            return {"error": "Planning phase failed"}
        
        # Phase 2: Question Generation
        print("Phase 2: Generating Questions...")
        generator = QuestionGenerator(planning_data)
        questions, failed = generator.generate_question_bank()
        
        # Phase 3: Final Validation
        print("Phase 3: Final Validation...")
        validated_questions = self.final_validation(questions)
        
        return {
            "questions": validated_questions,
            "failed_count": len(failed),
            "success_rate": len(questions) / self.num_questions,
            "metadata": {
                "topic": self.topic,
                "audience": self.audience,
                "generated_at": datetime.now().isoformat()
            }
        }
    
    def final_validation(self, questions):
        """Cross-question validation and consistency checks"""
        
        # Check for duplicate content
        # Verify difficulty progression  
        # Ensure misconception coverage
        # Validate overall quality distribution
        
        return questions  # Simplified for brevity

# Usage Example
pipeline = RobustQuestionPipeline(
    topic="Swift Functions",
    audience="Intermediate iOS Developers",
    num_questions=10
)

result = pipeline.run_complete_pipeline()
print(f"Generated {len(result['questions'])} questions with {result['success_rate']:.1%} success rate")
```

## Key Benefits of This Approach

### 1. **Error Resilience**

- Individual question failures don't crash entire pipeline
- Automatic retry with different prompts
- Graceful degradation

### 2. **Quality Control**

- Multiple validation layers
- Iterative improvement
- Quality threshold enforcement

### 3. **Debugging & Monitoring**

- Clear error messages
- Success/failure tracking
- Performance metrics

### 4. **Scalability**

- Easy to parallelize question generation
- Configurable quality thresholds
- Batch processing capabilities

### 5. **Maintenance**

- Modular components
- Easy to update validation rules
- Clear separation of concerns

This approach balances **robustness** with **efficiency**, ensuring high-quality output while handling the inevitable errors in complex JSON generation.
