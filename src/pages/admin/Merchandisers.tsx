
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/layouts/AdminLayout';
import { Profile, Store, StoreVisit } from '@/types';
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Calendar, Store as StoreIcon, User, UserPlus } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const Merchandisers = () => {
  const { toast } = useToast();
  const [selectedMerchandiser, setSelectedMerchandiser] = useState<Profile | null>(null);
  const [showAssignmentSheet, setShowAssignmentSheet] = useState<boolean>(false);
  const [isAssigning, setIsAssigning] = useState<boolean>(false);

  // Fetch all merchandisers
  const { data: merchandisers, isLoading: loadingMerchandisers } = useQuery({
    queryKey: ['merchandisers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'merchandiser');
      
      if (error) {
        console.error('Error loading merchandisers:', error);
        throw error;
      }
      
      return data as Profile[];
    },
  });

  // Fetch all stores
  const { data: stores, isLoading: loadingStores } = useQuery({
    queryKey: ['stores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stores')
        .select('*');
      
      if (error) {
        console.error('Error loading stores:', error);
        throw error;
      }
      
      return data as Store[];
    },
  });

  // Fetch visits
  const { data: visits, isLoading: loadingVisits, refetch: refetchVisits } = useQuery({
    queryKey: ['visits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('store_visits')
        .select(`
          *,
          store:stores(id, name, address)
        `);
      
      if (error) {
        console.error('Error loading visits:', error);
        throw error;
      }
      
      return data as (StoreVisit & { store: Store })[];
    },
  });

  // Function to assign stores to a merchandiser
  const assignStoresToMerchandiser = async (merchandiserId: string) => {
    if (!stores || stores.length === 0) return;
    
    setIsAssigning(true);
    
    try {
      // Get a random number of stores to assign (between 1 and 4)
      const numStores = Math.floor(Math.random() * 4) + 1;
      const shuffledStores = [...stores].sort(() => 0.5 - Math.random());
      const storesToAssign = shuffledStores.slice(0, numStores);
      
      // Create an array of assignments with future dates
      const assignments = storesToAssign.map((store, index) => {
        const visitDate = new Date();
        visitDate.setDate(visitDate.getDate() + index + 1); // Assign to consecutive days
        
        return {
          store_id: store.id,
          merchandiser_id: merchandiserId,
          scheduled_date: format(visitDate, 'yyyy-MM-dd'),
          visit_order: index + 1,
        };
      });
      
      // Insert the assignments into the database
      const { error } = await supabase
        .from('store_visits')
        .insert(assignments);
      
      if (error) {
        console.error('Error assigning stores:', error);
        toast({
          title: "Assignment failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      // Success notification
      toast({
        title: "Stores assigned successfully",
        description: `${assignments.length} stores have been assigned to this merchandiser.`,
      });
      
      // Refresh visits data
      refetchVisits();
    } catch (error) {
      console.error('Error in assignment process:', error);
      toast({
        title: "Assignment failed",
        description: "An unexpected error occurred during the assignment process.",
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
      setShowAssignmentSheet(false);
    }
  };

  // Get visits for a specific merchandiser
  const getVisitsForMerchandiser = (merchandiserId: string) => {
    if (!visits) return [];
    return visits.filter(visit => visit.merchandiser_id === merchandiserId);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Merchandisers Management</h1>
        </div>
        
        {loadingMerchandisers ? (
          <div className="flex justify-center py-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          </div>
        ) : merchandisers && merchandisers.length > 0 ? (
          <Table>
            <TableCaption>List of merchandisers and their assigned stores</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Assigned Stores</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {merchandisers.map((merchandiser) => (
                <TableRow key={merchandiser.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-gray-500" />
                      {merchandiser.name}
                    </div>
                  </TableCell>
                  <TableCell>{merchandiser.phone || 'No phone'}</TableCell>
                  <TableCell>
                    {getVisitsForMerchandiser(merchandiser.id).length} stores assigned
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedMerchandiser(merchandiser);
                          setShowAssignmentSheet(true);
                        }}
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Assign Stores
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-md">
            <p className="text-gray-500">No merchandisers found</p>
          </div>
        )}
        
        {/* Assignment Sheet */}
        {selectedMerchandiser && (
          <Sheet open={showAssignmentSheet} onOpenChange={setShowAssignmentSheet}>
            <SheetContent className="sm:max-w-md">
              <SheetHeader>
                <SheetTitle>Assign Stores to {selectedMerchandiser.name}</SheetTitle>
                <SheetDescription>
                  Current assignments and options to add more stores.
                </SheetDescription>
              </SheetHeader>
              
              <div className="py-6 space-y-4">
                <h3 className="text-sm font-medium">Current Assignments</h3>
                {getVisitsForMerchandiser(selectedMerchandiser.id).length > 0 ? (
                  <div className="space-y-2">
                    {getVisitsForMerchandiser(selectedMerchandiser.id).map((visit) => (
                      <div key={visit.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                        <div className="flex items-center gap-2">
                          <StoreIcon className="h-4 w-4 text-gray-500" />
                          <span>{visit.store?.name}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Calendar className="h-4 w-4" />
                          <span>{format(new Date(visit.scheduled_date), 'MMM d, yyyy')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No stores currently assigned</p>
                )}
                
                <div className="pt-4">
                  <Button 
                    onClick={() => assignStoresToMerchandiser(selectedMerchandiser.id)}
                    disabled={isAssigning || loadingStores || !stores || stores.length === 0}
                    className="w-full"
                  >
                    {isAssigning ? 'Assigning...' : 'Randomly Assign Stores'}
                  </Button>
                  
                  <p className="text-xs text-gray-500 mt-2">
                    This will randomly assign 1-4 stores to this merchandiser for future dates.
                  </p>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>
    </AdminLayout>
  );
};

export default Merchandisers;
