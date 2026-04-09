import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { Clock, BookOpen, CheckCircle } from 'lucide-react'
import { parseLessonContent, type LessonData, type Section, type ListItem, type KeyValue } from '@/lib/lesson-parser'

interface LessonRendererProps {
    content: string | Record<string, unknown>
    type: string
    title?: string
    className?: string
}

export function LessonRenderer({ content, type, title, className }: LessonRendererProps) {
    const parsedData = useMemo<LessonData | null>(() => {
        console.log('🔍 LessonRenderer - Raw content:', content)
        console.log('🔍 LessonRenderer - Content type:', typeof content)
        const result = parseLessonContent(content, title)
        console.log('🔍 LessonRenderer - Parsed data:', result)
        console.log('🔍 LessonRenderer - Has agenda?', !!result?.agenda)
        console.log('🔍 LessonRenderer - Has objectives?', !!result?.objectives)
        console.log('🔍 LessonRenderer - Has preparation?', !!result?.preparation)
        console.log('🔍 LessonRenderer - Other sections count:', result?.otherSections?.length || 0)
        return result
    }, [content, title])

    if (!parsedData) {
        console.error('❌ LessonRenderer - Failed to parse content')
        return <div className="p-8 text-center text-red-500">Failed to parse lesson content. Check console for details.</div>
    }

    // --- Render Helpers ---

    const renderSimpleContent = (items: (string | ListItem | KeyValue)[]) => {
        return items.map((item, idx) => {
            if (typeof item === 'string') return <p key={idx} className="mb-2 text-gray-700 leading-relaxed">{item}</p>
            if (item.type === 'list-item') return <li key={idx} className="text-gray-700 mb-1">{item.text}</li>
            return null // Skip key-values in simple view
        })
    }

    const renderObjectives = (section: Section) => {
        return (
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3 border-b pb-1">Objectives</h2>
                <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-md">
                    <h5 className="font-semibold text-purple-900 mb-2">Students will be able to:</h5>
                    <ul className="list-disc pl-5 space-y-1">
                        {section.content.map((item, idx) => {
                            if (typeof item !== 'string' && item.type === 'list-item') {
                                return <li key={idx} className="text-gray-800">{item.text}</li>
                            }
                            return null
                        })}
                    </ul>
                </div>
            </div>
        )
    }

    const renderAgenda = (section: Section) => {
        return (
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3 border-b pb-1">Agenda</h2>
                <div className="space-y-2">
                    {section.subsections.map((sub, idx) => {
                        const minutesItem = sub.content.find(item =>
                            typeof item !== 'string' && item.type === 'key-value' && item.key.toLowerCase().includes('minute')
                        ) as KeyValue | undefined
                        const mins = minutesItem ? `(${minutesItem.value} mins)` : ''

                        return (
                            <div key={idx} className="flex items-center text-gray-800">
                                <div className="w-2 h-2 rounded-full bg-purple-500 mr-3"></div>
                                <span className="font-medium mr-2">{sub.title}</span>
                                <span className="text-gray-500 text-sm">{mins}</span>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }

    const renderTeachingGuide = (section: Section) => {
        return (
            <div className="mt-8 pt-8 border-t-2 border-gray-200">
                <h2 className="text-2xl font-bold text-purple-700 mb-6">Teaching Guide</h2>
                <div className="space-y-8">
                    {section.subsections.map((sub, idx) => {
                        const minutesItem = sub.content.find(item =>
                            typeof item !== 'string' && item.type === 'key-value' && item.key.toLowerCase().includes('minute')
                        ) as KeyValue | undefined
                        const mins = minutesItem ? `(${minutesItem.value} minutes)` : ''

                        // Extract specific fields
                        const studentAction = sub.content.find(i => typeof i !== 'string' && i.type === 'key-value' && i.key.toLowerCase().includes('student')) as KeyValue
                        const teacherAction = sub.content.find(i => typeof i !== 'string' && i.type === 'key-value' && i.key.toLowerCase().includes('teacher')) as KeyValue
                        const resourceRef = sub.content.find(i => typeof i !== 'string' && i.type === 'key-value' && i.key.toLowerCase().includes('resource')) as KeyValue

                        return (
                            <div key={idx} className="break-inside-avoid">
                                <div className="flex items-baseline mb-3">
                                    <h3 className="text-xl font-bold text-purple-600 mr-3">{sub.title}</h3>
                                    <span className="text-gray-500 font-medium">{mins}</span>
                                </div>

                                {resourceRef && (
                                    <div className="mb-3 inline-block bg-yellow-50 border border-yellow-200 rounded px-3 py-1 text-sm text-yellow-800">
                                        <span className="font-semibold mr-1">Resource:</span> {Array.isArray(resourceRef.value) ? resourceRef.value.join(' ') : resourceRef.value}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                                    {teacherAction && (
                                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                            <h4 className="font-bold text-blue-800 mb-2 flex items-center">
                                                <CheckCircle className="w-4 h-4 mr-2" /> Teacher Action
                                            </h4>
                                            <p className="text-gray-800 text-sm leading-relaxed">
                                                {Array.isArray(teacherAction.value) ? teacherAction.value.join(' ') : teacherAction.value}
                                            </p>
                                        </div>
                                    )}

                                    {studentAction && (
                                        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                                            <h4 className="font-bold text-green-800 mb-2 flex items-center">
                                                <BookOpen className="w-4 h-4 mr-2" /> Student Action
                                            </h4>
                                            <p className="text-gray-800 text-sm leading-relaxed">
                                                {Array.isArray(studentAction.value) ? studentAction.value.join(' ') : studentAction.value}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }

    // --- Main Render Logic ---

    if (type === 'lesson_plan') {
        // Use direct properties from LessonData instead of sections
        const objectives = parsedData.objectives
        const agenda = parsedData.agenda
        const preparation = parsedData.preparation
        const teachingGuide = parsedData.teachingGuide

        // Other sections
        const otherSections = parsedData.otherSections || []

        // Check if we have enough content for the custom layout
        const hasEnoughContent = agenda || objectives || preparation || otherSections.length > 0

        if (hasEnoughContent) {
            return (
                <div className={cn("max-w-5xl mx-auto bg-white p-8 md:p-12 shadow-sm rounded-xl", className)}>
                    {/* Header */}
                    <div className="mb-10 border-b-2 border-gray-900 pb-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h4 className="text-purple-600 font-bold tracking-wider uppercase text-sm mb-1">LESSON PLAN</h4>
                                <h1 className="text-4xl font-extrabold text-gray-900 font-serif">{parsedData.title}</h1>
                            </div>
                            <div className="flex items-center text-gray-600 font-medium bg-gray-100 px-4 py-2 rounded-full">
                                <Clock className="w-5 h-5 mr-2" />
                                {parsedData.duration > 0 ? `${parsedData.duration} minutes` : '60 minutes'}
                            </div>
                        </div>
                    </div>

                    {/* 2-Column Layout (2/3 - 1/3) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {/* Left Column: Agenda & Objectives */}
                        <div className="space-y-10 md:col-span-2">
                            {agenda && renderAgenda(agenda)}
                            {objectives && renderObjectives(objectives)}
                        </div>

                        {/* Right Column: Preparation & Others */}
                        <div className="space-y-10">

                            {preparation && (
                                <div className="mb-6">
                                    <h2 className="text-xl font-bold text-gray-900 mb-3 border-b pb-1">Preparation</h2>
                                    <div className="bg-yellow-50 border border-yellow-100 p-5 rounded-lg">
                                        <ul className="space-y-2 text-gray-800">
                                            {preparation.content.map((item, idx) => {
                                                if (typeof item === 'string') return <li key={idx} className="flex items-start"><span className="mr-2">•</span>{item}</li>
                                                if (item.type === 'list-item') return <li key={idx} className="flex items-start"><span className="mr-2">•</span>{item.text}</li>
                                                return null
                                            })}
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {otherSections.map((section, idx) => (
                                <div key={idx} className="mb-6">
                                    <h2 className="text-xl font-bold text-gray-900 mb-3 border-b pb-1">{section.title}</h2>
                                    <div className="prose prose-sm max-w-none text-gray-700">
                                        {renderSimpleContent(section.content)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Full Width: Teaching Guide */}
                    {teachingGuide && renderTeachingGuide(teachingGuide)}
                </div>
            )
        }

        // Fall back to default rendering if structure is not recognized
    }

    // Default view for other resource types
    return (
        <div className={cn(
            "lesson-renderer bg-white text-black font-sans mx-auto",
            "w-full max-w-[210mm] min-h-[297mm]", // A4 dimensions
            "p-[20mm]", // A4 margins
            "shadow-lg print:shadow-none print:w-full print:max-w-none print:p-0 print:m-0",
            className
        )}>
            {/* Header */}
            <div className="mb-8 border-b-2 border-gray-900 pb-4 flex justify-between items-end">
                <div>
                    <div className="text-sm text-purple-600 font-bold uppercase tracking-wider mb-1">{type.replace(/_/g, ' ')}</div>
                    <h1 className="text-3xl font-serif font-bold text-gray-900">{parsedData.title}</h1>
                </div>
                {parsedData.duration > 0 && (
                    <div className="text-xl font-bold text-gray-600 flex items-center">
                        <Clock className="w-5 h-5 mr-2" />
                        {parsedData.duration} minutes
                    </div>
                )}
            </div>

            {/* Main Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">

                {/* Left Column (60%) */}
                <div className="md:col-span-3 space-y-8">
                    {parsedData.overview && (
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-3 border-b pb-1">Overview</h2>
                            {renderSimpleContent(parsedData.overview.content)}
                        </div>
                    )}

                    {parsedData.purpose && (
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-3 border-b pb-1">Purpose</h2>
                            {renderSimpleContent(parsedData.purpose.content)}
                        </div>
                    )}

                    {parsedData.standards && (
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-3 border-b pb-1">Standards</h2>
                            <ul className="list-disc pl-5">
                                {renderSimpleContent(parsedData.standards.content)}
                            </ul>
                        </div>
                    )}

                    {parsedData.agenda && renderAgenda(parsedData.agenda)}
                </div>

                {/* Right Column (40%) */}
                <div className="md:col-span-2 space-y-8 border-l pl-8 border-gray-100">
                    {parsedData.objectives && renderObjectives(parsedData.objectives)}

                    {parsedData.preparation && (
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-3 border-b pb-1">Preparation</h2>
                            <div className="bg-yellow-50 p-4 rounded-md border border-yellow-100">
                                <ul className="list-disc pl-5 space-y-1 text-sm">
                                    {parsedData.preparation.content.map((item, idx) => {
                                        if (typeof item !== 'string' && item.type === 'list-item') {
                                            return <li key={idx} className="text-gray-800">{item.text}</li>
                                        }
                                        return null
                                    })}
                                </ul>
                            </div>
                        </div>
                    )}

                    {parsedData.vocabulary && (
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-3 border-b pb-1">Vocabulary</h2>
                            <ul className="space-y-2">
                                {parsedData.vocabulary.content.map((item, idx) => {
                                    if (typeof item !== 'string' && item.type === 'list-item') {
                                        // Try to split term and definition if possible (e.g. "Term - Definition")
                                        const parts = item.text.split(/[-–—:]/)
                                        if (parts.length > 1) {
                                            return (
                                                <li key={idx} className="text-sm">
                                                    <span className="font-bold text-gray-900">{parts[0].trim()}</span>
                                                    <span className="text-gray-600"> - {parts.slice(1).join('-').trim()}</span>
                                                </li>
                                            )
                                        }
                                        return <li key={idx} className="text-sm text-gray-800">{item.text}</li>
                                    }
                                    return null
                                })}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {/* Teaching Guide (Full Width) */}
            {parsedData.teachingGuide && renderTeachingGuide(parsedData.teachingGuide)}

            {/* Other Sections */}
            {parsedData.otherSections.length > 0 && (
                <div className="mt-8 pt-8 border-t-2 border-gray-200">
                    {parsedData.otherSections.map((section, idx) => (
                        <div key={idx} className="mb-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3 border-b pb-1">{section.title}</h2>
                            {renderSimpleContent(section.content)}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
