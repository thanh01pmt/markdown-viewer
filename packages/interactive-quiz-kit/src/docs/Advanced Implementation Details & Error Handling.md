# Advanced Implementation Details & Error Handling

## 1. Smart Prompt Variation for Retries

class PromptVariationManager:
    """Generate different prompt variations for retry attempts"""

    def __init__(self):
        self.base_templates = {
            "standard": """Generate a multiple choice question about {concept}...""",
            "detailed": """Create a comprehensive multiple choice question focusing on {concept}. 
                          Be extra careful about JSON formatting...""",
            "simple": """Write one clear multiple choice question about {concept}. 
                        Keep it simple and well-formatted...""",
            "example_driven": """Following this example format, create a question about {concept}:
                               [Include perfect example here]..."""
        }
        
        self.format_emphasis = [
            "Pay special attention to JSON formatting.",
            "Ensure all quotes are properly escaped in JSON.",
            "Double-check that your JSON structure is valid.",
            "Use proper JSON syntax with no trailing commas."
        ]
    
    def get_variation(self, blueprint, attempt_number):
        """Get different prompt variation based on attempt number"""
        
        if attempt_number == 0:
            template_key = "standard"
        elif attempt_number == 1:
            template_key = "detailed"  
        else:
            template_key = "simple"
        
        base_prompt = self.base_templates[template_key]
        format_emphasis = self.format_emphasis[attempt_number % len(self.format_emphasis)]
        
        return f"{base_prompt}\n\n{format_emphasis}"

## 2. Advanced JSON Validation & Repair

import re
import json

class SmartJSONValidator:
    """Advanced JSON validation with automatic repair attempts"""

    def __init__(self):
        self.common_fixes = [
            self.fix_trailing_commas,
            self.fix_unescaped_quotes,
            self.fix_missing_quotes,
            self.fix_malformed_structure
        ]
    
    def validate_and_repair(self, response_text):
        """Try to validate JSON, attempt repairs if invalid"""
        
        # First, try direct parsing
        try:
            return True, json.loads(response_text), "Valid JSON"
        except json.JSONDecodeError as e:
            original_error = str(e)
        
        # Try automated repairs
        for i, fix_function in enumerate(self.common_fixes):
            try:
                repaired = fix_function(response_text)
                data = json.loads(repaired)
                return True, data, f"Repaired with fix #{i+1}"
            except:
                continue
        
        return False, None, f"All repair attempts failed. Original error: {original_error}"
    
    def fix_trailing_commas(self, text):
        """Remove trailing commas before } and ]"""
        text = re.sub(r',(\s*[}\]])', r'\1', text)
        return text
    
    def fix_unescaped_quotes(self, text):
        """Escape unescaped quotes in values"""
        # This is complex - simplified version
        lines = text.split('\n')
        fixed_lines = []
        
        for line in lines:
            if '": "' in line and line.count('"') > 4:
                # Likely has unescaped quotes in value
                parts = line.split('": "', 1)
                if len(parts) == 2:
                    key_part = parts[0] + '": "'
                    value_part = parts[1]
                    
                    # Find the closing quote
                    if value_part.endswith('",') or value_part.endswith('"'):
                        closing = value_part[-2:] if value_part.endswith('",') else value_part[-1:]
                        middle = value_part[:-len(closing)]
                        
                        # Escape quotes in middle
                        middle = middle.replace('"', '\\"')
                        line = key_part + middle + closing
            
            fixed_lines.append(line)
        
        return '\n'.join(fixed_lines)
    
    def fix_missing_quotes(self, text):
        """Add missing quotes around keys"""
        # Replace unquoted keys
        text = re.sub(r'(\n\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:', r'\1"\2":', text)
        return text
    
    def fix_malformed_structure(self, text):
        """Try to extract JSON from markdown or other formatting"""
        
        # Remove markdown code blocks
        text = re.sub(r'```json\n?', '', text)
        text = re.sub(r'```\n?', '', text)
        
        # Remove leading/trailing whitespace
        text = text.strip()
        
        # Try to find JSON object boundaries
        start = text.find('{')
        end = text.rfind('}') + 1
        
        if start >= 0 and end > start:
            return text[start:end]
        
        return text

