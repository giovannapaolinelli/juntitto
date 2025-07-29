import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft, Save, Eye, Palette } from 'lucide-react';
import { useQuizzes } from '../../hooks/useQuizzes';
import { useToast } from '../../contexts/ToastContext';
import { Question } from '../../types';

const CreateQuiz = () => {
  const navigate = useNavigate();
  const { createQuiz } = useQuizzes();
  const { addToast } = useToast();
  
  const [quiz, setQuiz] = useState({
    title: '',
    eventDate: '',
    questions: [] as Question[]
  });
  
  const [questions, setQuestions] = useState<Omit<Question, 'id' | 'quizId'>[]>([
    {
      text: '',
      type: 'multiple_choice' as const,
      options: ['', '', '', ''],
      correctAnswer: 0,
      order: 1
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const addQuestion = () => {
    const newQuestion = {
      text: '',
      type: 'multiple_choice' as const,
      options: ['', '', '', ''],
      correctAnswer: 0,
      order: questions.length + 1
    };
    setQuestions(prev => [...prev, newQuestion]);
  };

  const updateQuestion = (questionIndex: number, field: string, value: any) => {
    setQuestions(prev => prev.map((q, index) => 
      index === questionIndex ? { ...q, [field]: value } : q
    ));
  };

  const updateQuestionOption = (questionIndex: number, optionIndex: number, value: string) => {
    setQuestions(prev => prev.map((q, index) => 
      index === questionIndex 
        ? { ...q, options: q.options.map((opt, idx) => idx === optionIndex ? value : opt) }
        : q
    ));
  };

  const removeQuestion = (questionIndex: number) => {
    if (questions.length > 1) {
      setQuestions(prev => prev.filter((_, index) => index !== questionIndex));
    }
  };

  const validateForm = () => {
    if (!quiz.title.trim()) {
      addToast({
        type: 'error',
        title: 'Título obrigatório',
        message: 'Por favor, adicione um título para o quiz'
      });
      return false;
    }

    const invalidQuestions = questions.filter(q => 
      !q.text.trim() || q.options.some(opt => !opt.trim())
    );

    if (invalidQuestions.length > 0) {
      addToast({
        type: 'error',
        title: 'Perguntas incompletas',
        message: 'Por favor, complete todas as perguntas e opções'
      });
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await createQuiz({
        title: quiz.title,
        eventDate: quiz.eventDate
      });
      
      addToast({
        type: 'success',
        title: 'Quiz criado!',
        message: 'Seu quiz foi salvo com sucesso'
      });
      
      navigate('/dashboard');
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Erro ao salvar',
        message: 'Não foi possível salvar o quiz. Tente novamente.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    if (!validateForm()) return;
    // In a real app, this would pass the quiz data to preview
    navigate('/quiz/preview/temp');
  };

  const handleCustomize = () => {
    if (!validateForm()) return;
    // In a real app, this would pass the quiz data to customize
    navigate('/quiz/customize/temp');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Criar Novo Quiz</h1>
            <p className="text-gray-600">Configure as informações básicas e adicione suas perguntas</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button 
            onClick={handlePreview}
            className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>Visualizar</span>
          </button>
          <button 
            onClick={handleCustomize}
            className="flex items-center space-x-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors"
          >
            <Palette className="w-4 h-4" />
            <span>Personalizar</span>
          </button>
          <button 
            onClick={handleSave}
            disabled={loading}
            className="flex items-center space-x-2 bg-gradient-to-r from-rose-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-shadow disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Salvando...' : 'Salvar Quiz'}</span>
          </button>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
            currentStep >= 1 ? 'bg-rose-500 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            1
          </div>
          <div className={`w-16 h-1 ${currentStep >= 2 ? 'bg-rose-500' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
            currentStep >= 2 ? 'bg-rose-500 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            2
          </div>
          <div className={`w-16 h-1 ${currentStep >= 3 ? 'bg-rose-500' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
            currentStep >= 3 ? 'bg-rose-500 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            3
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Quiz Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Informações do Quiz</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título do Quiz *
              </label>
              <input
                type="text"
                value={quiz.title}
                onChange={(e) => setQuiz(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Nossa História de Amor"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data do Evento
              </label>
              <input
                type="date"
                value={quiz.eventDate}
                onChange={(e) => setQuiz(prev => ({ ...prev, eventDate: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Perguntas</h2>
            <button
              onClick={addQuestion}
              className="flex items-center space-x-2 bg-gradient-to-r from-rose-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Pergunta</span>
            </button>
          </div>

          <div className="space-y-6">
            {questions.map((question, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Pergunta {index + 1}</h3>
                  {questions.length > 1 && (
                    <button
                      onClick={() => removeQuestion(index)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Texto da Pergunta *
                    </label>
                    <textarea
                      value={question.text}
                      onChange={(e) => updateQuestion(index, 'text', e.target.value)}
                      placeholder="Ex: Onde nos conhecemos?"
                      rows={2}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Opções de Resposta
                    </label>
                    <div className="space-y-3">
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name={`correct-${index}`}
                            checked={question.correctAnswer === optionIndex}
                            onChange={() => updateQuestion(index, 'correctAnswer', optionIndex)}
                            className="w-4 h-4 text-rose-600 focus:ring-rose-500"
                          />
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => updateQuestionOption(index, optionIndex, e.target.value)}
                            placeholder={`Opção ${optionIndex + 1}`}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors"
                          />
                          <span className="text-sm text-gray-500 w-16">
                            {question.correctAnswer === optionIndex && (
                              <span className="text-green-600 font-medium">Correta</span>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Selecione o botão de opção ao lado da resposta correta
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-rose-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-shadow disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar e Continuar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateQuiz;