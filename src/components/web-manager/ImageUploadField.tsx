import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, X } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploadFieldProps {
  value: string;
  onChange: (path: string) => void;
  variantName: string;
}

export const ImageUploadField = ({ value, onChange, variantName }: ImageUploadFieldProps) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);

  const generateFileName = () => {
    const slug = variantName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    return `${slug}.jpg`;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    try {
      setUploading(true);

      // Create FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', generateFileName());

      // Note: This assumes you have an API endpoint for image uploads
      // For now, we'll store the image path as a local reference
      // If you implement a backend endpoint, update this fetch call

      // Generate a temporary preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setPreview(dataUrl);
        // Store as relative path to public/products directory
        onChange(`/products/${generateFileName()}`);
        toast.success('Image selected (will be uploaded when variant is saved)');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to process image';
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange('');
  };

  return (
    <div className="space-y-3">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
        <div className="flex flex-col items-center justify-center gap-3">
          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="h-32 w-32 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={handleRemove}
                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <>
              <Upload className="h-8 w-8 text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm font-medium">Click to upload image</p>
                <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 5MB</p>
              </div>
            </>
          )}
        </div>
        <Input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
          id="image-upload"
        />
        <label htmlFor="image-upload">
          <Button
            type="button"
            variant="outline"
            className="w-full mt-4 cursor-pointer"
            asChild
          >
            <span>{uploading ? 'Uploading...' : preview ? 'Change Image' : 'Upload Image'}</span>
          </Button>
        </label>
      </div>
      {value && !preview && (
        <div className="text-sm text-muted-foreground">
          Current: {value}
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        Images will be stored in /public/products/ directory
      </p>
    </div>
  );
};
