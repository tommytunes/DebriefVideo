import { useVideo } from '../contexts/VideoContext';
import Muted from '../assets/volume-x.png';
import Sound from '../assets/volume-2.png';

const ListMedia = () => {
    const { state, dispatch } = useVideo();

    const onClickVideo = (group) => {
        dispatch({type: 'INVERT_MUTE_VIDEO', payload: group.id});
    }

    const onClickAudio = (group) => {
        dispatch({type: 'INVERT_MUTE_AUDIO', payload: group.id});
    }

    return (
    <>
        {state.videoGroups.map(group => (
            <button key={group.id} className='btn btn-primary btn-sm m-0.5' onClick={() => onClickVideo(group)}>
                {group.name}
                {group.muted ? 
                <img src={Muted}  className='ml-auto'/> :
                <img src={Sound}  className='ml-auto'/> }
                </button>
        )) }
        {state.audioGroups.map(group => (
            <button key={group.id} className='btn btn-primary btn-sm m-0.5' onClick={() => onClickAudio(group)}>
                {group.name}
                {group.muted ? 
                <img src={Muted} className='ml-auto'/> :
                <img src={Sound} className='ml-auto'/> }
            </button>
        )
        )}
    </>
    );
};

export default ListMedia;