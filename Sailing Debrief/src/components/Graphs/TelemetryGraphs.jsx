import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { RechartsDevTools } from 'recharts';
import { dataToGraphData } from '../../utils/DataToGraphData';
import { useVideo } from '../../contexts/VideoContext';
import { FindTimelineStart } from '../../utils/FindTimelineStart';

const TelemetryGraphs = ({absoluteTime}) => {

    const { state } = useVideo();

    const WINDOWS_MS = state.windowMsGraph;
    const timelineStart = FindTimelineStart(state.videoGroups, state.audioGroups, state.dataGroups);
    const absoluteTimeLocal = timelineStart + state.currentTime * 1000;
    const heelData = dataToGraphData(state.dataGroups, absoluteTimeLocal, WINDOWS_MS, 'heel');
    const pitchData = dataToGraphData(state.dataGroups, absoluteTimeLocal, WINDOWS_MS, 'pitch');
    const speedData = dataToGraphData(state.dataGroups, absoluteTimeLocal, WINDOWS_MS, 'speed');
    const headingData = dataToGraphData(state.dataGroups, absoluteTimeLocal, WINDOWS_MS, 'heading');

    const xAxisProps = {
        dataKey: "t",
        type: "number",
        domain: [absoluteTimeLocal - WINDOWS_MS, absoluteTimeLocal],
        allowDataOverflow: true,
        tickFormatter: ms => new Date(ms).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
    };
    const grid = <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" strokeOpacity={0.6} />;

    const lines = (series) => series.map(s => (
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
    ));

    return (
        <div className='h-full flex flex-col overflow-hidden bg-blue-100'>
            { state.graphSelection.heel &&<div className="flex-1 min-h-0 flex flex-col">
                <h3 className='text text-center mb-2 font-bold'>Heel Over Time ({WINDOWS_MS/1000} seconds)</h3>
                <div className="flex-1 min-h-0"><ResponsiveContainer width="100%" height="100%">
                    <LineChart data={heelData.rows}>
                        {grid}
                        <XAxis {...xAxisProps} />
                        <YAxis domain={[-25, 25]} allowDataOverflow ticks={[-25, -15, -5, 0, 5, 15, 25]}/>
                        {lines(heelData.series)}
                        {!state.graphSelection.speed && !state.graphSelection.heading && !state.graphSelection.pitch && <Legend />}
                    </LineChart>
                </ResponsiveContainer></div>
            </div>}
            {state.graphSelection.speed && <div className="flex-1 min-h-0 flex flex-col">
                <h3 className='text text-center mb-2 font-bold'>Speed Over Time ({WINDOWS_MS/1000} seconds)</h3>
                <div className="flex-1 min-h-0"><ResponsiveContainer width="100%" height="100%">
                    <LineChart data={speedData.rows}>
                        {grid}
                        <XAxis {...xAxisProps} />
                        <YAxis domain={[0, 25]} allowDataOverflow tickCount={8}/>
                        {lines(speedData.series)}
                        {!state.graphSelection.heading && !state.graphSelection.pitch && <Legend />}
                    </LineChart>
                </ResponsiveContainer></div>
            </div>}
            {state.graphSelection.heading && <div className="flex-1 min-h-0 flex flex-col">
                <h3 className='text text-center mb-2 font-bold'>Heading Over Time ({WINDOWS_MS/1000} seconds)</h3>
                <div className="flex-1 min-h-0"><ResponsiveContainer width="100%" height="100%">
                    <LineChart data={headingData.rows}>
                        {grid}
                        <XAxis {...xAxisProps} />
                        <YAxis domain={[0, 360]} allowDataOverflow tickCount={8}/>
                        {lines(headingData.series)}
                        {!state.graphSelection.pitch && <Legend />}
                    </LineChart>
                </ResponsiveContainer></div>
            </div>}
            {state.graphSelection.pitch && <div className="flex-1 min-h-0 flex flex-col">
                <h3 className='text text-center mb-2 font-bold'>Pitch Over Time ({WINDOWS_MS/1000} seconds)</h3>
                <div className="flex-1 min-h-0"><ResponsiveContainer width="100%" height="100%">
                    <LineChart data={pitchData.rows}>
                        {grid}
                        <XAxis {...xAxisProps} />
                        <YAxis domain={[-25, 25]} allowDataOverflow tickCount={8}/>
                        <Legend />
                        {lines(pitchData.series)}
                    </LineChart>
                </ResponsiveContainer></div>
            </div>}
        </div>
    );
};

export default TelemetryGraphs;
