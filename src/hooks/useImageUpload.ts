// Hook para subir imágenes a Supabase Storage con compresión automática
import { useState } from 'react';
import { supabase } from '@/db/supabase';
import { toast } from 'sonner';

async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      const MAX = 1080;
      if (width > MAX || height > MAX) {
        if (width > height) { height = Math.round((height * MAX) / width); width = MAX; }
        else { width = Math.round((width * MAX) / height); height = MAX; }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('No se pudo comprimir la imagen'));
      }, 'image/webp', 0.8);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export function useImageUpload(bucket: string) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const upload = async (file: File, folder = 'uploads'): Promise<string | null> => {
    const ALLOWED = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
    if (!ALLOWED.includes(file.type)) {
      toast.error('Formato no permitido. Usa JPEG, PNG, GIF, WEBP o AVIF.');
      return null;
    }

    setUploading(true);
    setProgress(10);

    try {
      let uploadFile: File | Blob = file;
      let contentType = file.type;

      if (file.size > 1024 * 1024) {
        toast.info('Comprimiendo imagen automáticamente...');
        uploadFile = await compressImage(file);
        contentType = 'image/webp';
        const compressedKB = Math.round(uploadFile.size / 1024);
        toast.info(`Imagen comprimida: ${compressedKB} KB`);
      }

      setProgress(50);

      const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
      const filePath = `${folder}/${crypto.randomUUID()}_${safeName.replace(/\.[^.]+$/, '.webp')}`;

      const { error } = await supabase.storage.from(bucket).upload(filePath, uploadFile, {
        contentType,
        upsert: false,
      });

      if (error) throw error;
      setProgress(100);

      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
      toast.success('Imagen subida correctamente');
      return urlData.publicUrl;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al subir imagen';
      toast.error(`Error: ${msg}`);
      return null;
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  return { upload, uploading, progress };
}
