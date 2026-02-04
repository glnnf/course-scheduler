import type { ChangeEvent, SyntheticEvent } from 'react'
import { useState } from 'react';
import './App.css';

function FileUploader() {
  const MAX_FILES = 3;
  const ALLOWED_EXTENSIONS = ['.pdf', '.csv'];
  const ALLOWED_MIME_TYPES = ['application/pdf', 'text/csv'];

  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const isValidFile = (file: File): boolean => {
    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    const isAllowedExt = ALLOWED_EXTENSIONS.includes(ext);
    const isAllowedMime = ALLOWED_MIME_TYPES.includes(file.type);

    return isAllowedExt && isAllowedMime;
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const newFilesArray = Array.from(e.target.files);

    // Filter invalid files
    const validNewFiles = newFilesArray.filter((file) => {
      if (!isValidFile(file)) {
        setMessage((prev) =>
          prev
            ? `${prev}\n• ${file.name} ignored (only PDF and CSV allowed)`
            : `• ${file.name} ignored (only PDF and CSV allowed)`
        );
        return false;
      }
      return true;
    });

    if (validNewFiles.length === 0 && newFilesArray.length > 0) {
      return; // already showed message via setMessage
    }

    const currentCount = files.length;
    const availableSlots = MAX_FILES - currentCount;
    const filesToAdd = validNewFiles.slice(0, availableSlots);

       
    if (filesToAdd.length < validNewFiles.length) {
      setMessage(
        `Maximum ${MAX_FILES} files allowed. ` +
          `There are ${filesToAdd.length} new file(s) added.`
      );
    } else if (filesToAdd.length > 0) {
      setMessage(null);
    }

        
    if (filesToAdd.length > 0) {
      setFiles((prev) => [...prev, ...filesToAdd]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setMessage(null);
  };

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();

    if (files.length === 0) {
      setMessage('Please select at least one file');
      return;
    }

    setUploading(true);
    setMessage(null);

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file); // ← change field name if your backend expects something else
    });


    try {
      const response = await fetch('http://localhost:8080/api/upload', {
        // ← ← ← YOUR ACTUAL ENDPOINT
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP ${response.status}`);
      }

      const result = await response.text(); // or .json() if backend returns JSON
      setMessage(`Upload successful! ${result}`);
      setFiles([]); // clear list on success
    } catch (err: any) {
      setMessage(`Upload failed: ${err.message}`);
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const canUploadMore = files.length < MAX_FILES;

  return (
    <div className="upload-container">
      <h1>Upload PDF & CSV files</h1>
      <p className="subtitle">
        Maximum {MAX_FILES} files • only .pdf and .csv allowed
      </p>

      <form onSubmit={handleSubmit}>
        <div className="drop-zone">
          <input
            type="file"
            multiple
            accept=".pdf,.csv"
            onChange={handleFileChange}
            disabled={uploading || !canUploadMore}
            id="fileInput"
            style={{ display: 'none' }}
          />
          <label
            htmlFor="fileInput"
            className={`drop-label ${!canUploadMore ? 'disabled' : ''}`}
          >
            {canUploadMore
              ? 'Click here (PDF & CSV only)'
              : `Maximum ${MAX_FILES} files reached`}
          </label>
        </div>

        {files.length > 0 && (
          <div className="file-list">
            <h3>
              Selected files ({files.length} / {MAX_FILES})
            </h3>
            <ul>
              {files.map((file, index) => (
                <li key={`\( {file.name}- \){index}`}>
                  <span>
                    {file.name} • {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    disabled={uploading}
                    className="remove-btn"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          type="submit"
          disabled={uploading || files.length === 0}
          className="upload-btn"
        >
          {uploading ? 'Uploading...' : 'Upload Files'}
        </button>

        {message && (
          <div
            className={`message ${
              message.includes('successful') ? 'success' : 'error'
            }`}
          >
            {message.split('\n').map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        )}
      </form>
    </div>
  );
}


export default FileUploader
