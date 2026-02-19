import { useVideo } from '../contexts/VideoContext';
import React, {useCallback} from 'react'
import {useDropzone} from 'react-dropzone'
import { extractMetaDataVideo } from '../utils/MetaData';

function MediaDropZone({ groupId, accept, label, onFiles }) {

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
          <button onClick={onClick} className='btn btn-primary'>{label}</button>
      );
}



export default MediaDropZone;