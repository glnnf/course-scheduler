import { useState, ChangeEvent, SyntheticEvent } from 'react'
import './App.css'

function FileUploader() {
  const MAX_FILES = 3;
  const ALLOWED_EXTENSIONS = ['.pdf', '.csv'];
  const ALLOWED_MIME_TYPES = ['application/pdf', 'text/csv'];

  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState<false>;
  const [message, setMessage] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLFormElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
      setMessage(null);
    }
  };

  return (
    <>
 
    </>
  )
}

export default FileUploader
