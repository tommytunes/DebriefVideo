function MediaDropZone({ groupId, accept, label, onFiles }) {

  const onClick = async () => {
        const results = await window.electronAPI.openFiles(accept);
        const fileObjects = results.map(r => ({
            name: r.name,
            lastModified: r.lastModified,
            _filePath: r.path,
            arrayBuffer: async () => {
                const buf = await window.electronAPI.readFileBuffer(r.path);
                return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
            },
        }));
        onFiles(fileObjects, null, groupId);
    }

  return (
      <button onClick={onClick} className='btn btn-primary'>{label}</button>
  );
}


export default MediaDropZone;
