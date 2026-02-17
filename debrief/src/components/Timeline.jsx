import { Timeline } from '@xzdarcy/react-timeline-editor';
import { TimelineEffects } from '../utils/TimelineEffects';
import { useVideo } from '../contexts/VideoContext';
import { FindTimelineStart } from '../utils/FindTimelineStart';
import { VideoToTimelineData } from '../utils/VideoToTimelineData';
import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import '../style/timeline.css';
import { FindTimelineEnd } from '../utils/FindTimelineEnd';
import { usePlayback } from '../hooks/usePlayback';

export const TimelineEditor = () => {

    const { state } = useVideo();
    const { seek } = usePlayback();
    const containerRef  = useRef(null);
    const timelineRef = useRef(null);
    const [containerWidth , setContainerWidth] = useState(0);
    
    const [startLeftVal, setStartLeft] = useState(40);
    const [scale, setScale] = useState(5);
    const [scaleWidth, setScaleWidth] = useState(160);

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

    useEffect(() => {
        setData(timelineData);
    }, [timelineData]);

    const getScaleRender = useCallback((scaleValue) => {
        const date = new Date(timelineStart + scaleValue * 1000);
        return date.toLocaleTimeString('en-CA', {
            hour12: false
        });
    }, [timelineStart]);

    useEffect(() => {
        if (!containerRef.current) return;
        const container = containerRef.current;

        const update = () => {
            setContainerWidth(container.clientWidth);
        }
        update();

        const resizeObserver = new ResizeObserver(update);
        resizeObserver.observe(container);

        return () => resizeObserver.disconnect();
    }, []);

    useEffect(() => {
        if (containerWidth === 0 || state.videoGroups.length === 0) return;
        const timelineEnd = FindTimelineEnd(state.videoGroups);
        const scaleVal = ((timelineEnd - timelineStart) / ((containerWidth - startLeftVal) / scaleWidth) / 1000);
        setScale(scaleVal);
    }, [state.videoGroups, containerWidth, startLeftVal, scaleWidth])

    useEffect(() => {
        if (!timelineRef.current) return;

        timelineRef.current.setTime(state.currentTime);

    }, [state.currentTime]);

    const ClickCursor = (time, event) => {
        event.preventDefault();
        seek(time);
        timelineRef.current.setTime(time);
    }
    
    return (
        <div className='timeline-editor-example1' ref={containerRef}>
            <Timeline
            ref={timelineRef}
            editorData={data}
            onChange={setData}
            effects={timelineEffects}
            hideCursor={false}
            autoScroll={false}
            getScaleRender={getScaleRender}
            startLeft={startLeftVal} // remove maybe once list is added
            scale={scale}
            scaleWidth={scaleWidth}
            onClickTimeArea={ClickCursor}
            />
        </div>

  )
}

export default TimelineEditor;
