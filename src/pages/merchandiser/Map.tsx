
import MerchandiserLayout from '@/layouts/MerchandiserLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const Map = () => {
  const { profile } = useAuth();

  return (
    <MerchandiserLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Store Map</h1>
        <p className="text-muted-foreground">
          View your assigned stores on the map
        </p>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Map View</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted aspect-video rounded-md flex flex-col items-center justify-center p-4">
              <MapPin className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-center text-muted-foreground">
                Store map will be displayed here.
                <br />
                (Google Maps integration will be implemented in future versions)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MerchandiserLayout>
  );
};

export default Map;