## 3. Intelligent Retry Strategy

class IntelligentRetryManager:
    """Manages retry attempts with adaptive strategies"""

    def __init__(self, max_retries=3):
        self.max_retries = max_retries
        self.prompt_manager = PromptVariationManager()
        self.json_validator = SmartJSONValidator()
        
    def generate_with_smart_retry(self, blueprint, ai_client, base_prompt_builder):
        """Generate question with intelligent retry strategy"""
        
        attempt_history = []
        
        for attempt in range(self.max_retries):
            
            # Get appropriate prompt variation for this attempt
            prompt = self.prompt_manager.get_variation(blueprint, attempt)
            
            try:
                # Generate response
                response = ai_client.generate(prompt)
                
                # Try to validate and repair JSON
                is_valid, data, repair_info = self.json_validator.validate_and_repair(response)
                
                if is_valid:
                    # Additional content validation
                    content_valid, content_issues = self.validate_content(data, blueprint)
                    
                    if content_valid:
                        return True, data, {
                            'attempts': attempt + 1,
                            'repair_info': repair_info,
                            'final_strategy': f'variation_{attempt}'
                        }
                    else:
                        attempt_history.append({
                            'attempt': attempt + 1,
                            'error_type': 'content_validation',
                            'issues': content_issues
                        })
                else:
                    attempt_history.append({
                        'attempt': attempt + 1,
                        'error_type': 'json_validation',
                        'error': repair_info
                    })
                    
            except Exception as e:
                attempt_history.append({
                    'attempt': attempt + 1,
                    'error_type': 'generation_error',
                    'error': str(e)
                })
        
        # All attempts failed
        return False, None, {
            'attempts': self.max_retries,
            'attempt_history': attempt_history,
            'final_error': 'All retry strategies exhausted'
        }
    
    def validate_content(self, data, blueprint):
        """Validate content quality and requirements"""
        issues = []
        
        # Check required fields
        required_fields = ['question_text', 'options', 'correct_answer', 'explanation']
        for field in required_fields:
            if field not in data or not data[field]:
                issues.append(f"Missing or empty field: {field}")
        
        # Check options structure
        if 'options' in data:
            if not isinstance(data['options'], dict):
                issues.append("Options must be a dictionary")
            elif set(data['options'].keys()) != {'A', 'B', 'C', 'D'}:
                issues.append("Options must have exactly A, B, C, D keys")
        
        # Check correct answer
        if 'correct_answer' in data:
            if data['correct_answer'] not in ['A', 'B', 'C', 'D']:
                issues.append("Correct answer must be A, B, C, or D")
        
        # Content quality checks
        if 'question_text' in data:
            if len(data['question_text'].split()) < 5:
                issues.append("Question text too short")
        
        return len(issues) == 0, issues

## 4. Comprehensive Pipeline with Monitoring

