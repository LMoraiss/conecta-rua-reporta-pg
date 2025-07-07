
-- Adicionar colunas severity e status à tabela reports
ALTER TABLE public.reports 
ADD COLUMN severity text DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high')),
ADD COLUMN status text DEFAULT 'pending' CHECK (status IN ('pending', 'resolved'));

-- Atualizar registros existentes para ter valores padrão
UPDATE public.reports 
SET severity = 'medium', status = 'pending' 
WHERE severity IS NULL OR status IS NULL;
