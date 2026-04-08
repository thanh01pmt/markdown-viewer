export interface ActivityStep {
  step_number: number;
  instruction: string;
  hint?: string;
}

export interface Activity {
  activity_id: string;
  title: string;
  type: string;
  duration_minutes: number;
  instructions: string;
  materials_needed?: string[];
  success_criteria?: string[];
  learning_objectives?: string[];
  steps?: ActivityStep[];
  solution_guide?: string;
}

export interface ActivityData {
  activities: Activity[];
}

export function parseActivityContent(content: string): ActivityData {
  const lines = content.split('\n');
  const activities: Activity[] = [];
  
  let currentActivity: Partial<Activity> = {};
  let currentList: string[] | null = null;
  let currentStep: Partial<ActivityStep> | null = null;
  let inSteps = false;
  let lastKey: string | null = null;

  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;

    if (line.match(/^###\s+Activity/i) || line.match(/^###\s+Item/i)) {
      if (currentActivity.title) {
        if (currentStep && (currentStep.step_number || currentStep.instruction)) {
           if (!currentActivity.steps) currentActivity.steps = [];
           currentActivity.steps.push(currentStep as ActivityStep);
        }
        activities.push(currentActivity as Activity);
      }
      currentActivity = {};
      currentList = null;
      currentStep = null;
      inSteps = false;
      lastKey = null;
      return;
    }

    const kvMatch = line.match(/^[-*]\s+\*\*(.+?):\s*\*\*\s*(.*)$/);
    if (kvMatch) {
      const key = kvMatch[1].toLowerCase();
      const value = kvMatch[2].trim();
      
      if (key === 'steps') {
        inSteps = true;
        currentList = null;
        lastKey = null;
        return;
      }

      if (inSteps) {
         if (key === 'step' || key === 'instruction' || key === 'hint') {
            let startNew = false;
            if (!currentStep) startNew = true;
            else {
                if (key === 'step' && currentStep.step_number !== undefined) startNew = true;
                if (key === 'hint' && (currentStep.hint || currentStep.instruction || currentStep.step_number)) startNew = true;
                if (key === 'instruction' && currentStep.instruction) startNew = true;
            }

            if (startNew) {
                if (currentStep && (currentStep.step_number || currentStep.instruction)) {
                    if (!currentActivity.steps) currentActivity.steps = [];
                    currentActivity.steps.push(currentStep as ActivityStep);
                }
                currentStep = {};
            }
            
            if (currentStep) {
                if (key === 'step') currentStep.step_number = parseInt(value);
                else if (key === 'instruction') currentStep.instruction = value;
                else if (key === 'hint') currentStep.hint = value;
            }
            lastKey = key;
            return;
         } else {
            if (currentStep && (currentStep.step_number || currentStep.instruction)) {
                if (!currentActivity.steps) currentActivity.steps = [];
                currentActivity.steps.push(currentStep as ActivityStep);
            }
            currentStep = null;
            inSteps = false;
         }
      }

      currentList = null;
      lastKey = null;

      if (key === 'id') currentActivity.activity_id = value;
      else if (key === 'title') currentActivity.title = value;
      else if (key === 'type') currentActivity.type = value.toLowerCase();
      else if (key === 'duration') currentActivity.duration_minutes = parseInt(value) || 0;
      else if (key === 'instructions') currentActivity.instructions = value;
      else if (key === 'solution guide') {
        currentActivity.solution_guide = value;
        lastKey = 'solution_guide';
      }
      else if (key === 'materials needed' || key === 'materials') {
        currentActivity.materials_needed = [];
        currentList = currentActivity.materials_needed;
      }
      else if (key === 'success criteria') {
        currentActivity.success_criteria = [];
        currentList = currentActivity.success_criteria;
      }
      else if (key === 'learning objectives') {
        currentActivity.learning_objectives = [];
        currentList = currentActivity.learning_objectives;
      }
      return;
    }

    if (currentList) {
      const listMatch = line.match(/^\s*[-*]\s+(.+)$/);
      if (listMatch) {
        currentList.push(listMatch[1].trim());
      }
    }
    
    if (lastKey === 'solution_guide' && currentActivity.solution_guide) {
        if (!line.match(/^###/) && !kvMatch) {
             currentActivity.solution_guide += '\n' + trimmed;
        }
    } else if (inSteps && currentStep && lastKey) {
        if (lastKey === 'instruction' && currentStep.instruction) currentStep.instruction += '\n' + trimmed;
        else if (lastKey === 'hint' && currentStep.hint) currentStep.hint += '\n' + trimmed;
    } else if (currentActivity.instructions && !kvMatch && !currentList && !line.match(/^###/) && !inSteps) {
       currentActivity.instructions += '\n' + trimmed;
    }
  });

  if (currentActivity.title) {
    if (currentStep && ((currentStep as ActivityStep).step_number || (currentStep as ActivityStep).instruction)) {
        if (!currentActivity.steps) currentActivity.steps = [];
        currentActivity.steps.push(currentStep as ActivityStep);
    }
    activities.push(currentActivity as Activity);
  }

  return { activities };
}
