import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { RechartsDevTools } from 'recharts';
import { dataToGraphData } from '../../utils/DataToGraphData';
import { useVideo } from '../../contexts/VideoContext';
import { FindTimelineStart } from '../../utils/FindTimelineStart';

const TelemetryGraphs = ({absoluteTime}) => {

    const { state } = useVideo();

    const WINDOWS_MS = 30_000;
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
        tickFormatter: ms => new Date(ms).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }),
    };

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
            <div className="flex-1 min-h-0 flex flex-col">
                <h3 className='text text-center mb-2 font-bold'>Heel Over Time</h3>
                <div className="flex-1 min-h-0"><ResponsiveContainer width="100%" height="100%">
                    <LineChart data={heelData.rows}>
                        <XAxis {...xAxisProps} />
                        <YAxis domain={[-25, 25]} allowDataOverflow />
                        {lines(heelData.series)}
                    </LineChart>
                </ResponsiveContainer></div>
            </div>
            <div className="flex-1 min-h-0 flex flex-col">
                <h3 className='text text-center mb-2 font-bold'>Speed Over Time</h3>
                <div className="flex-1 min-h-0"><ResponsiveContainer width="100%" height="100%">
                    <LineChart data={speedData.rows}>
                        <XAxis {...xAxisProps} />
                        <YAxis domain={[0, 25]} allowDataOverflow />
                        {lines(speedData.series)}
                    </LineChart>
                </ResponsiveContainer></div>
            </div>
            <div className="flex-1 min-h-0 flex flex-col">
                <h3 className='text text-center mb-2 font-bold'>Heading Over Time</h3>
                <div className="flex-1 min-h-0"><ResponsiveContainer width="100%" height="100%">
                    <LineChart data={headingData.rows}>
                        <XAxis {...xAxisProps} />
                        <YAxis domain={[0, 360]} allowDataOverflow />
                        {lines(headingData.series)}
                    </LineChart>
                </ResponsiveContainer></div>
            </div>
            <div className="flex-1 min-h-0 flex flex-col">
                <h3 className='text text-center mb-2 font-bold'>Pitch Over Time</h3>
                <div className="flex-1 min-h-0"><ResponsiveContainer width="100%" height="100%">
                    <LineChart data={pitchData.rows}>
                        <XAxis {...xAxisProps} />
                        <YAxis domain={[-40, 40]} allowDataOverflow />
                        <Legend />
                        {lines(pitchData.series)}
                    </LineChart>
                </ResponsiveContainer></div>
            </div>
        </div>
    );
};

export default TelemetryGraphs;
