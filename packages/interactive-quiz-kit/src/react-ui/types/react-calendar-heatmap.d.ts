declare module 'react-calendar-heatmap' {
  import React from 'react';

  // Define the constraint for the date type
  type ReactCalendarHeatmapDate = string | number | Date;

  // Define the generic value type
  export interface ReactCalendarHeatmapValue<T extends ReactCalendarHeatmapDate> {
    date: T;
    [key: string]: any; // Allow other properties like 'count'
  }

  // Define the generic props for the component
  interface Props<T extends ReactCalendarHeatmapDate> {
    values: ReactCalendarHeatmapValue<T>[];
    startDate?: T;
    endDate?: T;
    classForValue?: (value: ReactCalendarHeatmapValue<T> | undefined) => string;
    titleForValue?: (value: ReactCalendarHeatmapValue<T> | undefined) => string;
    tooltipDataAttrs?: (value: ReactCalendarHeatmapValue<T> | undefined) => any;
    showWeekdayLabels?: boolean;
    showMonthLabels?: boolean;
    weekdayLabels?: string[];
    monthLabels?: string[];
    [key: string]: any;
  }

  // Define the component as a generic functional component
  const ReactCalendarHeatmap: <T extends ReactCalendarHeatmapDate>(props: Props<T>) => React.ReactElement<Props<T>>;
  export default ReactCalendarHeatmap;
}