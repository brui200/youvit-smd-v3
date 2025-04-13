
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
import { ChevronRight, MapPin, CheckCircle, AlertCircle } from 'lucide-react';
import { StoreVisit, Store } from '@/types';
import { useNavigate } from 'react-router-dom';

// Modified type to avoid the relationship error
type StoreVisitWithStore = StoreVisit & { 
  store: Store;
};

const MerchandiserHome = () => {
  const [todayVisits, setTodayVisits] = useState<StoreVisitWithStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchTodayVisits = async () => {
      if (!user) return;

      try {
        setError(null);
        console.log('Fetching visits for merchandiser:', user.id);
        
        // First fetch the visits with stores, avoiding the store_posms relationship
        const { data: visitsData, error: visitsError } = await supabase
          .from('store_visits')
          .select(`
            *,
            store:stores(*)
          `)
          .eq('merchandiser_id', user.id)
          .eq('scheduled_date', today)
          .order('visit_order', { ascending: true });

        if (visitsError) {
          console.error('Error fetching visits:', visitsError);
          setError(visitsError.message);
          throw visitsError;
        }

        if (!visitsData || visitsData.length === 0) {
          console.log('No visits found for today');
          setTodayVisits([]);
          setLoading(false);
          return;
        }

        console.log('Visits fetched successfully:', visitsData);
        
        // For each visit, fetch the POSMs separately to avoid the relationship error
        const visitsWithAll = await Promise.all(
          visitsData.map(async (visit) => {
            // Fetch POSMs for this store
            const { data: posmsData } = await supabase
              .from('store_posms')
              .select('*')
              .eq('store_id', visit.store_id);
              
            return {
              ...visit,
              store_posms: posmsData || []
            };
          })
        );
        
        // Type casting to match what the component expects
        setTodayVisits(visitsWithAll as StoreVisitWithStore[]);
        
        // Calculate progress
        if (visitsWithAll.length > 0) {
          const completed = visitsWithAll.filter(visit => visit.completed_at).length;
          setProgress(Math.round((completed / visitsWithAll.length) * 100));
        }
      } catch (error: any) {
        console.error('Error in visit fetching process:', error);
        setError(error.message);
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
        ) : error ? (
          <div className="text-center py-8 text-red-500 flex flex-col items-center">
            <AlertCircle className="h-8 w-8 mb-2" />
            <p className="text-lg font-medium">Error loading visits</p>
            <p className="text-sm mt-1">{error}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
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
