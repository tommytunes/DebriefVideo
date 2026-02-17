import { useVideo } from '../contexts/VideoContext';
import React, {useCallback} from 'react'
import {useDropzone} from 'react-dropzone'
import { extractMetaDataVideo } from '../utils/MetaData';

function MediaDropZone({ groupId, accept, label, onFiles }) {
    
  /*const { dispatch } = useVideo();

    let fileHandles;

    const fileFromHandle = async (handle) => {
        const file = await handle.getFile();
        return {file, handle};
    };

    const onClick = async () => {
      fileHandles = await window.showOpenFilePicker({
        types: [
        {
          description: "Video Files",
          accept: {
            "video/mp4": [".mp4"],
            "video/quicktime": [".mov"],
          },
        },
      ],
      excludeAcceptAllOption: true,
      multiple: true,
      });

      const videos = await Promise.all(fileHandles.map( async fileHandle => {
        const { file, handle } = await fileFromHandle(fileHandle);
        const { creation, duration } = await extractMetaDataVideo(file);
          return {
            id: crypto.randomUUID(),
            file,
            url: URL.createObjectURL(file),
            timestamp: creation,
            duration: duration
          };
      }));
      
      dispatch({type: 'ADD_VIDEO', payload: {videos, groupId }});

    };

  return (
    <button type='file' onClick={onClick} className='btn btn-secondary'>File here</button>
  ) */

  const onClick = async () => {                                                                                                                       
          const handles = await window.showOpenFilePicker({                                                                                               
              types: [{ description: label, accept }],                                                                                                    
              excludeAcceptAllOption: true,                                                                                                               
              multiple: true,
          });
          const files = await Promise.all(
              handles.map(handle => handle.getFile())
          );
          onFiles(files, handles, groupId);
      };

      return (
          <button onClick={onClick}>{label}</button>
      );
}



export default MediaDropZone;