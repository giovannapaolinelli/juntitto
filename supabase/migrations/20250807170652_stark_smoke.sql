/*
  # Criar tabela de perguntas

  1. Nova Tabela
    - `questions`
      - `id` (uuid, primary key)
      - `quiz_id` (uuid, foreign key para quizzes)
      - `question_text` (text, obrigatório)
      - `options` (jsonb, array de strings)
      - `correct_option_index` (integer, índice da resposta correta)
      - `created_at` (timestamp)

  2. Segurança
    - Habilitar RLS na tabela `questions`
    - Política para usuários autenticados lerem/editarem perguntas de seus próprios quizzes
*/

CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  correct_option_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários gerenciem perguntas de seus próprios quizzes
CREATE POLICY "Users can manage questions of their own quizzes"
  ON questions
  FOR ALL
  TO authenticated
  USING (
    quiz_id IN (
      SELECT id FROM quizzes WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    quiz_id IN (
      SELECT id FROM quizzes WHERE user_id = auth.uid()
    )
  );

-- Política para permitir leitura pública de perguntas de quizzes ativos
CREATE POLICY "Public can read questions of active quizzes"
  ON questions
  FOR SELECT
  TO anon
  USING (
    quiz_id IN (
      SELECT id FROM quizzes WHERE status = 'active'
    )
  );

-- Índice para melhorar performance das consultas
CREATE INDEX IF NOT EXISTS idx_questions_quiz_id ON questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_questions_created_at ON questions(created_at);