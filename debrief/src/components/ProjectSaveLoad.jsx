import { projectSerializer } from "../utils/projectSerializer";
import { projectDeSerializer } from "../utils/ProjectDeSerializer";
import { useVideo } from "../contexts/VideoContext";
import { useEffect, useRef } from 'react';

const ProjectSaveLoad = () => {
    const { state, dispatch } = useVideo();
    const stateRef = useRef(state);
    stateRef.current = state;
    useEffect(() => {
        window.electronAPI.onMenuSave(() => handleSave());
        window.electronAPI.onMenuLoad(() => handleLoad());
    }, []);

    async function handleSave() {
        const json = JSON.stringify(projectSerializer(stateRef.current), null,2);
        const result = await window.electronAPI.saveProject(json)
        console.log(stateRef);  
    }
    
    async function handleLoad() {
        const result = await window.electronAPI.loadProject();
        if (!result.success) return;
        const payload = await projectDeSerializer(result.json);
        dispatch({type: 'LOAD_PROJECT', payload: payload});
        console.log(stateRef);
    }
    return null;
};

export default ProjectSaveLoad;