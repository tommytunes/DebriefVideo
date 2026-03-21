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

    const { state, dispatch } = useVideo();
    const { seek } = usePlayback();
    const containerRef  = useRef(null);
    const timelineRef = useRef(null);
    const [containerWidth , setContainerWidth] = useState(0);
    
    const [startLeftVal, setStartLeft] = useState(40);
    const [scale, setScale] = useState(5);
    const [scaleWidth, setScaleWidth] = useState(160);

    const timelineStart = useMemo(
          () => FindTimelineStart(state.videoGroups, state.audioGroups),
          [state.videoGroups, state.audioGroups]
      );

    const timelineEffects = useMemo(
        () => TimelineEffects(state.videoGroups, state.audioGroups),
        [state.videoGroups, state.audioGroups]
    );

    const timelineData = useMemo(
        () => VideoToTimelineData(state.videoGroups, state.audioGroups, timelineStart),
        [state.videoGroups, timelineStart, state.audioGroups]
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

        let rafId;
        const update = () => {
            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                setContainerWidth(container.clientWidth);
            });
        }
        update();

        const resizeObserver = new ResizeObserver(update);
        resizeObserver.observe(container);

        return () => resizeObserver.disconnect();
    }, []);

    useEffect(() => {
        if (containerWidth === 0 || state.videoGroups.length === 0) return;
        const timelineEnd = FindTimelineEnd(state.videoGroups, state.audioGroups);
        const scaleVal = ((timelineEnd - timelineStart) / ((containerWidth - startLeftVal) / scaleWidth) / 1000);
        setScale(scaleVal);
    }, [state.videoGroups, containerWidth, startLeftVal, scaleWidth])

    useEffect(() => {
        if (!timelineRef.current) return;

        timelineRef.current.setTime(state.currentTime);

    }, [state.currentTime, timelineData]);

    const ClickCursor = (time, event) => {
        event.preventDefault();
        seek(time);
        timelineRef.current.setTime(time);
    }

    const CursorDrag = (time) => {
        seek(time);
        timelineRef.current.setTime(time);
    }

    const CursorDragStart = () => {
        dispatch({type: 'SET_DRAGGING', payload: true});
    }

    const CursorDragEnd = (time) => {
        dispatch({type: 'SET_DRAGGING', payload: false});
        seek(time);
    }
    
    return (
        <div className='timeline-editor-example1 flex-1 min-w-0' ref={containerRef}>
            <Timeline
            ref={timelineRef}
            editorData={data}
            onChange={setData} 
            effects={timelineEffects}
            hideCursor={false}
            autoScroll={false}
            getScaleRender={getScaleRender}
            startLeft={startLeftVal}
            scale={scale}
            scaleWidth={scaleWidth}
            onClickTimeArea={ClickCursor}
            onCursorDrag={CursorDrag}
            onCursorDragStart={CursorDragStart}
            onCursorDragEnd={CursorDragEnd}
            />
        </div>

  )
}

export default TimelineEditor;
