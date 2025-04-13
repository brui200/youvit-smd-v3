
import { useEffect, useState } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

const AdminDashboard = () => {
  const [storeCount, setStoreCount] = useState<number>(0);
  const [merchandiserCount, setMerchandiserCount] = useState<number>(0);
  const [completedVisitsCount, setCompletedVisitsCount] = useState<number>(0);
  const [pendingVisitsCount, setPendingVisitsCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        console.log('Fetching dashboard data...');
        
        // Add debug information to see current auth state
        console.log('Current user:', user);
        
        // Use stored functions to bypass RLS issues
        const { data: countsData, error: countsError } = await supabase.rpc('get_admin_dashboard_counts');
        
        if (countsError) {
          console.error('Error fetching dashboard counts:', countsError);
          toast({
            title: 'Error',
            description: 'Failed to load dashboard data: ' + countsError.message,
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }
        
        console.log('Dashboard counts:', countsData);
        
        if (countsData) {
          setStoreCount(countsData.store_count || 0);
          setMerchandiserCount(countsData.merchandiser_count || 0);
          setCompletedVisitsCount(countsData.completed_visits_count || 0);
          setPendingVisitsCount(countsData.pending_visits_count || 0);
        }
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
  }, [toast, user]);

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
