import React, { useState, useRef } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ImageUploadProps {
  bucket: string;
  onUpload: (url: string) => void;
  currentImage?: string;
  className?: string;
  maxSize?: number; // in MB
  acceptedFormats?: string[];
  recommendedRatio?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  bucket,
  onUpload,
  currentImage,
  className = '',
  maxSize = 1,
  acceptedFormats = ['.jpg', '.jpeg', '.png'],
  recommendedRatio = '1:1'
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `Datoteka je prevelika. Maksimalna velikost je ${maxSize}MB.`;
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedFormats.includes(fileExtension)) {
      return `Nepodprta vrsta datoteke. Podprti formati: ${acceptedFormats.join(', ')}`;
    }

    return null;
  };

  const uploadFile = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      toast({
        title: "Napaka pri nalaganju",
        description: validationError,
        variant: "destructive"
      });
      return;
    }

    try {
      setUploading(true);

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      onUpload(publicUrl);
      
      toast({
        title: "Uspešno naloženo",
        description: "Slika je bila uspešno naložena."
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Napaka pri nalaganju",
        description: "Prišlo je do napake pri nalaganju slike.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0]);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    onUpload('');
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats.join(',')}
        onChange={handleChange}
        className="hidden"
      />
      
      {currentImage ? (
        <Card className="relative">
          <CardContent className="p-0">
            <div className="relative aspect-square">
              <img
                src={currentImage}
                alt="Naložena slika"
                className="w-full h-full object-cover rounded-lg"
              />
              <Button
                variant="destructive"
                size="sm"
                onClick={removeImage}
                className="absolute top-2 right-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card
          className={`border-2 border-dashed transition-colors cursor-pointer ${
            dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
          } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={uploading ? undefined : openFileDialog}
        >
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <Upload className="w-12 h-12 text-muted-foreground mx-auto" />
              <div>
                <p className="text-lg font-medium">
                  {uploading ? 'Nalagam...' : 'Povlecite sliko sem ali kliknite za izbiro'}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Maksimalna velikost: {maxSize}MB
                </p>
                <p className="text-sm text-muted-foreground">
                  Podprti formati: {acceptedFormats.join(', ')}
                </p>
                <p className="text-sm text-muted-foreground">
                  Priporočeno razmerje: {recommendedRatio}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Info tooltip */}
      <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-700 dark:text-blue-300">
            <p><strong>Nasveti za kakovostne slike:</strong></p>
            <ul className="mt-1 space-y-1">
              <li>• Uporabite visoko ločljivost</li>
              <li>• Poskrbite za dobro osvetlitev</li>
              <li>• Izogibajte se zamegljenim slikam</li>
              <li>• Priporočeno razmerje: {recommendedRatio}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};