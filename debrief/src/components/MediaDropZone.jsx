import { useVideo } from '../contexts/VideoContext';
import React, {useCallback} from 'react'
import {useDropzone} from 'react-dropzone'
import { extractMetaDataVideo } from '../utils/MetaData';

function MediaDropZone({ groupId }) {
    const { dispatch } = useVideo();

    const onDrop = useCallback(async (acceptedFiles) => {
        const videos = await Promise.all( 
        acceptedFiles.map(async file => {
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
    }, [dispatch]);

    const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop, accept: {                                                                                                      
          'video/mp4': ['.mp4'],                                                                                     
          'video/quicktime': ['.mov']                                                                                
      }});

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      {
        isDragActive ?
          <p>Drop the files here ...</p> :
          <p>Drag 'n' drop some files here, or click to select files</p>
      }
    </div>
  )
}

export default MediaDropZone;