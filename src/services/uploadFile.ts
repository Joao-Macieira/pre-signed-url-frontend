import axios from 'axios';

export async function uploadFile(
  url: string,
  file: File,
  onProgress?: (progress: number) => void,
) {
  await axios.put(url, file, {
    headers: {
      'Content-Type': file.type,
    },
    onUploadProgress: ({ total, loaded }) => {
      const percentage = total ? Math.round((loaded * 100) / total) : 0;

      onProgress?.(percentage);
    },
  });
}
