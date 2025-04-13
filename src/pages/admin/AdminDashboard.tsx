
import { useEffect, useState } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AdminDashboard = () => {
  const [storeCount, setStoreCount] = useState<number>(0);
  const [merchandiserCount, setMerchandiserCount] = useState<number>(0);
  const [completedVisitsCount, setCompletedVisitsCount] = useState<number>(0);
  const [pendingVisitsCount, setPendingVisitsCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        console.log('Fetching dashboard data...');
        
        // Fetch store count - Modified to use simpler query approach
        const { data: storesData, error: storesError } = await supabase
          .from('stores')
          .select('id');

        if (storesError) {
          console.error('Error fetching stores:', storesError);
          throw storesError;
        }
        
        console.log('Stores data:', storesData);
        setStoreCount(storesData?.length || 0);

        // Fetch merchandiser count
        const { data: merchandisers, error: merchandisersError } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'merchandiser');

        if (merchandisersError) {
          console.error('Error fetching merchandisers:', merchandisersError);
          throw merchandisersError;
        }
        
        console.log('Merchandisers data:', merchandisers);
        setMerchandiserCount(merchandisers?.length || 0);

        // Fetch completed visits count - Modified to use simpler query approach
        const { data: completedData, error: completedError } = await supabase
          .from('store_visits')
          .select('id')
          .not('completed_at', 'is', null);

        if (completedError) {
          console.error('Error fetching completed visits:', completedError);
          throw completedError;
        }
        
        console.log('Completed visits data:', completedData);
        setCompletedVisitsCount(completedData?.length || 0);

        // Fetch pending visits count - Modified to use simpler query approach
        const { data: pendingData, error: pendingError } = await supabase
          .from('store_visits')
          .select('id')
          .is('completed_at', null);

        if (pendingError) {
          console.error('Error fetching pending visits:', pendingError);
          throw pendingError;
        }
        
        console.log('Pending visits data:', pendingData);
        setPendingVisitsCount(pendingData?.length || 0);

      } catch (error: any) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data: ' + (error.message || 'Unknown error'),
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of merchandiser activity and store visits
        </p>

        {loading ? (
          <div className="flex justify-center p-8">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
              <p className="mt-2">Loading dashboard data...</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Stores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{storeCount}</div>
                <p className="text-xs text-muted-foreground">
                  Stores in the database
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Merchandisers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{merchandiserCount}</div>
                <p className="text-xs text-muted-foreground">
                  Active merchandisers
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Completed Visits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completedVisitsCount}</div>
                <p className="text-xs text-muted-foreground">
                  Total completed store visits
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Visits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingVisitsCount}</div>
                <p className="text-xs text-muted-foreground">
                  Scheduled but not completed
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
