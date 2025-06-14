import React from 'react';
import { Upload } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUpload } from '@/components/ui/image-upload';

interface RestaurantLogoUploadProps {
  logoUrl?: string;
  onUpload: (url: string) => void;
}

export const RestaurantLogoUpload: React.FC<RestaurantLogoUploadProps> = ({
  logoUrl,
  onUpload
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Logotip restavracije
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ImageUpload
          currentImage={logoUrl}
          onUpload={onUpload}
          bucket="restaurant-logos"
          maxSize={1}
          acceptedFormats={['.jpg', '.jpeg', '.png', '.webp']}
          className="w-full h-48"
        />
        <p className="text-xs text-muted-foreground mt-2">
          Logotip mora biti PNG, JPG ali WebP, do 1MB, optimalna dimenzija 300x300px.
        </p>
      </CardContent>
    </Card>
  );
};