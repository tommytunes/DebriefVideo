import { useVideo } from '../contexts/VideoContext';
import AudioLines from '../assets/audio-lines.png';

const ListMedia = () => {
    const { state, dispatch } = useVideo();

    const onClick = (group) => {
        dispatch({type: 'INVERT_MUTE_VIDEO', payload: group.id});
    }

    return (
    <>
        {state.videoGroups.map(group => (
            <button className='btn btn-primary btn-sm m-0.5' onClick={() => onClick(group)}>
                {group.name}
                {!group.muted ? 
                <img src={AudioLines} /> :
                <></> }
                </button>
        )) }
    </>
    );
};

export default ListMedia;