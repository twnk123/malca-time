import React, { useState, useRef } from 'react';
import { Upload, X, ImageIcon, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ImageUploadProps {
  onUpload: (url: string) => void;
  currentImage?: string;
  bucket: string;
  maxSize?: number; // in MB
  acceptedFormats?: string[];
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onUpload,
  currentImage,
  bucket,
  maxSize = 1,
  acceptedFormats = ['.jpg', '.jpeg', '.png'],
  className = ''
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file size
      if (file.size > maxSize * 1024 * 1024) {
        toast({
          title: "Datoteka prevelika",
          description: `Največja dovoljena velikost je ${maxSize}MB`,
          variant: "destructive"
        });
        return;
      }

      // Validate file format
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!acceptedFormats.includes(fileExtension)) {
        toast({
          title: "Nepodprt format",
          description: `Podprti formati: ${acceptedFormats.join(', ')}`,
          variant: "destructive"
        });
        return;
      }

      setUploading(true);
      setUploadProgress(0);

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 100);

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      onUpload(data.publicUrl);
      
      toast({
        title: "Uspešno naloženo",
        description: "Slika je bila uspešno naložena."
      });

    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Napaka",
        description: "Prišlo je do napake pri nalaganju slike.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    onUpload('');
    toast({
      title: "Slika odstranjena",
      description: "Slika je bila uspešno odstranjena."
    });
  };

  return (
    <TooltipProvider>
      <div className={`relative isolate ${className}`} style={{ zIndex: 1 }}>
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats.join(',')}
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />

        {currentImage ? (
          <div className="relative group overflow-hidden rounded-lg h-32">
            <img
              src={currentImage}
              alt="Naložena slika"
              className="w-full h-full object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
              <div className="flex space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Upload className="w-4 h-4 mr-1" />
                  Zamenjaj
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleRemoveImage}
                  disabled={uploading}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors overflow-hidden"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">
              Kliknite za nalaganje slike
            </p>
            <div className="flex items-center justify-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                    <Info className="w-3 h-3 mr-1" />
                    Zahteve
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="z-50">
                  <div className="text-xs space-y-1">
                    <p>Največja velikost: {maxSize}MB</p>
                    <p>Podprti formati: {acceptedFormats.join(', ')}</p>
                    <p>Priporočeno razmerje: 1:1 ali 4:3</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 bg-background/80 rounded-lg flex items-center justify-center z-10">
            <div className="text-center space-y-2">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <Progress value={uploadProgress} className="w-32" />
              <p className="text-xs text-muted-foreground">Nalaganje...</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Add substantial spacing below component to prevent overlap */}
      <div className="h-16" />
    </TooltipProvider>
  );
};