class MonitoredQuestionPipeline:
    """Pipeline with comprehensive monitoring and reporting"""

    def __init__(self, topic, audience, config=None):
        self.topic = topic
        self.audience = audience
        self.config = config or self.default_config()
        
        self.retry_manager = IntelligentRetryManager(
            max_retries=self.config['max_retries']
        )
        
        self.metrics = {
            'start_time': None,
            'end_time': None,
            'total_attempts': 0,
            'successful_generations': 0,
            'failed_generations': 0,
            'repair_attempts': 0,
            'successful_repairs': 0
        }
    
    def default_config(self):
        return {
            'max_retries': 3,
            'quality_threshold': 7.0,
            'enable_quality_assessment': True,
            'parallel_generation': False,
            'save_failed_attempts': True
        }
    
    def run_monitored_pipeline(self):
        """Run pipeline with comprehensive monitoring"""
        
        self.metrics['start_time'] = time.time()
        
        try:
            # Phase 1: Planning
            planning_result = self.planning_phase()
            if not planning_result['success']:
                return self.create_error_response("Planning phase failed", planning_result)
            
            # Phase 2: Generation
            generation_result = self.generation_phase(planning_result['data'])
            
            # Phase 3: Final validation and assembly
            final_result = self.finalization_phase(generation_result)
            
            self.metrics['end_time'] = time.time()
            
            return self.create_success_response(final_result)
            
        except Exception as e:
            self.metrics['end_time'] = time.time()
            return self.create_error_response(f"Pipeline error: {str(e)}", {'exception': e})
    
    def generation_phase(self, planning_data):
        """Generation phase with detailed monitoring"""
        
        questions = []
        failed_questions = []
        generation_details = []
        
        for blueprint in planning_data['question_blueprints']:
            
            self.metrics['total_attempts'] += 1
            
            success, result, details = self.retry_manager.generate_with_smart_retry(
                blueprint, 
                ai_client, 
                self.build_question_prompt
            )
            
            generation_details.append({
                'question_id': blueprint['id'],
                'success': success,
                'attempts_used': details.get('attempts', 0),
                'repair_info': details.get('repair_info', 'none'),
                'strategy': details.get('final_strategy', 'unknown')
            })
            
            if success:
                questions.append(result)
                self.metrics['successful_generations'] += 1
                
                if details.get('repair_info') != 'Valid JSON':
                    self.metrics['repair_attempts'] += 1
                    self.metrics['successful_repairs'] += 1
                    
            else:
                failed_questions.append({
                    'blueprint': blueprint,
                    'error_details': details
                })
                self.metrics['failed_generations'] += 1
        
        return {
            'questions': questions,
            'failed_questions': failed_questions,
            'generation_details': generation_details
        }
    
    def create_success_response(self, result):
        """Create comprehensive success response"""
        
        duration = self.metrics['end_time'] - self.metrics['start_time']
        success_rate = (self.metrics['successful_generations'] / 
                       max(self.metrics['total_attempts'], 1))
        
        return {
            'status': 'success',
            'questions': result['questions'],
            'metadata': {
                'topic': self.topic,
                'audience': self.audience,
                'generation_time': duration,
                'success_rate': success_rate,
                'total_questions': len(result['questions']),
                'failed_questions': len(result.get('failed_questions', [])),
                'repair_success_rate': (self.metrics['successful_repairs'] / 
                                      max(self.metrics['repair_attempts'], 1))
            },
            'diagnostics': {
                'generation_details': result.get('generation_details', []),
                'config_used': self.config,
                'metrics': self.metrics
            }
        }

## 5. Usage Example

if **name** == "**main**":

    # Configure pipeline
    config = {
        'max_retries': 4,
        'quality_threshold': 7.5,
        'enable_quality_assessment': True,
        'save_failed_attempts': True
    }
    
    # Create and run pipeline
    pipeline = MonitoredQuestionPipeline(
        topic="Swift Functions and Closures",
        audience="iOS Developer Certification Exam",
        config=config
    )
    
    result = pipeline.run_monitored_pipeline()
    
    if result['status'] == 'success':
        print(f"✓ Generated {result['metadata']['total_questions']} questions")
        print(f"✓ Success rate: {result['metadata']['success_rate']:.1%}")
        print(f"✓ Generation time: {result['metadata']['generation_time']:.1f}s")
        
        # Save results
        with open('generated_questions.json', 'w') as f:
            json.dump(result['questions'], f, indent=2, ensure_ascii=False)
            
        # Save diagnostics
        with open('generation_diagnostics.json', 'w') as f:
            json.dump(result['diagnostics'], f, indent=2, ensure_ascii=False)
            
    else:
        print(f"✗ Pipeline failed: {result['error']}")
        print(f"✗ Details: {result.get('details', 'No additional details')}")
