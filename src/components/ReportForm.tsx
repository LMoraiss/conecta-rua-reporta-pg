
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { toast } from 'sonner';
import { Session } from '@supabase/supabase-js';
import { X, Upload, MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Configurar ícones do Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface ReportFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: Session | null;
}

const categories = [
  'Buraco na via',
  'Calçada danificada',
  'Problema de drenagem',
  'Sinalização',
  'Iluminação',
  'Limpeza',
  'Outros'
];

// Componente para capturar cliques no mapa
const LocationPicker = ({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const ReportForm = ({ open, onOpenChange, session }: ReportFormProps) => {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);

  // Centro de Ponta Grossa - PR
  const PONTA_GROSSA = [-25.0916, -50.1668] as [number, number];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileList = Array.from(e.target.files);
      setImages(prev => [...prev, ...fileList]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const getCurrentLocation = () => {
    setUseCurrentLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setUseCurrentLocation(false);
          toast.success('Localização atual capturada!');
        },
        (error) => {
          console.error('Erro ao obter localização:', error);
          toast.error('Erro ao obter sua localização. Clique no mapa para definir o local.');
          setUseCurrentLocation(false);
        }
      );
    } else {
      toast.error('Geolocalização não é suportada pelo seu navegador.');
      setUseCurrentLocation(false);
    }
  };

  const uploadImages = async (): Promise<string[]> => {
    const uploadPromises = images.map(async (image, index) => {
      const fileExt = image.name.split('.').pop();
      const fileName = `${Date.now()}-${index}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('report-images')
        .upload(fileName, image);

      if (uploadError) {
        console.error('Erro no upload:', uploadError);
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('report-images')
        .getPublicUrl(fileName);

      return data.publicUrl;
    });

    return Promise.all(uploadPromises);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user) {
      toast.error('Você precisa estar logado para criar um relatório');
      return;
    }

    if (!location) {
      toast.error('Por favor, selecione uma localização no mapa');
      return;
    }

    setLoading(true);

    try {
      let imageUrls: string[] = [];
      
      if (images.length > 0) {
        imageUrls = await uploadImages();
      }

      const { error } = await supabase
        .from('reports')
        .insert({
          title,
          description,
          category,
          latitude: location.lat,
          longitude: location.lng,
          user_name: session.user.email || 'Usuário',
          image_urls: imageUrls
        });

      if (error) {
        console.error('Erro ao criar relatório:', error);
        toast.error('Erro ao criar relatório');
      } else {
        toast.success('Relatório criado com sucesso!');
        // Resetar formulário
        setTitle('');
        setDescription('');
        setCategory('');
        setLocation(null);
        setImages([]);
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao criar relatório');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Novo Relatório</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Buraco grande na Rua XV de Novembro"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria *</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o problema em detalhes..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Localização *</Label>
            <div className="flex gap-2 mb-2">
              <Button
                type="button"
                variant="outline"
                onClick={getCurrentLocation}
                disabled={useCurrentLocation}
                className="flex items-center gap-2"
              >
                <MapPin className="h-4 w-4" />
                {useCurrentLocation ? 'Obtendo...' : 'Usar Minha Localização'}
              </Button>
            </div>
            
            <div className="h-64 w-full rounded-lg overflow-hidden border">
              <MapContainer
                center={location ? [location.lat, location.lng] : PONTA_GROSSA}
                zoom={location ? 16 : 13}
                className="h-full w-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationPicker onLocationSelect={(lat, lng) => setLocation({ lat, lng })} />
                {location && (
                  <Marker position={[location.lat, location.lng]} />
                )}
              </MapContainer>
            </div>
            {location && (
              <p className="text-sm text-gray-600">
                Localização selecionada: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="images">Imagens</Label>
            <Input
              id="images"
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="cursor-pointer"
            />
            
            {images.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-20 object-cover rounded border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 h-6 w-6 p-0"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Criando...' : 'Criar Relatório'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReportForm;
