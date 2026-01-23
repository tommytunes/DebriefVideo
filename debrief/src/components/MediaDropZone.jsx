import { useVideo } from '../contexts/VideoContext';
import React, {useCallback} from 'react'
import {useDropzone} from 'react-dropzone'
import { extractMetaDataVideo } from '../utils/MetaData';

function MediaDropZone() {
    const { dispatch } = useVideo();

    const onDrop = useCallback(async (acceptedFiles) => {
        const videos = await Promise.all( 
        acceptedFiles.map(async file => ({
            id: crypto.randomUUID(),
            file,
            url: URL.createObjectURL(file),
            timestamp: await extractMetaDataVideo(file)
        }))) 

        dispatch({type: 'ADD_VIDEO', payload: videos });
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