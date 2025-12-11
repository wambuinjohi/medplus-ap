import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, X, Loader2, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import { uploadProductImage } from '@/utils/imageUploadService';

export interface UploadedImage {
  id?: string;
  url: string;
  altText?: string;
  displayOrder: number;
}

interface MultiImageUploadFieldProps {
  value: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  variantName: string;
}

export const MultiImageUploadField = ({
  value,
  onChange,
  variantName,
}: MultiImageUploadFieldProps) => {
  const [uploading, setUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [images, setImages] = useState<UploadedImage[]>(value || []);

  useEffect(() => {
    setImages(value || []);
  }, [value]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);

      const result = await uploadProductImage(file, variantName);

      if (!result.success) {
        toast.error(result.error || 'Failed to upload image');
        return;
      }

      if (!result.url) {
        toast.error('No URL returned from upload');
        return;
      }

      const newImage: UploadedImage = {
        url: result.url,
        altText: '',
        displayOrder: images.length,
      };

      const updatedImages = [...images, newImage];
      setImages(updatedImages);
      onChange(updatedImages);
      toast.success('Image uploaded successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to upload image';
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    const reorderedImages = updatedImages.map((img, idx) => ({
      ...img,
      displayOrder: idx,
    }));
    setImages(reorderedImages);
    onChange(reorderedImages);
  };

  const handleAltTextChange = (index: number, altText: string) => {
    const updatedImages = [...images];
    updatedImages[index].altText = altText;
    setImages(updatedImages);
    onChange(updatedImages);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const updatedImages = [...images];
    const draggedImage = updatedImages[draggedIndex];
    updatedImages.splice(draggedIndex, 1);
    updatedImages.splice(targetIndex, 0, draggedImage);
    updatedImages.forEach((img, idx) => {
      img.displayOrder = idx;
    });

    setImages(updatedImages);
    onChange(updatedImages);
    setDraggedIndex(targetIndex);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-4">
      {/* Existing Images Section - Show First */}
      {images.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm text-blue-900">
              Current Images ({images.length})
            </h4>
            {images.length > 1 && (
              <p className="text-xs text-blue-600">💡 Drag to reorder</p>
            )}
          </div>
          <div className="space-y-2">
            {images.map((image, index) => (
              <div
                key={index}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`flex gap-3 p-3 border rounded-lg items-start transition-colors ${
                  draggedIndex === index ? 'bg-muted' : 'bg-background'
                }`}
              >
                {images.length > 1 && (
                  <button
                    type="button"
                    className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
                    title="Drag to reorder"
                  >
                    <GripVertical size={18} />
                  </button>
                )}
                <div className="relative">
                  <img
                    src={image.url}
                    alt="Preview"
                    className="h-24 w-24 object-cover rounded border"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Input
                    type="text"
                    placeholder="Alt text (optional)"
                    value={image.altText || ''}
                    onChange={(e) => handleAltTextChange(index, e.target.value)}
                    className="text-sm"
                  />
                  <p className="text-xs text-muted-foreground break-all">
                    Position: {index + 1}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="mt-1 text-destructive hover:text-destructive/90 p-1 hover:bg-destructive/10 rounded transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Images are securely stored in cloud storage (max 5MB each)
      </p>
    </div>
  );
};
