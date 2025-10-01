
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Session } from '@supabase/supabase-js';
import { X, Upload, MapPin } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import InteractiveMap from './InteractiveMap';

interface ReportFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: Session | null;
  editingReport?: Tables<'reports'> | null;
  onReportUpdated?: () => void;
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

const severityLevels = [
  { value: 'low', label: 'Baixa', color: '#22c55e' },
  { value: 'medium', label: 'Média', color: '#f59e0b' },
  { value: 'high', label: 'Alta', color: '#ef4444' }
];

const ReportForm = ({ open, onOpenChange, session, editingReport, onReportUpdated }: ReportFormProps) => {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(editingReport?.title || '');
  const [description, setDescription] = useState(editingReport?.description || '');
  const [category, setCategory] = useState(editingReport?.category || '');
  const [severity, setSeverity] = useState(editingReport?.severity || 'medium');
  const [status, setStatus] = useState(editingReport?.status || 'pending');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    editingReport ? { lat: editingReport.latitude, lng: editingReport.longitude } : null
  );
  const [images, setImages] = useState<File[]>([]);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [showMap, setShowMap] = useState(false);

  // Centro de Ponta Grossa - PR
  const PONTA_GROSSA = [-25.0916, -50.1668] as [number, number];

  // Resetar formulário quando abrir para edição
  useState(() => {
    if (editingReport) {
      setTitle(editingReport.title);
      setDescription(editingReport.description || '');
      setCategory(editingReport.category);
      setSeverity(editingReport.severity || 'medium');
      setStatus(editingReport.status || 'pending');
      setLocation({ lat: editingReport.latitude, lng: editingReport.longitude });
    } else {
      setTitle('');
      setDescription('');
      setCategory('');
      setSeverity('medium');
      setStatus('pending');
      setLocation(null);
      setImages([]);
    }
  });

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
          toast.error('Erro ao obter sua localização. Use as coordenadas manualmente.');
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
      toast.error('Por favor, defina uma localização');
      return;
    }

    setLoading(true);

    try {
      let imageUrls: string[] = editingReport?.image_urls || [];
      
      if (images.length > 0) {
        const newImageUrls = await uploadImages();
        imageUrls = [...imageUrls, ...newImageUrls];
      }

      const reportData = {
        title,
        description,
        category,
        severity,
        status,
        latitude: location.lat,
        longitude: location.lng,
        user_name: session.user.email || 'Usuário',
        image_urls: imageUrls
      };

      if (editingReport) {
        // Atualizar relatório existente
        const { error } = await supabase
          .from('reports')
          .update(reportData)
          .eq('id', editingReport.id);

        if (error) {
          console.error('Erro ao atualizar relatório:', error);
          toast.error('Erro ao atualizar relatório');
        } else {
          toast.success('Relatório atualizado com sucesso!');
          onReportUpdated?.();
          onOpenChange(false);
        }
      } else {
        // Criar novo relatório
        const { error } = await supabase
          .from('reports')
          .insert(reportData);

        if (error) {
          console.error('Erro ao criar relatório:', error);
          toast.error('Erro ao criar relatório');
        } else {
          toast.success('Relatório criado com sucesso!');
          // Resetar formulário
          setTitle('');
          setDescription('');
          setCategory('');
          setSeverity('medium');
          setStatus('pending');
          setLocation(null);
          setImages([]);
          onOpenChange(false);
        }
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao processar relatório');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            {editingReport ? 'Editar Relatório' : 'Criar Novo Relatório'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm sm:text-base">Título *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Buraco grande na Rua XV de Novembro"
              required
              className="h-11 sm:h-10 text-base sm:text-sm touch-manipulation"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm sm:text-base">Categoria *</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger className="h-11 sm:h-10 touch-manipulation">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent className="max-h-[60vh]">
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat} className="h-11 sm:h-10 touch-manipulation">
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="severity" className="text-sm sm:text-base">Severidade *</Label>
            <Select value={severity} onValueChange={setSeverity} required>
              <SelectTrigger className="h-11 sm:h-10 touch-manipulation">
                <SelectValue placeholder="Selecione a severidade" />
              </SelectTrigger>
              <SelectContent className="max-h-[60vh]">
                {severityLevels.map((level) => (
                  <SelectItem key={level.value} value={level.value} className="h-11 sm:h-10 touch-manipulation">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: level.color }}
                      />
                      {level.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {editingReport && (
            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm sm:text-base">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-11 sm:h-10 touch-manipulation">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[60vh]">
                  <SelectItem value="pending" className="h-11 sm:h-10 touch-manipulation">Pendente</SelectItem>
                  <SelectItem value="resolved" className="h-11 sm:h-10 touch-manipulation">Resolvido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm sm:text-base">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o problema em detalhes..."
              rows={3}
              className="text-base sm:text-sm touch-manipulation"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm sm:text-base">Localização *</Label>
            <div className="flex flex-col sm:flex-row gap-2 mb-2">
              <Button
                type="button"
                variant="outline"
                onClick={getCurrentLocation}
                disabled={useCurrentLocation}
                className="flex items-center justify-center gap-2 h-11 sm:h-10 text-sm touch-manipulation"
              >
                <MapPin className="h-4 w-4" />
                {useCurrentLocation ? 'Obtendo...' : 'Usar Minha Localização'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowMap(!showMap)}
                className="flex items-center justify-center gap-2 h-11 sm:h-10 text-sm touch-manipulation"
              >
                <MapPin className="h-4 w-4" />
                {showMap ? 'Ocultar Mapa' : 'Mostrar Mapa'}
              </Button>
            </div>
            
            {showMap && (
              <div className="h-48 sm:h-64 w-full rounded-lg overflow-hidden border touch-manipulation">
                <InteractiveMap
                  reports={[]}
                  onLocationSelect={(lat, lng) => {
                    setLocation({ lat, lng });
                    toast.success('Localização selecionada no mapa!');
                  }}
                  isSelecting={true}
                />
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={location?.lat || ''}
                  onChange={(e) => setLocation(prev => ({ 
                    lat: parseFloat(e.target.value) || 0, 
                    lng: prev?.lng || PONTA_GROSSA[1] 
                  }))}
                  placeholder="-25.0916"
                />
              </div>
              <div>
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={location?.lng || ''}
                  onChange={(e) => setLocation(prev => ({ 
                    lat: prev?.lat || PONTA_GROSSA[0], 
                    lng: parseFloat(e.target.value) || 0 
                  }))}
                  placeholder="-50.1668"
                />
              </div>
            </div>
            
            {location && (
              <p className="text-sm text-gray-600">
                Localização: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
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

          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-11 sm:h-10 touch-manipulation"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 h-11 sm:h-10 touch-manipulation">
              {loading ? (editingReport ? 'Atualizando...' : 'Criando...') : (editingReport ? 'Atualizar' : 'Criar Relatório')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReportForm;
