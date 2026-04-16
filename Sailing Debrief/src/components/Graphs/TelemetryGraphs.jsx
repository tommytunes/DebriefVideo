import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { RechartsDevTools } from 'recharts';
import { dataToGraphDataHeel } from '../../utils/DataToGraphData';
import { useVideo } from '../../contexts/VideoContext';
import { FindTimelineStart } from '../../utils/FindTimelineStart';

const TelemetryGraphs = ({absoluteTime}) => {

    const { state } = useVideo();

    const WINDOWS_MS = 30_000;
    const timelineStart = FindTimelineStart(state.videoGroups, state.audioGroups, state.dataGroups);
    const absoluteTimeLocal = timelineStart + state.currentTime * 1000;
    const { rows, series } = dataToGraphDataHeel(state.dataGroups, absoluteTimeLocal, WINDOWS_MS);
    
    return (
        <LineChart style={{width: "100%", height: "25%"}} data={rows}>
            <XAxis                                                                                                                                                          
            dataKey="t"                                                                                                                                                   
            type="number"                                                                                                                                                 
            domain={[absoluteTimeLocal - WINDOWS_MS, absoluteTimeLocal]}
            allowDataOverflow                                                                                                                               
            tickFormatter={ms => new Date(ms).toLocaleTimeString([], {                                                                                                    
            hour: 'numeric',                                                                                                                                            
            minute: '2-digit',                                                                                                                                          
            hour12: true,                                                                                                                                               
            })}
        />
            <YAxis 
            domain={[-25, 25]}
            allowDataOverflow
            />

            {series.map(s => (
            <Line
            key={s.key}
            stroke={s.color}
            type="monotone"
            dataKey={s.key}
            name={s.name}
            connectNulls
            dot={false}
            isAnimationActive={false}
            />
            ))}
        </LineChart>
    );
};

export default TelemetryGraphs;