import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  disabled?: boolean;
}

export const ImageUpload = ({ value, onChange, onRemove, disabled }: ImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [isUrlUploading, setIsUrlUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const processFile = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file (PNG, JPG, WEBP)',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image smaller than 5MB',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      onChange(data.publicUrl);
      
      toast({
        title: 'Success',
        description: 'Image uploaded successfully',
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      const status = (error && (error.status || error.statusCode)) as number | undefined;
      const friendly = status === 401 || status === 403
        ? 'You do not have permission to upload images. Please sign in as an admin.'
        : (error?.message || 'Failed to upload image');
      toast({
        title: 'Upload failed',
        description: friendly,
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const handleRemove = async () => {
    if (value && onRemove) {
      try {
        // Extract file path from public URL safely
        let filePath = '';
        try {
          const url = new URL(value);
          const marker = '/storage/v1/object/public/product-images/';
          const idx = url.pathname.indexOf(marker);
          if (idx !== -1) {
            filePath = decodeURIComponent(url.pathname.substring(idx + marker.length));
          } else {
            // Fallback to last 2 segments (e.g., products/filename)
            const parts = url.pathname.split('/');
            filePath = parts.slice(-2).join('/');
          }
        } catch {}
        if (!filePath) {
          throw new Error('Could not resolve image path for deletion.');
        }

        // Delete from storage
        await supabase.storage
          .from('product-images')
          .remove([filePath]);

        onRemove();
        
        toast({
          title: 'Success',
          description: 'Image removed successfully',
        });
      } catch (error: any) {
        console.error('Remove error:', error);
        const status = (error && (error.status || error.statusCode)) as number | undefined;
        const friendly = status === 401 || status === 403
          ? 'You do not have permission to remove images. Please sign in as an admin.'
          : (error?.message || 'Failed to remove image');
        toast({
          title: 'Remove failed',
          description: friendly,
          variant: 'destructive',
        });
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await processFile(file);
  };

  const handlePaste = async (e: React.ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file) {
          await processFile(file);
          break;
        }
      }
    }
  };

  const handleUrlUpload = async () => {
    if (!imageUrl) {
      toast({
        title: 'No URL',
        description: 'Please paste an image URL',
        variant: 'destructive',
      });
      return;
    }
    setIsUrlUploading(true);
    try {
      const res = await fetch(imageUrl, { mode: 'cors' });
      if (!res.ok) throw new Error('Could not fetch image from URL');
      const blob = await res.blob();
      const ext = blob.type.split('/')[1] || 'jpg';
      const file = new File([blob], `url-image.${ext}`, { type: blob.type });
      await processFile(file);
      setImageUrl('');
    } catch (error: any) {
      console.error('URL upload error:', error);
      toast({
        title: 'Upload failed',
        description: error?.message || 'Could not upload from URL (may be blocked by CORS)',
        variant: 'destructive',
      });
    } finally {
      setIsUrlUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Label htmlFor="image-upload">Product Image</Label>
      
      {value ? (
        <div className="space-y-3">
          <div
            className="relative w-full h-48 border-2 border-dashed border-border rounded-lg overflow-hidden"
            onPaste={handlePaste}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <img
              src={value}
              alt="Product"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || isUploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                Replace
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemove}
                disabled={disabled || isUploading}
              >
                <X className="h-4 w-4 mr-2" />
                Remove
              </Button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Tip: Drag & drop or paste an image here to replace.
          </p>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                aria-label="Image URL"
              />
              <Button
                type="button"
                onClick={handleUrlUpload}
                disabled={disabled || isUploading || isUrlUploading}
              >
                {isUrlUploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Upload from URL
              </Button>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.setAttribute('capture', 'environment');
                  fileInputRef.current.click();
                }
              }}
              disabled={disabled || isUploading}
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              Use Camera
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div
            className={`relative w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${isDragging ? 'border-primary bg-primary/5' : 'border-border'}`}
            onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onPaste={handlePaste}
            tabIndex={0}
            role="button"
            aria-label="Upload image"
          >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Click, drag & drop, or paste image</p>
              <p className="text-xs text-muted-foreground">PNG, JPG, WEBP up to 5MB</p>
            </div>
          )}
        </div>

        <div className="mt-3 flex flex-col sm:flex-row gap-2">
          <div className="flex-1 flex gap-2">
            <Input
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              aria-label="Image URL"
            />
            <Button
              type="button"
              onClick={handleUrlUpload}
              disabled={disabled || isUploading || isUrlUploading}
            >
              {isUrlUploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Upload from URL
            </Button>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.setAttribute('capture', 'environment');
                fileInputRef.current.click();
              }
            }}
            disabled={disabled || isUploading}
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Use Camera
          </Button>
        </div>
        </div>
      )}

      <Input
        ref={fileInputRef}
        id="image-upload"
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        disabled={disabled || isUploading}
        className="hidden"
      />
    </div>
  );
};