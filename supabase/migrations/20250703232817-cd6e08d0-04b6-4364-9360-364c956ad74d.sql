
-- Criar tabela de relatórios (sem chaves estrangeiras)
CREATE TABLE public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  user_name TEXT NOT NULL,
  image_urls TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de comentários (sem chaves estrangeiras)
CREATE TABLE public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID NOT NULL,
  comment_text TEXT NOT NULL,
  user_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS para ambas as tabelas
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Políticas para relatórios (todos podem visualizar, apenas usuários autenticados podem criar)
CREATE POLICY "Todos podem visualizar relatórios" 
  ON public.reports 
  FOR SELECT 
  TO public
  USING (true);

CREATE POLICY "Usuários autenticados podem criar relatórios" 
  ON public.reports 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Políticas para comentários (todos podem visualizar, apenas usuários autenticados podem criar)
CREATE POLICY "Todos podem visualizar comentários" 
  ON public.comments 
  FOR SELECT 
  TO public
  USING (true);

CREATE POLICY "Usuários autenticados podem criar comentários" 
  ON public.comments 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Criar bucket de storage para imagens
INSERT INTO storage.buckets (id, name, public) 
VALUES ('report-images', 'report-images', true);

-- Política de storage para permitir uploads de usuários autenticados
CREATE POLICY "Usuários autenticados podem fazer upload de imagens"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'report-images');

-- Política de storage para visualização pública das imagens
CREATE POLICY "Imagens são públicas para visualização"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'report-images');

-- Habilitar realtime para as tabelas
ALTER PUBLICATION supabase_realtime ADD TABLE public.reports;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;

-- Configurar REPLICA IDENTITY para realtime
ALTER TABLE public.reports REPLICA IDENTITY FULL;
ALTER TABLE public.comments REPLICA IDENTITY FULL;
