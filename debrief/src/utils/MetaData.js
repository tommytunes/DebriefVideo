import * as MP4Box from 'mp4box'                                                                                           
                                                                                                                             
  export async function extractMetaDataVideo(file) {                                                                         
      return new Promise((resolve, reject) => {                                                                              
          const mp4boxfile = MP4Box.createFile();                                                                            
                                                                                                                             
          mp4boxfile.onError = (e) => {                                                                                      
              console.error('MP4Box Error:', e);                                                                             
              // Fallback to file modification time                                                                          
              resolve({                                                                                                      
                  creation: new Date(file.lastModified),                                                                     
                  duration: 0                                                                                                
              });                                                                                                            
          };                                                                                                                 
                                                                                                                             
          mp4boxfile.onReady = (info) => {                                                                                   
              resolve({                                                                                                      
                  creation: info.created ? new Date(info.created) : new Date(file.lastModified),                             
                  duration: info.duration / info.timescale                                                                   
              });                                                                                                            
          };                                                                                                                 
                                                                                                                             
          file.arrayBuffer()                                                                                                 
              .then(buffer => {                                                                                              
                  buffer.fileStart = 0;                                                                                      
                  mp4boxfile.appendBuffer(buffer);                                                                           
                  mp4boxfile.flush();                                                                                        
              })                                                                                                             
              .catch(err => {                                                                                                
                  console.error('Failed to read file buffer:', err);                                                         
                  // Fallback to file modification time                                                                      
                  resolve({                                                                                                  
                      creation: new Date(file.lastModified),                                                                 
                      duration: 0                                                                                            
                  });                                                                                                        
              });                                                                                                            
      });                                                                                                                    
  }  