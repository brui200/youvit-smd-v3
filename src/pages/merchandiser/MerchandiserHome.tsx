
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
import { ChevronRight, MapPin, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface VisitSchedule {
  visit_id: string;
  date: string;
  merchandiser_id: string | null;
  store_id: string;
  store_name: string;
  address: string;
  lat: number;
  lng: number;
  area: string;
  revenue_importance: number;
  posm_types: string[];
  posm_reference_images: string[];
  planogram_url: string | null;
  visit_order: number;
  status: 'pending' | 'in_progress' | 'complete' | 'skipped';
  before_photo_url: string | null;
  after_photo_url: string | null;
  comments: string | null;
}

const MerchandiserHome = () => {
  const [todayVisits, setTodayVisits] = useState<VisitSchedule[]>([]);
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
        
        const { data: visitsData, error: visitsError } = await supabase
          .from('visit_schedule')
          .select('*')
          .eq('merchandiser_id', user.id)
          .eq('date', today)
          .order('visit_order', { ascending: true });

        if (visitsError) {
          console.error('Error fetching visits:', visitsError);
          setError(visitsError.message);
          throw visitsError;
        }

        console.log('Visits fetched successfully:', visitsData);
        setTodayVisits(visitsData || []);
        
        // Calculate progress
        if (visitsData && visitsData.length > 0) {
          const completed = visitsData.filter(visit => visit.status === 'complete').length;
          setProgress(Math.round((completed / visitsData.length) * 100));
        }
      } catch (err: any) {
        console.error('Error in visit fetching process:', err);
        setError(err.message);
        toast({
          title: 'Failed to load visits',
          description: err.message,
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'complete':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-500">In Progress</Badge>;
      case 'skipped':
        return <Badge className="bg-gray-500">Skipped</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
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
                {todayVisits.filter(visit => visit.status === 'complete').length} of {todayVisits.length} completed
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
              <Card key={visit.visit_id} className={visit.status === 'complete' ? "opacity-70" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">
                      {visit.store_name}
                      {visit.status === 'complete' && (
                        <CheckCircle className="h-5 w-5 text-green-500 inline ml-2" />
                      )}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(visit.status)}
                      <Badge variant="outline">
                        #{visit.visit_order}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                    <p className="text-sm text-muted-foreground">{visit.address}</p>
                  </div>
                  
                  {visit.posm_types.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium mb-1">POSM to check:</p>
                      <div className="flex flex-wrap gap-1">
                        {visit.posm_types.map((posm, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {posm}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-3 flex items-center text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>Visit #{visit.visit_order} in {visit.area}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant={visit.status === 'complete' ? "outline" : "default"} 
                    className="w-full flex justify-between items-center"
                    onClick={() => handleStoreClick(visit.visit_id)}
                  >
                    {visit.status === 'pending' 
                      ? "Start Visit" 
                      : visit.status === 'in_progress' 
                        ? "Continue Visit" 
                        : "View Details"}
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
