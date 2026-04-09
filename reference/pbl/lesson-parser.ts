export interface Section {
  title: string
  content: (string | ListItem | KeyValue)[]
  subsections: Section[]
  level: number
}

export interface ListItem {
  type: 'list-item'
  text: string
}

export interface KeyValue {
  type: 'key-value'
  key: string
  value: string | string[]
}

export interface LessonData {
  title: string
  duration: number
  overview: Section | null
  purpose: Section | null
  standards: Section | null
  agenda: Section | null
  objectives: Section | null
  preparation: Section | null
  links: Section | null
  vocabulary: Section | null
  teachingGuide: Section | null
  otherSections: Section[]
}

export function parseLessonContent(content: string | Record<string, unknown>, title?: string): LessonData | null {
  // Handle JSON Object Content
  if (typeof content === 'object' && content !== null) {
    const data: LessonData = {
      title: title || 'Untitled Lesson',
      duration: 0,
      overview: null,
      purpose: null,
      standards: null,
      agenda: null,
      objectives: null,
      preparation: null,
      links: null,
      vocabulary: null,
      teachingGuide: null,
      otherSections: []
    }

    // 1. Parse Overview Section
    const overview = content.overview as {
      objectives?: string[];
      materials?: string[];
      description?: string;
      intro?: string;
    } | undefined;
    if (overview) {
      // Objectives
      if (Array.isArray(overview.objectives)) {
        data.objectives = {
          title: 'Objectives',
          level: 1,
          subsections: [],
          content: overview.objectives.map((obj: string) => ({ type: 'list-item', text: obj }))
        }
      }

      // Materials / Preparation
      if (Array.isArray(overview.materials)) {
        data.preparation = {
          title: 'Preparation',
          level: 1,
          subsections: [],
          content: overview.materials.map((mat: string) => ({ type: 'list-item', text: mat }))
        }
      }

      // Other overview fields (description, etc)
      const overviewLines: string[] = []
      if (overview.description) overviewLines.push(overview.description)
      if (overview.intro) overviewLines.push(overview.intro)
      
      if (overviewLines.length > 0) {
        data.overview = {
          title: 'Overview',
          level: 1,
          subsections: [],
          content: overviewLines
        }
      }
    }

    // 2. Parse Timeline / Agenda
    if (Array.isArray(content.timeline)) {
      const timelineSection: Section = {
        title: 'Timeline',
        level: 1,
        content: [],
        subsections: content.timeline.map((phase: Record<string, unknown>) => {
          const subContent: (KeyValue | string)[] = []
          const phaseTyped = phase as {
            minutes?: unknown;
            student_action?: string | string[];
            teacher_action?: string | string[];
            resource_ref?: string | string[];
            phase?: string;
          };
          
          if (phaseTyped.minutes) subContent.push({ type: 'key-value', key: 'Minutes', value: String(phaseTyped.minutes) })
          if (phaseTyped.student_action) subContent.push({ type: 'key-value', key: 'Student Action', value: Array.isArray(phaseTyped.student_action) ? phaseTyped.student_action.join(', ') : phaseTyped.student_action })
          if (phaseTyped.teacher_action) subContent.push({ type: 'key-value', key: 'Teacher Action', value: Array.isArray(phaseTyped.teacher_action) ? phaseTyped.teacher_action.join(', ') : phaseTyped.teacher_action })
          if (phaseTyped.resource_ref) subContent.push({ type: 'key-value', key: 'Resource', value: Array.isArray(phaseTyped.resource_ref) ? phaseTyped.resource_ref.join(', ') : phaseTyped.resource_ref })
          
          return {
            title: (phaseTyped.phase || 'Untitled Phase') as string,
            level: 2,
            subsections: [],
            content: subContent
          }
        })
      }
      
      data.agenda = timelineSection
      data.teachingGuide = timelineSection
      
      // Calculate duration
      data.duration = content.timeline.reduce((acc: number, item: Record<string, unknown>) => acc + (Number(item.minutes) || 0), 0)
    }

    return data
  }

  if (typeof content !== 'string') return null

  // Handle Markdown String Content
  const lines = content.split('\n')
  const root: Section = { title: 'root', content: [], subsections: [], level: 0 }
  let currentSection: Section = root
  const sectionStack: Section[] = [root]

  lines.forEach(line => {
    const trimmed = line.trim()
    if (!trimmed) return

    // Headings (handle both # and ## formats, with or without extra spaces)
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/)
    if (headingMatch) {
      const level = headingMatch[1].length
      const title = headingMatch[2].trim()
      
      const newSection: Section = { title, content: [], subsections: [], level }
      
      while (sectionStack.length > 1 && sectionStack[sectionStack.length - 1].level >= level) {
        sectionStack.pop()
      }
      
      const parent = sectionStack[sectionStack.length - 1]
      parent.subsections.push(newSection)
      sectionStack.push(newSection)
      currentSection = newSection
      return
    }

    // Key-Value pairs (handle both - and * list markers, with flexible spacing)
    const kvMatch = line.match(/^[-*]\s+\*\*(.+?):\s*\*\*\s*(.*)$/)
    if (kvMatch) {
      const key = kvMatch[1].trim()
      const value = kvMatch[2].trim()
      currentSection.content.push({ type: 'key-value', key, value })
      return
    }

    // Indented text (continuation) - be more flexible with indentation
    if (line.match(/^[\s\t]+\S/)) {
      const lastItem = currentSection.content[currentSection.content.length - 1]
      if (lastItem && typeof lastItem !== 'string' && lastItem.type === 'key-value') {
        if (Array.isArray(lastItem.value)) {
          lastItem.value.push(trimmed)
        } else {
          lastItem.value = [lastItem.value, trimmed]
        }
        return
      }
    }

    // List items (handle both - and * markers, with flexible spacing)
    const listMatch = line.match(/^[-*]\s+(.+)$/)
    if (listMatch) {
      currentSection.content.push({ type: 'list-item', text: listMatch[1].trim() })
      return
    }

    // Plain text
    currentSection.content.push(trimmed)
  })

  // Map Sections to Slots
  const data: LessonData = {
    title: title || 'Untitled Lesson',
    duration: 0,
    overview: null,
    purpose: null,
    standards: null,
    agenda: null,
    objectives: null,
    preparation: null,
    links: null,
    vocabulary: null,
    teachingGuide: null,
    otherSections: []
  }

  // If the first subsection is an h1 (level 1) title, use its subsections instead
  // This handles markdown that starts with "# Lesson Plan"
  const sectionsToMap = root.subsections.length === 1 && root.subsections[0].level === 1
    ? root.subsections[0].subsections
    : root.subsections

  sectionsToMap.forEach(section => {
    const t = section.title.toLowerCase()
    if (t.includes('overview')) data.overview = section
    else if (t.includes('purpose')) data.purpose = section
    else if (t.includes('standard')) data.standards = section
    else if (t.includes('objective')) data.objectives = section
    else if (t.includes('material') || t.includes('preparation') || t.includes('resource')) data.preparation = section
    else if (t.includes('link')) data.links = section
    else if (t.includes('vocab') || t.includes('glossary')) data.vocabulary = section
    else if (t.includes('timeline') || t.includes('procedure') || t.includes('step') || t.includes('agenda')) {
      data.agenda = section
      data.teachingGuide = section
    }
    else data.otherSections.push(section)
  })

  // Calculate Duration from Timeline/Agenda
  if (data.agenda) {
    let totalMinutes = 0
    data.agenda.subsections.forEach(sub => {
      const minutesItem = sub.content.find(item => 
        typeof item !== 'string' && item.type === 'key-value' && item.key.toLowerCase().includes('minute')
      ) as KeyValue | undefined
      
      if (minutesItem) {
        const mins = parseInt(String(minutesItem.value))
        if (!isNaN(mins)) totalMinutes += mins
      }
    })
    if (totalMinutes > 0) data.duration = totalMinutes
  }

  return data
}
