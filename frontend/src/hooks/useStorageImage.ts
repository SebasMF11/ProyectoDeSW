import { useCallback } from "react";
import { supabase } from "../integrations/supabase";

/*
 * Hook para obtener URLs públicas de imágenes almacenadas en Supabase Storage
 *  @param bucketName - Nombre del bucket (por defecto 'images')
 */
export const useStorageImage = (bucketName: string = "images") => {
  const getImageUrl = useCallback(
    (imagePath: string): string => {
      const { data } = supabase.storage
        .from(bucketName)
        .getPublicUrl(imagePath);
      return data.publicUrl;
    },
    [bucketName],
  );

  return getImageUrl;
};
