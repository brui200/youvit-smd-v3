
import { useState, useCallback } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { populateJakartaStores } from '@/utils/populateStores';
import { Progress } from '@/components/ui/progress';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const PopulateData = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [storeCount, setStoreCount] = useState(200);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handlePopulateStores = async () => {
    setIsLoading(true);
    setProgress(0);
    setError(null);
    
    try {
      // Show initial toast
      toast({
        title: 'Starting data population',
        description: `This may take a moment. Adding ${storeCount} stores...`,
      });
      
      // Start progress animation
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 5;
        });
      }, 1000);
      
      const result = await populateJakartaStores(storeCount);
      
      clearInterval(progressInterval);
      
      if (result.success) {
        setProgress(100);
        toast({
          title: 'Success!',
          description: `Successfully added ${result.count} stores to the database.`,
        });
      } else {
        setProgress(0);
        setError('Failed to populate stores. Check console for details.');
        toast({
          title: 'Error',
          description: 'Failed to populate stores. Check console for details.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error populating stores:', error);
      setError('An unexpected error occurred. Check console for details.');
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Populate Test Data</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Populate Jakarta Stores</CardTitle>
            <CardDescription>
              Generate random store data located in Jakarta for testing purposes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="store-count">Number of Stores</Label>
                <Input 
                  id="store-count"
                  type="number"
                  value={storeCount}
                  onChange={(e) => setStoreCount(parseInt(e.target.value) || 0)}
                  min={1}
                  max={500}
                />
              </div>
              
              {isLoading && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Adding stores...</p>
                  <Progress value={progress} className="h-2" />
                </div>
              )}
              
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              
              <p className="text-sm text-muted-foreground">
                This will generate random Jakarta-based stores with realistic names, addresses, 
                and coordinates. The operation may take some time.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handlePopulateStores} 
              disabled={isLoading || storeCount <= 0}
              className="w-full"
            >
              {isLoading ? 'Generating Stores...' : `Generate ${storeCount} Stores`}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default PopulateData;
