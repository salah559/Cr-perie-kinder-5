import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AssetData {
  logo_files: string[];
  generated_images: string[];
  stock_images: string[];
}

export function AssetManager() {
  const [assets, setAssets] = useState<AssetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [replaceDialogOpen, setReplaceDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<{ file: string; category: string } | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const response = await fetch('/api/assets', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setAssets(data);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load assets',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to fetch assets:', error);
      toast({
        title: 'Error',
        description: 'Failed to load assets',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReplaceAsset = (file: string, category: string) => {
    setSelectedAsset({ file, category });
    setReplaceDialogOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid File',
          description: 'Please select an image file',
          variant: 'destructive',
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File Too Large',
          description: 'Image must be less than 5MB',
          variant: 'destructive',
        });
        return;
      }

      setUploadFile(file);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile || !selectedAsset) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', uploadFile);
      formData.append('targetFile', selectedAsset.file);
      formData.append('category', selectedAsset.category);

      const response = await fetch('/api/assets/replace', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Asset replaced successfully',
        });
        setReplaceDialogOpen(false);
        setUploadFile(null);
        setSelectedAsset(null);
        
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        const error = await response.json();
        toast({
          title: 'Upload Failed',
          description: error.error || 'Failed to replace asset',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Failed',
        description: 'An error occurred while replacing the asset',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Asset Manager</CardTitle>
          <CardDescription>Loading assets...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!assets) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Asset Manager</CardTitle>
          <CardDescription>Failed to load assets</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="w-6 h-6" />
          Asset Manager
        </CardTitle>
        <CardDescription>
          Replace placeholder images used throughout the site (logo, category images, etc.)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="logo" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="logo">Logo Files</TabsTrigger>
            <TabsTrigger value="generated">Generated Images</TabsTrigger>
            <TabsTrigger value="stock">Stock Images</TabsTrigger>
          </TabsList>

          <TabsContent value="logo" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {assets.logo_files.map((file) => (
                <div key={file} className="border rounded-lg p-3">
                  <img
                    src={`/attached_assets/${file}`}
                    alt={file}
                    className="w-full h-32 object-cover rounded mb-2"
                  />
                  <p className="text-xs font-medium truncate mb-2">{file}</p>
                  <Button
                    onClick={() => handleReplaceAsset(file, 'logo')}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <RefreshCw className="w-3 h-3 mr-2" />
                    Replace
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="generated" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {assets.generated_images.map((file) => (
                <div key={file} className="border rounded-lg p-3">
                  <img
                    src={`/attached_assets/generated_images/${file}`}
                    alt={file}
                    className="w-full h-32 object-cover rounded mb-2"
                  />
                  <p className="text-xs font-medium truncate mb-2">{file}</p>
                  <Button
                    onClick={() => handleReplaceAsset(file, 'generated_images')}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <RefreshCw className="w-3 h-3 mr-2" />
                    Replace
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="stock" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {assets.stock_images.map((file) => (
                <div key={file} className="border rounded-lg p-3">
                  <img
                    src={`/attached_assets/stock_images/${file}`}
                    alt={file}
                    className="w-full h-32 object-cover rounded mb-2"
                  />
                  <p className="text-xs font-medium truncate mb-2">{file}</p>
                  <Button
                    onClick={() => handleReplaceAsset(file, 'stock_images')}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <RefreshCw className="w-3 h-3 mr-2" />
                    Replace
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <Dialog open={replaceDialogOpen} onOpenChange={setReplaceDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Replace Asset</DialogTitle>
              <DialogDescription>
                Upload a new image to replace <strong>{selectedAsset?.file}</strong>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="image-upload">Select Image</Label>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
                {uploadFile && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Selected: {uploadFile.name} ({(uploadFile.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setReplaceDialogOpen(false);
                    setUploadFile(null);
                  }}
                  disabled={uploading}
                >
                  Cancel
                </Button>
                <Button onClick={handleUpload} disabled={!uploadFile || uploading}>
                  {uploading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload & Replace
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
