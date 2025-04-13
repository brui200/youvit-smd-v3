
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import MerchandiserLayout from '@/layouts/MerchandiserLayout';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronRight, MapPin, CheckCircle } from 'lucide-react';
import { StoreVisit, Store, StorePOSM } from '@/types';
import { useNavigate } from 'react-router-dom';

type StoreVisitWithJoins = StoreVisit & { 
  store: Store;
  store_posms: StorePOSM[] | null; // Can be null if there are no POSMs
};

const MerchandiserHome = () => {
  const [todayVisits, setTodayVisits] = useState<StoreVisitWithJoins[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchTodayVisits = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('store_visits')
          .select(`
            *,
            store:stores(*),
            store_posms:store_posms(*)
          `)
          .eq('merchandiser_id', user.id)
          .eq('scheduled_date', today)
          .order('visit_order', { ascending: true });

        if (error) throw error;

        // Safe type conversion with explicit checking for array structure
        const typedData: StoreVisitWithJoins[] = [];
        
        if (data && Array.isArray(data)) {
          data.forEach((item: any) => {
            // Ensure store_posms is an array or null
            const safeStorePosms = Array.isArray(item.store_posms) ? item.store_posms : null;
            
            // Create a properly typed visit object
            typedData.push({
              ...item,
              store_posms: safeStorePosms
            });
          });
        }
        
        setTodayVisits(typedData);
        
        // Calculate progress
        if (typedData.length > 0) {
          const completed = typedData.filter(visit => visit.completed_at).length;
          setProgress(Math.round((completed / typedData.length) * 100));
        }
      } catch (error: any) {
        console.error('Error fetching visits:', error);
        toast({
          title: 'Failed to load visits',
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTodayVisits();
  }, [user, today, toast]);

  const handleStoreClick = (visitId: string) => {
    navigate(`/visit/${visitId}`);
  };

  return (
    <MerchandiserLayout>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Today's Visits</h1>
          <p className="text-sm text-muted-foreground">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>

          <div className="mt-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">Daily Progress</span>
              <span className="text-sm font-medium">
                {todayVisits.filter(visit => visit.completed_at).length} of {todayVisits.length} completed
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-8">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
              <p className="mt-2">Loading your visits...</p>
            </div>
          </div>
        ) : todayVisits.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-lg font-medium">No visits scheduled for today</p>
            <p className="text-sm text-muted-foreground mt-1">
              Check back later or contact your supervisor
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {todayVisits.map((visit) => (
              <Card key={visit.id} className={visit.completed_at ? "opacity-70" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">
                      {visit.store.name}
                      {visit.completed_at && (
                        <CheckCircle className="h-5 w-5 text-green-500 inline ml-2" />
                      )}
                    </CardTitle>
                    <Badge variant="outline">
                      Visit #{visit.visit_order}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                    <p className="text-sm text-muted-foreground">{visit.store.address}</p>
                  </div>
                  
                  {visit.store_posms && visit.store_posms.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium mb-1">POSM to check:</p>
                      <div className="flex flex-wrap gap-1">
                        {visit.store_posms.map((posm) => (
                          <Badge key={posm.id} variant="secondary" className="text-xs">
                            {posm.posm_type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {visit.store.instructions && (
                    <div className="mt-3">
                      <p className="text-xs font-medium mb-1">Instructions:</p>
                      <p className="text-xs text-muted-foreground">
                        {visit.store.instructions}
                      </p>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button 
                    variant={visit.completed_at ? "outline" : "default"} 
                    className="w-full flex justify-between items-center"
                    onClick={() => handleStoreClick(visit.id)}
                  >
                    {visit.completed_at ? "View Details" : "Start Visit"}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MerchandiserLayout>
  );
};

export default MerchandiserHome;
