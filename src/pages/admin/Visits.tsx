
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/layouts/AdminLayout';
import { StoreVisit, Profile, Store } from '@/types';
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
import { Calendar, CheckCircle, Store as StoreIcon, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

// Define an extended type with joined data
type ExtendedStoreVisit = StoreVisit & {
  store: Store;
  merchandiser: Profile;
};

const Visits = () => {
  const { toast } = useToast();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('all');

  // Fetch all visits with store and merchandiser data
  const { data: visits, isLoading, refetch } = useQuery({
    queryKey: ['admin-visits'],
    queryFn: async () => {
      console.log('Fetching all visits...');
      
      const { data, error } = await supabase
        .from('store_visits')
        .select(`
          *,
          store:stores(*),
          merchandiser:profiles(*)
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
      return data as ExtendedStoreVisit[];
    },
  });

  // Function to cancel a visit
  const cancelVisit = async (visitId: string) => {
    try {
      const { error } = await supabase
        .from('store_visits')
        .delete()
        .eq('id', visitId);
        
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
        description: 'The store visit has been cancelled successfully.',
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

  // Filter visits based on status and date
  const filteredVisits = visits?.filter(visit => {
    // Filter by status
    if (filterStatus === 'completed' && !visit.completed_at) return false;
    if (filterStatus === 'pending' && visit.completed_at) return false;
    
    // Filter by date
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    if (filterDate === 'today' && visit.scheduled_date !== today) return false;
    if (filterDate === 'tomorrow' && visit.scheduled_date !== tomorrowStr) return false;
    if (filterDate === 'upcoming' && new Date(visit.scheduled_date) <= new Date()) return false;
    if (filterDate === 'past' && new Date(visit.scheduled_date) >= new Date()) return false;
    
    return true;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Visits Management</h1>
          <div className="flex space-x-2">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
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
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          </div>
        ) : filteredVisits && filteredVisits.length > 0 ? (
          <Table>
            <TableCaption>List of all store visits scheduled for merchandisers</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Store</TableHead>
                <TableHead>Merchandiser</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVisits.map((visit) => (
                <TableRow key={visit.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <StoreIcon className="h-4 w-4 text-gray-500" />
                      {visit.store.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{visit.store.address}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      {visit.merchandiser.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {visit.merchandiser.phone || 'No phone'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      {format(new Date(visit.scheduled_date), 'MMM d, yyyy')}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Visit #{visit.visit_order} of the day
                    </div>
                  </TableCell>
                  <TableCell>
                    {visit.completed_at ? (
                      <Badge className="bg-green-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    ) : (
                      <Badge variant="outline">Pending</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {!visit.completed_at && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => cancelVisit(visit.id)}
                          className="text-red-500 border-red-200 hover:bg-red-50"
                        >
                          Cancel
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // TODO: Implement view details functionality
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
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Visits;
