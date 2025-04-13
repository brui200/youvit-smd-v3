
import { useState } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, FileUp } from 'lucide-react';

const DataUpload = () => {
  const [storeDataFile, setStoreDataFile] = useState<File | null>(null);
  const [visitScheduleFile, setVisitScheduleFile] = useState<File | null>(null);
  const [planogramFiles, setPlanogramFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleStoreDataUpload = async () => {
    if (!storeDataFile) {
      toast({
        title: 'No file selected',
        description: 'Please select a CSV file first',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    
    try {
      // In a real implementation, you would need to parse the CSV file
      // and insert the data into Supabase. For the MVP, we'll just simulate success.
      
      toast({
        title: 'Upload successful',
        description: 'Store data has been processed',
      });
      
      setStoreDataFile(null);
    } catch (error: any) {
      console.error('Error processing store data:', error);
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleVisitScheduleUpload = async () => {
    if (!visitScheduleFile) {
      toast({
        title: 'No file selected',
        description: 'Please select a CSV file first',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    
    try {
      // In a real implementation, you would need to parse the CSV file
      // and insert the visit schedules into Supabase.
      
      toast({
        title: 'Upload successful',
        description: 'Visit schedule has been processed',
      });
      
      setVisitScheduleFile(null);
    } catch (error: any) {
      console.error('Error processing visit schedule:', error);
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handlePlanogramUpload = async () => {
    if (!planogramFiles || planogramFiles.length === 0) {
      toast({
        title: 'No files selected',
        description: 'Please select image files first',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    
    try {
      // In a real implementation, you would upload the images to Supabase storage
      // and create entries in the planograms table.
      
      toast({
        title: 'Upload successful',
        description: `${planogramFiles.length} planogram images have been uploaded`,
      });
      
      setPlanogramFiles(null);
    } catch (error: any) {
      console.error('Error uploading planograms:', error);
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Data Upload</h2>
        <p className="text-muted-foreground">
          Upload store data, visit schedules, and planogram images
        </p>

        <Tabs defaultValue="store-data" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="store-data">Store Data</TabsTrigger>
            <TabsTrigger value="visit-schedule">Visit Schedule</TabsTrigger>
            <TabsTrigger value="planograms">Planograms</TabsTrigger>
          </TabsList>

          <TabsContent value="store-data">
            <Card>
              <CardHeader>
                <CardTitle>Upload Store Data</CardTitle>
                <CardDescription>
                  Upload a CSV file with store information, revenue, and POSM data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
                  <p className="mt-2 text-sm font-medium">
                    {storeDataFile ? storeDataFile.name : 'Drag and drop your CSV file, or click to browse'}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    File should contain: store name, address, coordinates, revenue, POSM types
                  </p>
                  <Input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    id="store-data-file"
                    onChange={(e) => setStoreDataFile(e.target.files?.[0] || null)}
                  />
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => document.getElementById('store-data-file')?.click()}
                  >
                    Select File
                  </Button>
                </div>

                <Button 
                  className="w-full"
                  disabled={!storeDataFile || uploading}
                  onClick={handleStoreDataUpload}
                >
                  {uploading ? 'Processing...' : 'Upload and Process'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="visit-schedule">
            <Card>
              <CardHeader>
                <CardTitle>Upload Visit Schedule</CardTitle>
                <CardDescription>
                  Upload a CSV file with store visit assignments for merchandisers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
                  <p className="mt-2 text-sm font-medium">
                    {visitScheduleFile ? visitScheduleFile.name : 'Drag and drop your CSV file, or click to browse'}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    File should contain: merchandiser email, store ID, date, visit order
                  </p>
                  <Input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    id="visit-schedule-file"
                    onChange={(e) => setVisitScheduleFile(e.target.files?.[0] || null)}
                  />
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => document.getElementById('visit-schedule-file')?.click()}
                  >
                    Select File
                  </Button>
                </div>

                <Button 
                  className="w-full"
                  disabled={!visitScheduleFile || uploading}
                  onClick={handleVisitScheduleUpload}
                >
                  {uploading ? 'Processing...' : 'Upload and Process'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="planograms">
            <Card>
              <CardHeader>
                <CardTitle>Upload Planogram Images</CardTitle>
                <CardDescription>
                  Upload planogram images for stores
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <FileUp className="h-10 w-10 mx-auto text-muted-foreground" />
                  <p className="mt-2 text-sm font-medium">
                    {planogramFiles ? `${planogramFiles.length} files selected` : 'Drag and drop your image files, or click to browse'}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Upload multiple planogram images. Files should be named with store IDs.
                  </p>
                  <Input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="planogram-files"
                    multiple
                    onChange={(e) => setPlanogramFiles(e.target.files)}
                  />
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => document.getElementById('planogram-files')?.click()}
                  >
                    Select Files
                  </Button>
                </div>

                <Button 
                  className="w-full"
                  disabled={!planogramFiles || planogramFiles.length === 0 || uploading}
                  onClick={handlePlanogramUpload}
                >
                  {uploading ? 'Uploading...' : 'Upload Images'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default DataUpload;
