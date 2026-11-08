import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
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

    // recessive axes: no axis/tick lines, small muted labels
    const axisStyle = { tick: { fontSize: 11, fill: '#6b7280' }, axisLine: false, tickLine: false };
    const xAxisProps = {
        ...axisStyle,
        dataKey: "t",
        type: "number",
        domain: [absoluteTimeLocal - WINDOWS_MS, absoluteTimeLocal],
        allowDataOverflow: true,
        tickFormatter: ms => new Date(ms).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' })
    };
    const yAxisProps = { ...axisStyle, width: 36, allowDataOverflow: true };
    const chartMargin = { top: 4, right: 12, bottom: 0, left: 0 };
    const grid = <CartesianGrid vertical={false} stroke="#e5e7eb" />;
    const zeroLine = <ReferenceLine y={0} stroke="#9ca3af" strokeDasharray="4 4" />;

    const title = (name, unit) => (
        <h3 className='text-sm font-semibold px-2'>
            {name} <span className='font-normal text-base-content/60'>{unit} · last {WINDOWS_MS / 1000}s</span>
        </h3>
    );

    // a single series needs no legend, its title names it
    const legend = (series) => series.length > 1 &&
        <Legend iconType="plainline" wrapperStyle={{ fontSize: 12 }} />;

    const lines = (series) => series.map(s => (
        <Line
            key={s.key}
            stroke={s.color}
            strokeWidth={2}
            type="monotone"
            dataKey={s.key}
            name={s.name}
            connectNulls
            dot={false}
            isAnimationActive={false}
        />
    ));

    const panel = 'flex-1 min-h-0 flex flex-col bg-base-100 rounded-box pt-2';

    return (
        <div className='h-full flex flex-col gap-2 p-2 overflow-hidden bg-base-200'>
            { state.graphSelection.heel &&<div className={panel}>
                {title('Heel', '°')}
                <div className="flex-1 min-h-0"><ResponsiveContainer width="100%" height="100%">
                    <LineChart data={heelData.rows} margin={chartMargin}>
                        {grid}
                        <XAxis {...xAxisProps} />
                        <YAxis {...yAxisProps} domain={heelData.domain} ticks={heelData.ticks}/>
                        {zeroLine}
                        {lines(heelData.series)}
                        {!state.graphSelection.speed && !state.graphSelection.heading && !state.graphSelection.pitch && legend(heelData.series)}
                    </LineChart>
                </ResponsiveContainer></div>
            </div>}
            {state.graphSelection.speed && <div className={panel}>
                {title('Speed', 'kn')}
                <div className="flex-1 min-h-0"><ResponsiveContainer width="100%" height="100%">
                    <LineChart data={speedData.rows} margin={chartMargin}>
                        {grid}
                        <XAxis {...xAxisProps} />
                        <YAxis {...yAxisProps} domain={speedData.domain} ticks={speedData.ticks}/>
                        {lines(speedData.series)}
                        {!state.graphSelection.heading && !state.graphSelection.pitch && legend(speedData.series)}
                    </LineChart>
                </ResponsiveContainer></div>
            </div>}
            {state.graphSelection.heading && <div className={panel}>
                {title('Heading', '°')}
                <div className="flex-1 min-h-0"><ResponsiveContainer width="100%" height="100%">
                    <LineChart data={headingData.rows} margin={chartMargin}>
                        {grid}
                        <XAxis {...xAxisProps} />
                        <YAxis {...yAxisProps} domain={headingData.domain} ticks={headingData.ticks} tickFormatter={v => ((v % 360) + 360) % 360}/>
                        {lines(headingData.series)}
                        {!state.graphSelection.pitch && legend(headingData.series)}
                    </LineChart>
                </ResponsiveContainer></div>
            </div>}
            {state.graphSelection.pitch && <div className={panel}>
                {title('Pitch', '°')}
                <div className="flex-1 min-h-0"><ResponsiveContainer width="100%" height="100%">
                    <LineChart data={pitchData.rows} margin={chartMargin}>
                        {grid}
                        <XAxis {...xAxisProps} />
                        <YAxis {...yAxisProps} domain={pitchData.domain} ticks={pitchData.ticks}/>
                        {zeroLine}
                        {lines(pitchData.series)}
                        {legend(pitchData.series)}
                    </LineChart>
                </ResponsiveContainer></div>
            </div>}
        </div>
    );
};

export default TelemetryGraphs;
