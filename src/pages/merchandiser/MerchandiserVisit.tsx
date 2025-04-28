
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
import { MapPin, Upload, ExternalLink, ArrowLeft, Camera, CheckCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

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

const MerchandiserVisit = () => {
  const { visitId } = useParams<{ visitId: string }>();
  const [visit, setVisit] = useState<VisitSchedule | null>(null);
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
        const { data: visitData, error: visitError } = await supabase
          .from('visit_schedule')
          .select('*')
          .eq('visit_id', visitId)
          .eq('merchandiser_id', user.id)
          .single();

        if (visitError) throw visitError;
        
        setVisit(visitData);
        setComments(visitData.comments || '');
        
        if (visitData.before_photo_url) {
          setBeforeImageUrl(visitData.before_photo_url);
        }
        
        if (visitData.after_photo_url) {
          setAfterImageUrl(visitData.after_photo_url);
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
      .from('visit_photos')
      .upload(`visit-images/${fileName}`, file);

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('visit_photos')
      .getPublicUrl(`visit-images/${fileName}`);

    return urlData.publicUrl;
  };

  const updateVisitStatus = async (newStatus: 'in_progress' | 'complete') => {
    if (!visit || !user) return;

    setSubmitting(true);
    try {
      let beforeImagePublicUrl = visit.before_photo_url;
      let afterImagePublicUrl = visit.after_photo_url;

      // Upload before image if new one is selected
      if (beforeImage) {
        beforeImagePublicUrl = await uploadImage(beforeImage, 'before');
      }

      // Upload after image if new one is selected
      if (afterImage) {
        afterImagePublicUrl = await uploadImage(afterImage, 'after');
      }

      const updateData: any = {
        before_photo_url: beforeImagePublicUrl,
        after_photo_url: afterImagePublicUrl,
        comments,
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      // Update the visit
      const { error } = await supabase
        .from('visit_schedule')
        .update(updateData)
        .eq('visit_id', visitId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: newStatus === 'complete' 
          ? 'Visit has been marked as completed' 
          : 'Visit progress has been saved',
      });

      // Update local state
      setVisit({
        ...visit,
        ...updateData
      });

      if (newStatus === 'complete') {
        // Go back to home after completion
        navigate('/');
      } else {
        // Update local state with new image URLs
        if (beforeImagePublicUrl) {
          setBeforeImageUrl(beforeImagePublicUrl);
          setBeforeImage(null);
        }
        
        if (afterImagePublicUrl) {
          setAfterImageUrl(afterImagePublicUrl);
          setAfterImage(null);
        }
      }
    } catch (error: any) {
      console.error('Error updating visit:', error);
      toast({
        title: 'Error',
        description: 'Failed to update the visit',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const startVisit = () => updateVisitStatus('in_progress');
  const completeVisit = () => updateVisitStatus('complete');
  const saveProgress = () => updateVisitStatus('in_progress');

  const openMapsLink = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
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

  if (!visit) {
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
          <h1 className="text-xl font-bold">{visit.store_name}</h1>
        </div>

        {/* Store Info */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Store Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start space-x-2 mb-2">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
              <div className="flex-1">
                <p className="text-sm">{visit.address}</p>
                <Button 
                  variant="link" 
                  size="sm" 
                  className="p-0 h-auto text-xs flex items-center"
                  onClick={() => openMapsLink(visit.lat, visit.lng)}
                >
                  Open in Maps <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>

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
          </CardContent>
        </Card>

        {/* POSM Reference Images */}
        {visit.posm_reference_images.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">POSM Reference</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {visit.posm_reference_images.map((imageUrl, index) => (
                  <div key={index} className="aspect-video bg-muted rounded-md overflow-hidden">
                    <img 
                      src={imageUrl} 
                      alt={`Reference ${index + 1}`} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Planogram */}
        {visit.planogram_url && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Planogram</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted rounded-md overflow-hidden">
                <img 
                  src={visit.planogram_url} 
                  alt="Store planogram" 
                  className="w-full h-full object-contain" 
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Photo Upload and Comments */}
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

        {/* Action Buttons */}
        <div className="space-y-2 pt-4">
          {visit.status === 'pending' ? (
            <Button 
              className="w-full"
              disabled={submitting}
              onClick={startVisit}
            >
              {submitting ? 'Starting...' : 'Start Visit'}
            </Button>
          ) : visit.status === 'in_progress' ? (
            <>
              <Button 
                className="w-full"
                disabled={submitting || (!beforeImageUrl && !beforeImage)}
                onClick={completeVisit}
              >
                {submitting ? 'Completing...' : (
                  <div className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Mark Visit as Completed
                  </div>
                )}
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                disabled={submitting}
                onClick={saveProgress}
              >
                {submitting ? 'Saving...' : 'Save Progress'}
              </Button>
            </>
          ) : (
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/')}
            >
              Back to Home
            </Button>
          )}
        </div>
      </div>
    </MerchandiserLayout>
  );
};

export default MerchandiserVisit;
