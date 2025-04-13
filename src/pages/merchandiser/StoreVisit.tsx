
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import MerchandiserLayout from '@/layouts/MerchandiserLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, Upload, Image as ImageIcon, Camera, ArrowLeft, ExternalLink } from 'lucide-react';
import { StoreVisit, Store, StorePOSM, Planogram } from '@/types';
import { useAuth } from '@/context/AuthContext';

const StoreVisitPage = () => {
  const { visitId } = useParams<{ visitId: string }>();
  const [visit, setVisit] = useState<StoreVisit | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [posms, setPosms] = useState<StorePOSM[]>([]);
  const [planogram, setPlanogram] = useState<Planogram | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [comments, setComments] = useState('');
  const [beforeImage, setBeforeImage] = useState<File | null>(null);
  const [afterImage, setAfterImage] = useState<File | null>(null);
  const [beforeImageUrl, setBeforeImageUrl] = useState<string | null>(null);
  const [afterImageUrl, setAfterImageUrl] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVisitDetails = async () => {
      if (!visitId || !user) return;

      try {
        // Fetch the visit
        const { data: visitData, error: visitError } = await supabase
          .from('store_visits')
          .select('*')
          .eq('id', visitId)
          .eq('merchandiser_id', user.id)
          .single();

        if (visitError) throw visitError;
        setVisit(visitData);
        setComments(visitData.comments || '');
        
        if (visitData.before_image_url) {
          setBeforeImageUrl(visitData.before_image_url);
        }
        
        if (visitData.after_image_url) {
          setAfterImageUrl(visitData.after_image_url);
        }

        // Fetch the store
        const { data: storeData, error: storeError } = await supabase
          .from('stores')
          .select('*')
          .eq('id', visitData.store_id)
          .single();

        if (storeError) throw storeError;
        setStore(storeData);

        // Fetch POSMs
        const { data: posmData, error: posmError } = await supabase
          .from('store_posms')
          .select('*')
          .eq('store_id', visitData.store_id);

        if (posmError) throw posmError;
        setPosms(posmData || []);

        // Fetch planogram
        const { data: planogramData, error: planogramError } = await supabase
          .from('planograms')
          .select('*')
          .eq('store_id', visitData.store_id)
          .maybeSingle();

        if (!planogramError && planogramData) {
          setPlanogram(planogramData);
        }
      } catch (error: any) {
        console.error('Error fetching visit details:', error);
        toast({
          title: 'Error',
          description: 'Failed to load visit details',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchVisitDetails();
  }, [visitId, user, toast]);

  const handleFileChange = (type: 'before' | 'after', e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    if (type === 'before') {
      setBeforeImage(file);
    } else {
      setAfterImage(file);
    }
  };

  const uploadImage = async (file: File, path: string): Promise<string> => {
    const fileName = `${visitId}_${path}_${new Date().getTime()}`;
    const { data, error } = await supabase.storage
      .from('store_images')
      .upload(`visit-images/${fileName}`, file);

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('store_images')
      .getPublicUrl(`visit-images/${fileName}`);

    return urlData.publicUrl;
  };

  const handleCompleteVisit = async () => {
    if (!visit || !user) return;

    setSubmitting(true);
    try {
      let beforeImagePublicUrl = visit.before_image_url;
      let afterImagePublicUrl = visit.after_image_url;

      // Upload before image if new one is selected
      if (beforeImage) {
        beforeImagePublicUrl = await uploadImage(beforeImage, 'before');
      }

      // Upload after image if new one is selected
      if (afterImage) {
        afterImagePublicUrl = await uploadImage(afterImage, 'after');
      }

      // Update the visit
      const { error } = await supabase
        .from('store_visits')
        .update({
          before_image_url: beforeImagePublicUrl,
          after_image_url: afterImagePublicUrl,
          comments,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', visitId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Visit has been marked as completed',
      });

      // Update local state
      setVisit({
        ...visit,
        before_image_url: beforeImagePublicUrl,
        after_image_url: afterImagePublicUrl,
        comments,
        completed_at: new Date().toISOString()
      });

      // Go back to home
      navigate('/');
    } catch (error: any) {
      console.error('Error completing visit:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete the visit',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveProgress = async () => {
    if (!visit || !user) return;

    setSubmitting(true);
    try {
      let beforeImagePublicUrl = visit.before_image_url;
      let afterImagePublicUrl = visit.after_image_url;

      // Upload before image if new one is selected
      if (beforeImage) {
        beforeImagePublicUrl = await uploadImage(beforeImage, 'before');
      }

      // Upload after image if new one is selected
      if (afterImage) {
        afterImagePublicUrl = await uploadImage(afterImage, 'after');
      }

      // Update the visit
      const { error } = await supabase
        .from('store_visits')
        .update({
          before_image_url: beforeImagePublicUrl,
          after_image_url: afterImagePublicUrl,
          comments,
          updated_at: new Date().toISOString()
        })
        .eq('id', visitId);

      if (error) throw error;

      toast({
        title: 'Progress Saved',
        description: 'Your visit progress has been saved',
      });

      // Update local state
      setVisit({
        ...visit,
        before_image_url: beforeImagePublicUrl,
        after_image_url: afterImagePublicUrl,
        comments
      });
      
      if (beforeImagePublicUrl) {
        setBeforeImageUrl(beforeImagePublicUrl);
        setBeforeImage(null);
      }
      
      if (afterImagePublicUrl) {
        setAfterImageUrl(afterImagePublicUrl);
        setAfterImage(null);
      }
    } catch (error: any) {
      console.error('Error saving progress:', error);
      toast({
        title: 'Error',
        description: 'Failed to save progress',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const openMapsLink = () => {
    if (!store) return;
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${store.latitude},${store.longitude}`;
    window.open(mapsUrl, '_blank');
  };

  if (loading) {
    return (
      <MerchandiserLayout>
        <div className="flex justify-center items-center h-full">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p className="mt-2">Loading visit details...</p>
          </div>
        </div>
      </MerchandiserLayout>
    );
  }

  if (!visit || !store) {
    return (
      <MerchandiserLayout>
        <div className="text-center py-8">
          <p className="text-lg font-medium">Visit not found</p>
          <Button className="mt-4" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </div>
      </MerchandiserLayout>
    );
  }

  return (
    <MerchandiserLayout>
      <div className="space-y-6">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mr-2 p-0 h-9 w-9"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">{store.name}</h1>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Store Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start space-x-2 mb-2">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
              <div className="flex-1">
                <p className="text-sm">{store.address}</p>
                <Button 
                  variant="link" 
                  size="sm" 
                  className="p-0 h-auto text-xs flex items-center"
                  onClick={openMapsLink}
                >
                  Open in Maps <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>

            {posms && posms.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium mb-1">POSM to check:</p>
                <div className="flex flex-wrap gap-1">
                  {posms.map((posm) => (
                    <Badge key={posm.id} variant="secondary" className="text-xs">
                      {posm.posm_type}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {store.instructions && (
              <div className="mt-3">
                <p className="text-xs font-medium mb-1">Instructions:</p>
                <p className="text-xs text-muted-foreground">
                  {store.instructions}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {planogram && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Planogram</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted rounded-md overflow-hidden">
                <img 
                  src={planogram.image_url} 
                  alt="Store planogram" 
                  className="w-full h-full object-contain" 
                />
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Upload Before Picture</h2>
            <div className="space-y-2">
              {beforeImageUrl ? (
                <div className="relative">
                  <img 
                    src={beforeImageUrl} 
                    alt="Before" 
                    className="w-full h-48 object-cover rounded-md" 
                  />
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="absolute bottom-2 right-2"
                    onClick={() => document.getElementById('before-image')?.click()}
                  >
                    Change
                  </Button>
                </div>
              ) : beforeImage ? (
                <div className="relative">
                  <img 
                    src={URL.createObjectURL(beforeImage)} 
                    alt="Before" 
                    className="w-full h-48 object-cover rounded-md" 
                  />
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="absolute bottom-2 right-2"
                    onClick={() => document.getElementById('before-image')?.click()}
                  >
                    Change
                  </Button>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  className="w-full h-48 flex flex-col items-center justify-center"
                  onClick={() => document.getElementById('before-image')?.click()}
                >
                  <Camera className="h-8 w-8 mb-2" />
                  <span>Take Before Picture</span>
                </Button>
              )}
              <input
                id="before-image"
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => handleFileChange('before', e)}
              />
            </div>
          </div>

          <Separator />

          <div>
            <h2 className="text-lg font-semibold mb-2">Comments</h2>
            <Textarea
              placeholder="Add any notes or observations about the store visit..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={3}
            />
          </div>

          <Separator />

          <div>
            <h2 className="text-lg font-semibold mb-2">Upload After Picture</h2>
            <div className="space-y-2">
              {afterImageUrl ? (
                <div className="relative">
                  <img 
                    src={afterImageUrl} 
                    alt="After" 
                    className="w-full h-48 object-cover rounded-md" 
                  />
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="absolute bottom-2 right-2"
                    onClick={() => document.getElementById('after-image')?.click()}
                  >
                    Change
                  </Button>
                </div>
              ) : afterImage ? (
                <div className="relative">
                  <img 
                    src={URL.createObjectURL(afterImage)} 
                    alt="After" 
                    className="w-full h-48 object-cover rounded-md" 
                  />
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="absolute bottom-2 right-2"
                    onClick={() => document.getElementById('after-image')?.click()}
                  >
                    Change
                  </Button>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  className="w-full h-48 flex flex-col items-center justify-center"
                  onClick={() => document.getElementById('after-image')?.click()}
                >
                  <Camera className="h-8 w-8 mb-2" />
                  <span>Take After Picture</span>
                </Button>
              )}
              <input
                id="after-image"
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => handleFileChange('after', e)}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2 pt-4">
          {!visit.completed_at && (
            <Button 
              className="w-full"
              disabled={submitting || (!beforeImageUrl && !beforeImage)}
              onClick={handleCompleteVisit}
            >
              {submitting ? 'Completing...' : 'Mark Visit as Completed'}
            </Button>
          )}

          <Button 
            variant="outline" 
            className="w-full"
            disabled={submitting}
            onClick={handleSaveProgress}
          >
            {submitting ? 'Saving...' : 'Save Progress'}
          </Button>
        </div>
      </div>
    </MerchandiserLayout>
  );
};

export default StoreVisitPage;
