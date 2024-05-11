import { Loader2Icon, PackageOpenIcon, Trash2Icon } from 'lucide-react';
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';

import { Button } from './components/Button';
import { Progress } from './components/Progress';
import { Toaster } from './components/Toaster';
import { cn } from './lib/utils';
import { getPresignedURL } from './services/getPresignedURL';
import { uploadFile } from './services/uploadFile';

interface IUpload {
  file: File;
  progress: number;
}

export function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [uploads, setUploads] = useState<IUpload[]>([]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      setUploads((prevState) =>
        prevState.concat(acceptedFiles.map((file) => ({ file, progress: 0 }))),
      );
    },
  });

  function handleRemoveUpload(removingIndex: number) {
    setUploads((prevState) => {
      const newState = [...prevState];

      newState.splice(removingIndex, 1);

      return newState;
    });
  }

  async function handleUpload() {
    try {
      setIsLoading(true);

      const uploadObjects = await Promise.all(
        uploads.map(async ({ file }) => ({
          url: await getPresignedURL(file),
          file,
        })),
      );

      const responses = await Promise.allSettled(
        uploadObjects.map(async ({ file, url }, index) =>
          uploadFile(url, file, (progress) => {
            setUploads((prevState) => {
              const newState = [...prevState];
              const upload = newState[index];

              newState[index] = {
                ...upload,
                progress,
              };
              return newState;
            });
          }),
        ),
      );

      responses.forEach((response, index) => {
        const fileWithErrors = uploads[index];

        if (response.status === 'rejected') {
          console.log(`O upload do arquivo ${fileWithErrors.file.name} falhou`);
        }
      });

      setUploads([]);
      toast.success('Uploads realizados com sucesso!');
    } catch {
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen justify-center px-6 py-20">
      <Toaster />
      <div className="w-full max-w-xl">
        <div
          {...getRootProps()}
          className={cn(
            'flex h-60 w-full cursor-pointer flex-col items-center justify-center rounded-md border border-dashed transition-colors',
            isDragActive && 'bg-accent/50',
          )}
        >
          <input {...getInputProps()} />

          <PackageOpenIcon className="mb-2 size-10 stroke-1" />

          <span>Solte os seus arquivos aqui</span>

          <small className="text-muted-foreground">
            Apenas arquivos PNG de até 1MB
          </small>
        </div>

        {uploads.length > 0 && (
          <div className="mt-10">
            <h2 className="text-2xl font-medium tracking-tight">
              Arquivos selecionados
            </h2>

            <div className="mt-4 space-y-2">
              {uploads.map(({ file, progress }, index) => (
                <div key={file.name} className="rounded-md border p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{file.name}</span>

                    <Button
                      onClick={() => handleRemoveUpload(index)}
                      variant="destructive"
                      size="icon"
                    >
                      <Trash2Icon className="size-4" />
                    </Button>
                  </div>

                  <Progress className="mt-3 h-2" value={progress} />
                </div>
              ))}
            </div>

            <Button
              className="mt-4 w-full gap-1"
              disabled={isLoading}
              onClick={handleUpload}
            >
              {isLoading && <Loader2Icon className="size-4 animate-spin" />}
              Upload
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
