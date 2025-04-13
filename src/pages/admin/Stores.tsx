
import { useState, useEffect } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Store } from '@/types';
import { formatCurrency } from '@/utils/format';
import { Store as LucideStore, AlertCircle } from 'lucide-react';

const Stores = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStores = async () => {
      try {
        console.log('Fetching stores from admin page...');
        setError(null);
        
        // Use the rpc function to bypass RLS
        const { data, error } = await supabase
          .rpc('get_all_stores')
          .order('name');
          
        if (error) {
          console.error('Error fetching stores:', error);
          setError(error.message);
          throw error;
        }
        
        console.log('Stores fetched:', data);
        setStores(data || []);
      } catch (error: any) {
        console.error('Error fetching stores:', error);
        setError(error.message);
        toast({
          title: 'Error',
          description: 'Failed to load stores: ' + error.message,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, [toast]);

  const filteredStores = stores.filter(store => 
    store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold tracking-tight">Stores</h2>
          <Button>Add New Store</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LucideStore className="h-5 w-5" />
              Store List ({stores.length} stores)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Input
                placeholder="Search stores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {loading ? (
              <div className="text-center py-4">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
                <p className="mt-2">Loading stores...</p>
              </div>
            ) : error ? (
              <div className="text-center py-4 text-red-500 flex flex-col items-center">
                <AlertCircle className="h-8 w-8 mb-2" />
                <p>Error loading stores: {error}</p>
                <p className="text-sm mt-2">Please check the database connection or permissions.</p>
              </div>
            ) : filteredStores.length === 0 ? (
              <div className="text-center py-4">
                <p>{searchTerm ? 'No stores found matching your search' : 'No stores found in the database'}</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Monthly Revenue</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStores.map((store) => (
                      <TableRow key={store.id}>
                        <TableCell className="font-medium">{store.name}</TableCell>
                        <TableCell>{store.address}</TableCell>
                        <TableCell>{formatCurrency(store.monthly_revenue || 0)}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">View</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Stores;
