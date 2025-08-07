import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Eye, Palette, Plus, Trash2 } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useQuizManagementViewModel } from '../../viewmodels/QuizManagementViewModel';
import { useQuestionViewModel } from '../../viewmodels/QuestionViewModel';

const EditQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { 
    quiz, 
    themes, 
    loading, 
    saving, 
    error, 
    updateQuiz, 
    addQuestion, 
    updateQuestion, 
    deleteQuestion,
    validateQuiz 
  } = useQuizManagementViewModel(id);
  const { 
    questions: quizQuestions, 
    loadQuestions, 
    saveQuestions, 
    saving: savingQuestions,
    error: questionError 
  } = useQuestionViewModel();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    theme_id: ''
  });

  const [questions, setQuestions] = useState<any[]>([]);

  useEffect(() => {
    if (quiz) {
      setFormData({
        title: quiz.title,
        description: quiz.description || '',
        event_date: quiz.event_date,
        theme_id: quiz.theme_id
      });
      setQuestions(quiz.questions || []);
    }
  }, [quiz]);

  useEffect(() => {
    if (id) {
      loadQuestions(id);
    }
  }, [id, loadQuestions]);

  useEffect(() => {
    if (quizQuestions.length > 0) {
      setQuestions(quizQuestions.map(q => ({
        id: q.id,
        question_text: q.question_text,
        options: q.options,
        correct_option_index: q.correct_option_index
      })));
    }
  }, [quizQuestions]);
  const handleSave = async () => {
    if (!quiz) return;
    
    console.log('EditQuiz: Starting save process');

    const validation = validateQuiz({
      ...quiz,
      ...formData,
      questions: questions
    });

    if (!validation.isValid) {
      console.log('EditQuiz: Validation failed:', validation.errors);
      validation.errors.forEach(error => {
        addToast({
          type: 'error',
          title: 'Validation Error',
          message: error
        });
      });
      return;
    }

    try {
      console.log('EditQuiz: Updating quiz with data:', formData);
      await updateQuiz(quiz.id, formData);
      console.log('EditQuiz: Quiz updated successfully');
      
      // Salvar perguntas se houver alterações
      if (questions.length > 0) {
        console.log('EditQuiz: Saving questions');
        const questionsToSave = questions
          .filter(q => q.question_text && q.question_text.trim())
          .map(q => ({
            id: q.id,
            question_text: q.question_text.trim(),
            options: Array.isArray(q.options) ? q.options.filter(opt => opt && opt.trim()) : [],
            correct_option_index: q.correct_option_index || 0
          }));

        if (questionsToSave.length > 0) {
          await saveQuestions(quiz.id, questionsToSave);
          console.log('EditQuiz: Questions saved successfully');
        }
      }

      addToast({
        type: 'success',
        title: 'Quiz Updated!',
        message: 'Your changes have been saved successfully'
      });
    } catch (error) {
      console.error('EditQuiz: Error updating quiz:', error);
      addToast({
        type: 'error',
        title: 'Save Error',
        message: error instanceof Error ? error.message : 'Failed to save changes. Please try again.'
      });
    }
  };

  const handleAddQuestion = async () => {
    if (!quiz) return;
    
    const newQuestion = {
      question_text: 'Nova Pergunta',
      options: ['Opção 1', 'Opção 2', 'Opção 3', 'Opção 4'],
      correct_option_index: 0
    };
    
    setQuestions(prev => [...prev, newQuestion]);
  };

  const handleDeleteQuestion = async (questionId: string) => {
    setQuestions(prev => prev.filter(q => q.id !== questionId));
  };

  const updateQuestionText = (questionId: string, text: string) => {
    setQuestions(prev => prev.map(q => 
      q.id === questionId ? { ...q, question_text: text } : q
    ));
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-red-600">{error || 'Quiz not found'}</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="mt-4 text-rose-600 hover:text-rose-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold text-gray-900">Edit Quiz</h1>
            <p className="text-gray-600">Modify your quiz settings and questions</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button 
            onClick={() => navigate(`/quiz/${id}/preview`)}
            className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>Preview</span>
          </button>
          <button 
            onClick={() => navigate(`/quiz/${id}/customize`)}
            className="flex items-center space-x-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors"
          >
            <Palette className="w-4 h-4" />
            <span>Customize</span>
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            disabled={saving || savingQuestions}
            className="flex items-center space-x-2 bg-gradient-to-r from-rose-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-shadow disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving || savingQuestions ? 'Salvando...' : 'Salvar'}</span>
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {/* Quiz Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quiz Information</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quiz Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Date
              </label>
              <input
                type="date"
                value={formData.event_date}
                onChange={(e) => setFormData(prev => ({ ...prev, event_date: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors resize-none"
            />
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Theme
            </label>
            <select
              value={formData.theme_id}
              onChange={(e) => setFormData(prev => ({ ...prev, theme_id: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors"
            >
              {themes.map(theme => (
                <option key={theme.id} value={theme.id}>
                  {theme.name} {theme.is_premium ? '(Premium)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Questions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Questions</h2>
            <button
              onClick={handleAddQuestion}
              className="flex items-center space-x-2 bg-gradient-to-r from-rose-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Add Question</span>
            </button>
          </div>

          <div className="space-y-6">
            {questions.map((question, index) => (
              <div key={question.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Question {index + 1}</h3>
                  <button
                    onClick={() => handleDeleteQuestion(question.id)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question Text
                    </label>
                    <textarea
                      value={question.question_text}
                      onChange={(e) => {
                        updateQuestionText(question.id, e.target.value);
                      }}
                      rows={2}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Answer Options
                    </label>
                    <div className="space-y-3">
                      {question.options?.map((option: string, optionIndex: number) => (
                        <div key={optionIndex} className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name={`correct-${question.id}`}
                            checked={question.correct_option_index === optionIndex}
                            readOnly
                            className="w-4 h-4 text-rose-600 focus:ring-rose-500"
                          />
                          <input
                            type="text"
                            value={option}
                            readOnly
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                          />
                          <span className="text-sm text-gray-500 w-16">
                            {question.correct_option_index === optionIndex && (
                              <span className="text-green-600 font-medium">Correct</span>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditQuiz;