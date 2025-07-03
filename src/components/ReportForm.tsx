
import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { toast } from 'sonner';
import { Upload, MapPin, X } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

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

const ReportForm = ({ open, onOpenChange, session }: ReportFormProps) => {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState<[number, number] | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Centro de Ponta Grossa - PR
  const PONTA_GROSSA: [number, number] = [-25.0916, -50.1668];

  const LocationSelector = () => {
    useMapEvents({
      click(e) {
        setLocation([e.latlng.lat, e.latlng.lng]);
      },
    });
    return null;
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation([position.coords.latitude, position.coords.longitude]);
          toast.success('Localização atual definida');
        },
        () => {
          toast.error('Não foi possível obter sua localização');
        }
      );
    } else {
      toast.error('Geolocalização não suportada pelo navegador');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 5) {
      toast.error('Máximo de 5 imagens permitidas');
      return;
    }
    
    setImages([...images, ...files]);
    
    // Criar URLs de preview
    files.forEach(file => {
      const url = URL.createObjectURL(file);
      setImageUrls(prev => [...prev, url]);
    });
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newUrls = imageUrls.filter((_, i) => i !== index);
    setImages(newImages);
    setImageUrls(newUrls);
  };

  const uploadImages = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    
    for (const image of images) {
      const fileExt = image.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('report-images')
        .upload(fileName, image);
      
      if (error) {
        console.error('Error uploading image:', error);
        throw error;
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('report-images')
        .getPublicUrl(fileName);
      
      uploadedUrls.push(publicUrl);
    }
    
    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      toast.error('Você precisa estar logado para criar um relatório');
      return;
    }
    
    if (!location) {
      toast.error('Selecione uma localização no mapa');
      return;
    }
    
    setLoading(true);
    
    try {
      let uploadedImageUrls: string[] = [];
      
      if (images.length > 0) {
        uploadedImageUrls = await uploadImages();
      }
      
      const { error } = await supabase
        .from('reports')
        .insert({
          title,
          description,
          category,
          latitude: location[0],
          longitude: location[1],
          user_name: session.user.email || 'Usuário',
          image_urls: uploadedImageUrls.length > 0 ? uploadedImageUrls : null,
        });
      
      if (error) {
        console.error('Error creating report:', error);
        toast.error('Erro ao criar relatório');
      } else {
        toast.success('Relatório criado com sucesso!');
        resetForm();
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erro ao criar relatório');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('');
    setLocation(null);
    setImages([]);
    setImageUrls([]);
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
              placeholder="Ex: Buraco na Rua das Flores"
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
              placeholder="Descreva detalhadamente o problema..."
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Localização * {location && '✓'}</Label>
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                onClick={getCurrentLocation}
                className="w-full flex items-center gap-2"
              >
                <MapPin className="h-4 w-4" />
                Usar minha localização atual
              </Button>
              
              <div className="h-48 rounded-lg overflow-hidden border">
                <MapContainer
                  center={location || PONTA_GROSSA}
                  zoom={13}
                  className="h-full w-full"
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationSelector />
                  {location && <Marker position={location} />}
                </MapContainer>
              </div>
              <p className="text-sm text-gray-600">
                Clique no mapa para selecionar a localização do problema
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Imagens (até 5)</Label>
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Adicionar Imagens
              </Button>
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              
              {imageUrls.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-20 object-cover rounded"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
            <Button
              type="submit"
              disabled={loading || !location}
              className="flex-1"
            >
              {loading ? 'Criando...' : 'Criar Relatório'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReportForm;
