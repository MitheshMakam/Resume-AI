import { useDropzone } from 'react-dropzone'
import { Upload, FileText } from 'lucide-react'
import clsx from 'clsx'

export default function UploadZone({ onFile, loading, fileName }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
    maxFiles: 1,
    onDrop: (files) => files[0] && onFile(files[0]),
  })

  return (
    <div
      {...getRootProps()}
      className={clsx(
        'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all',
        isDragActive ? 'border-brand-500 bg-brand-500/5' : 'border-zinc-700 hover:border-zinc-500',
        loading && 'pointer-events-none opacity-60'
      )}
    >
      <input {...getInputProps()} />
      {fileName ? (
        <>
          <FileText size={32} className="mx-auto text-brand-500 mb-3" />
          <p className="text-sm font-medium text-white">{fileName}</p>
          <p className="text-xs text-zinc-500 mt-1">Click to replace</p>
        </>
      ) : (
        <>
          <Upload size={32} className="mx-auto text-zinc-500 mb-3" />
          <p className="text-sm font-medium text-zinc-300">Drop your resume here</p>
          <p className="text-xs text-zinc-600 mt-1">PDF or DOCX · up to 5 MB</p>
        </>
      )}
      {loading && <p className="text-xs text-brand-500 mt-2 animate-pulse">Analyzing…</p>}
    </div>
  )
}
