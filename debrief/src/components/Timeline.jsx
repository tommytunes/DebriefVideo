import { Timeline } from '@xzdarcy/react-timeline-editor';
import { TimelineEffects } from '../utils/TimelineEffects';
import { useVideo } from '../contexts/VideoContext';
import { FindTimelineStart } from '../utils/FindTimelineStart';
import { VideoToTimelineData } from '../utils/VideoToTimelineData';
import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import '../style/timeline.css';

export const TimelineEditor = () => {

    const { state } = useVideo();

    const timelineStart = useMemo(
          () => FindTimelineStart(state.videoGroups),
          [state.videoGroups]
      );

      const timelineEffects = useMemo(
          () => TimelineEffects(state.videoGroups),
          [state.videoGroups]
      );

      const timelineData = useMemo(
          () => VideoToTimelineData(state.videoGroups, timelineStart),
          [state.videoGroups, timelineStart]
      );

      const [data, setData] = useState(timelineData);

      // Sync data state when timelineData recalculates
      useEffect(() => {
          setData(timelineData);
      }, [timelineData]);

     /* const getScaleRender = useCallback((scaleValue) => {
          const date = new Date(timelineStart + scaleValue * 1000);
          return date.toLocaleTimeString();
      }, [timelineStart]);
    */
    return (
        <div className='timeline-editor-example1'>
            <Timeline
            editorData={data}
            onChange={setData}
            effects={timelineEffects}
            />
        </div>

  )
}

export default TimelineEditor;
