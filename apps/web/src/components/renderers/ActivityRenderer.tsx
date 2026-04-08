import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { parseActivityContent, type ActivityData, type Activity } from '../../lib/activity-parser';
import { 
  Target, Clock, ListChecks, Lightbulb, BookOpen, 
  ChevronDown, ChevronUp, CheckCircle2, Circle
} from 'lucide-react';

interface ActivityRendererProps {
  content: string;
  className?: string;
}

export default function ActivityRenderer({ content, className }: ActivityRendererProps) {
  const [data] = useState<ActivityData>(parseActivityContent(content));
  const [expandedId, setExpandedId] = useState<string | null>(data.activities[0]?.activity_id || null);
  const [completedSteps, setCompletedSteps] = useState<Record<string, Set<number>>>({});

  const toggleStep = (activityId: string, stepNum: number) => {
    setCompletedSteps(prev => {
      const next = { ...prev };
      const steps = new Set(next[activityId] || []);
      if (steps.has(stepNum)) steps.delete(stepNum);
      else steps.add(stepNum);
      next[activityId] = steps;
      return next;
    });
  };

  const activities = data.activities || [];

  return (
    <div className={cn("max-w-4xl mx-auto space-y-6", className)}>
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-2xl">
          <Target className="w-8 h-8 text-primary-600 dark:text-primary-400" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Learning Activities</h2>
          <p className="text-slate-500">{activities.length} hands-on tasks</p>
        </div>
      </div>

      <div className="space-y-4">
        {activities.map((activity, idx) => {
          const isExpanded = expandedId === activity.activity_id;
          const steps = activity.steps || [];
          const progress = completedSteps[activity.activity_id]?.size || 0;
          const percent = steps.length > 0 ? (progress / steps.length) * 100 : 0;

          return (
            <div 
              key={activity.activity_id || idx}
              className={cn(
                "group rounded-2xl border transition-all duration-300",
                isExpanded 
                  ? "bg-white dark:bg-slate-900 border-primary-200 dark:border-primary-800 shadow-xl shadow-primary-900/5" 
                  : "bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
              )}
            >
              {/* Card Header */}
              <button 
                onClick={() => setExpandedId(isExpanded ? null : activity.activity_id)}
                className="w-full text-left p-6 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-lg w-10 h-10 flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors">
                      {activity.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium">
                        {activity.type.replace('_', ' ')}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock className="w-3 h-3" />
                        {activity.duration_minutes}m
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {steps.length > 0 && (
                    <div className="hidden sm:flex flex-col items-end gap-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Progress</div>
                      <div className="h-1 w-20 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-primary-500" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  )}
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </div>
              </button>

              {/* Card Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 pt-0 space-y-6">
                      <div className="prose prose-sm dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-6">
                        {activity.instructions}
                      </div>

                      {steps.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Checklist</h4>
                          <div className="space-y-2">
                            {steps.map(step => (
                              <div 
                                key={step.step_number}
                                onClick={() => toggleStep(activity.activity_id, step.step_number)}
                                className={cn(
                                  "p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 group/step",
                                  completedSteps[activity.activity_id]?.has(step.step_number)
                                    ? "bg-primary-50/30 dark:bg-primary-900/10 border-primary-200 dark:border-primary-900/50"
                                    : "bg-white dark:bg-slate-950 border-slate-50 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700"
                                )}
                              >
                                {completedSteps[activity.activity_id]?.has(step.step_number) ? (
                                  <CheckCircle2 className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" />
                                ) : (
                                  <Circle className="w-5 h-5 text-slate-300 dark:text-slate-700 mt-0.5 flex-shrink-0 group-hover/step:text-primary-400" />
                                )}
                                <div className="space-y-1">
                                  <p className={cn(
                                    "text-sm font-medium transition-all",
                                    completedSteps[activity.activity_id]?.has(step.step_number) 
                                      ? "text-slate-500 line-through decoration-slate-400" 
                                      : "text-slate-700 dark:text-slate-300"
                                  )}>
                                    {step.instruction}
                                  </p>
                                  {step.hint && (
                                    <div className="flex items-start gap-2 p-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/30 text-[10px] text-yellow-700 dark:text-yellow-500">
                                      <Lightbulb className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                      {step.hint}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {activity.solution_guide && (
                        <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2">
                          <div className="flex items-center gap-2 text-xs font-bold text-primary-400 uppercase tracking-widest">
                            <BookOpen className="w-4 h-4" />
                            Solution Guide
                          </div>
                          <div className="text-sm text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                            {activity.solution_guide}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
