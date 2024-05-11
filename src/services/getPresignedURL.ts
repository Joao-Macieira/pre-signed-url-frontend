import axios from 'axios';

export async function getPresignedURL(file: File) {
  const { data } = await axios.post<{ signedUrl: string }>(
    import.meta.env.VITE_API_URL,
    {
      filename: file.name,
    },
  );

  return data.signedUrl;
}
