
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { Calendar, CheckCircle, Store as StoreIcon, User, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

// Define a type for our visit schedule data
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
  merchandiser?: {
    id: string;
    name: string;
    phone: string | null;
  } | null; // Allow null in case of error or missing data
}

const Visits = () => {
  const { toast } = useToast();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('all');
  const [filterArea, setFilterArea] = useState<string>('all');

  // Fetch all visits with merchandiser data
  const { data: visits, isLoading, refetch } = useQuery({
    queryKey: ['admin-visits-schedule'],
    queryFn: async () => {
      console.log('Fetching visit schedule...');
      
      const { data, error } = await supabase
        .from('visit_schedule')
        .select(`
          *,
          merchandiser:profiles(id, name, phone)
        `);
      
      if (error) {
        console.error('Error loading visits:', error);
        toast({
          title: 'Error loading visits',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }
      
      console.log('Visits fetched:', data);
      // Cast the data as unknown first, then to VisitSchedule[]
      return (data as unknown) as VisitSchedule[];
    },
  });

  // Function to cancel a visit
  const cancelVisit = async (visitId: string) => {
    try {
      const { error } = await supabase
        .from('visit_schedule')
        .update({ status: 'skipped' })
        .eq('visit_id', visitId);
        
      if (error) {
        toast({
          title: 'Error cancelling visit',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }
      
      toast({
        title: 'Visit cancelled',
        description: 'The store visit has been marked as skipped.',
      });
      
      refetch();
    } catch (error: any) {
      toast({
        title: 'Error cancelling visit',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Get unique areas for filtering
  const areas = visits ? [...new Set(visits.map(visit => visit.area))].sort() : [];

  // Filter visits based on status, date, and area
  const filteredVisits = visits?.filter(visit => {
    // Filter by status
    if (filterStatus === 'completed' && visit.status !== 'complete') return false;
    if (filterStatus === 'pending' && visit.status !== 'pending') return false;
    if (filterStatus === 'in_progress' && visit.status !== 'in_progress') return false;
    if (filterStatus === 'skipped' && visit.status !== 'skipped') return false;
    
    // Filter by date
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    if (filterDate === 'today' && visit.date !== today) return false;
    if (filterDate === 'tomorrow' && visit.date !== tomorrowStr) return false;
    if (filterDate === 'upcoming' && new Date(visit.date) <= new Date()) return false;
    if (filterDate === 'past' && new Date(visit.date) >= new Date()) return false;
    
    // Filter by area
    if (filterArea !== 'all' && visit.area !== filterArea) return false;
    
    return true;
  });

  // Function to get appropriate badge color based on status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'complete':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" /> Completed</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-500">In Progress</Badge>;
      case 'skipped':
        return <Badge className="bg-gray-500">Skipped</Badge>;
      case 'pending':
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  // Function to open maps with lat/lng
  const openMapsLink = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Visit Schedule Management</h1>
          <div className="flex space-x-2">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="skipped">Skipped</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterDate} onValueChange={setFilterDate}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="tomorrow">Tomorrow</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="past">Past</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterArea} onValueChange={setFilterArea}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Areas</SelectItem>
                {areas.map(area => (
                  <SelectItem key={area} value={area}>{area}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          </div>
        ) : filteredVisits && filteredVisits.length > 0 ? (
          <Table>
            <TableCaption>List of all scheduled store visits</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Store</TableHead>
                <TableHead>Merchandiser</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Area</TableHead>
                <TableHead>POSM Types</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVisits.map((visit) => (
                <TableRow key={visit.visit_id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <StoreIcon className="h-4 w-4 text-gray-500" />
                      {visit.store_name}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 flex items-center">
                      <button 
                        onClick={() => openMapsLink(visit.lat, visit.lng)} 
                        className="inline-flex items-center text-blue-500 hover:underline"
                      >
                        <MapPin className="h-3 w-3 mr-1" />
                        {visit.address}
                      </button>
                    </div>
                  </TableCell>
                  <TableCell>
                    {visit.merchandiser ? (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        {visit.merchandiser.name}
                        {visit.merchandiser.phone && (
                          <div className="text-xs text-gray-500">
                            {visit.merchandiser.phone}
                          </div>
                        )}
                      </div>
                    ) : (
                      <Badge variant="outline">Unassigned</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      {format(new Date(visit.date), 'MMM d, yyyy')}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Visit #{visit.visit_order} of the day
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{visit.area}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {visit.posm_types.map((posm, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {posm}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(visit.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {visit.status === 'pending' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => cancelVisit(visit.visit_id)}
                          className="text-red-500 border-red-200 hover:bg-red-50"
                        >
                          Skip
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          toast({
                            title: 'View Details',
                            description: 'This functionality is not implemented yet.',
                          });
                        }}
                      >
                        Details
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-md">
            <p className="text-gray-500">No visits found matching your filters</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setFilterStatus('all');
                setFilterDate('all');
                setFilterArea('all');
              }}
            >
              Clear filters
            </Button>
          </div>
        )}

        <div className="pt-4 flex gap-4">
          <Button
            className="flex-1"
            onClick={() => {
              toast({
                title: "Data Generator",
                description: "Generating dummy visit data...",
              });
              
              // Execute the dummy data generation function
              supabase.rpc('generate_dummy_stores', { 
                count: 50,
                areas: ['Jakarta Pusat', 'Jakarta Utara', 'Jakarta Barat', 'Jakarta Selatan', 'Jakarta Timur']
              })
                .then(() => {
                  toast({
                    title: "Success",
                    description: "Dummy data has been generated.",
                  });
                  refetch();
                })
                .catch((err: Error) => {
                  toast({
                    title: "Error",
                    description: "Failed to generate dummy data: " + err.message,
                    variant: "destructive"
                  });
                });
            }}
          >
            Generate Dummy Visit Data
          </Button>
          
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              toast({
                title: "Assign Visits",
                description: "Assigning visits to merchandisers...",
              });
              
              // Execute the assignment function
              supabase.rpc('assign_visits_to_merchandisers')
                .then(() => {
                  toast({
                    title: "Success",
                    description: "Visits have been assigned to merchandisers.",
                  });
                  refetch();
                })
                .catch((err: Error) => {
                  toast({
                    title: "Error",
                    description: "Failed to assign visits: " + err.message,
                    variant: "destructive"
                  });
                });
            }}
          >
            Assign Visits to Merchandisers
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Visits;
