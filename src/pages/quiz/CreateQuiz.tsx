import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft, Save, Eye, Palette } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useQuizManagementViewModel } from '../../viewmodels/QuizManagementViewModel';

interface QuestionForm {
  text: string;
  options: string[];
  correctAnswer: number;
}

const CreateQuiz = () => {
  const navigate = useNavigate();
  const { state } = useAuth();
  const { addToast } = useToast();
  const { themes, createQuiz, validateQuiz, saving } = useQuizManagementViewModel();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: ''
  });
  
  const [questions, setQuestions] = useState<QuestionForm[]>([
    {
      text: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    }
  ]);

  const [selectedThemeId, setSelectedThemeId] = useState(themes[0]?.id || '');

  const addQuestion = () => {
    setQuestions(prev => [...prev, {
      text: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    }]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (questionIndex: number, field: string, value: string) => {
    setQuestions(prev => prev.map((q, i) => 
      i === questionIndex ? { ...q, [field]: value } : q
    ));
  };

  const updateOption = (questionIndex: number, optionIndex: number, text: string) => {
    setQuestions(prev => prev.map((q, i) => 
      i === questionIndex 
        ? { 
            ...q, 
            options: q.options.map((option, j) => 
              j === optionIndex ? text : option
            )
          }
        : q
    ));
  };

  const setCorrectAnswer = (questionIndex: number, optionIndex: number) => {
    setQuestions(prev => prev.map((q, i) => 
      i === questionIndex 
        ? { ...q, correctAnswer: optionIndex }
        : q
    ));
  };

  const validateForm = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!formData.title.trim()) {
      errors.push('Quiz title is required');
    }

    if (!formData.event_date) {
      errors.push('Event date is required');
    }

    if (!selectedThemeId) {
      errors.push('Please select a theme');
    }

    questions.forEach((question, qIndex) => {
      if (!question.text.trim()) {
        errors.push(`Question ${qIndex + 1} text is required`);
      }

      const filledOptions = question.options.filter(option => option.trim());
      if (filledOptions.length < 2) {
        errors.push(`Question ${qIndex + 1} must have at least 2 answers`);
      }

      const correctOptionText = question.options[question.correctAnswer];
      if (!correctOptionText || !correctOptionText.trim()) {
        errors.push(`Question ${qIndex + 1} must have one correct answer`);
      }
    });

    return { isValid: errors.length === 0, errors };
  };

  const handleSave = async () => {
    const validation = validateForm();
    
    if (!validation.isValid) {
      console.log('CreateQuiz: Validation failed:', validation.errors);
      validation.errors.forEach(error => {
        addToast({
          type: 'error',
          title: 'Validation Error',
          message: error
        });
      });
      return;
    }

    if (!state.user) {
      console.error('CreateQuiz: No authenticated user');
      addToast({
        type: 'error',
        title: 'Authentication Error',
        message: 'You must be logged in to create a quiz'
      });
      return;
    }

    console.log('CreateQuiz: Starting quiz creation process');
    
    try {
      const quizData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        event_date: formData.event_date,
        user_id: state.user.id,
        theme_id: selectedThemeId
      };
      
      console.log('CreateQuiz: Creating quiz with data:', quizData);
      
      const quiz = await createQuiz({
        ...quizData
      });
      
      console.log('CreateQuiz: Quiz created successfully:', quiz);

      // Add questions to the created quiz
      console.log('CreateQuiz: Adding questions to quiz');
      for (const question of questions) {
        const validOptions = question.options.filter(option => option.trim());
        if (validOptions.length >= 2) {
          console.log('CreateQuiz: Adding question:', question.text);
          await addQuestion(quiz.id, {
            text: question.text,
            options: validOptions,
            correctAnswer: question.correctAnswer
          });
        }
      }
      
      console.log('CreateQuiz: All questions added successfully');

      addToast({
        type: 'success',
        title: 'Quiz Created!',
        message: 'Your quiz has been saved successfully'
      });
      
      navigate(`/quiz/${quiz.id}/edit`);
    } catch (error) {
      console.error('CreateQuiz: Error creating quiz:', error);
      addToast({
        type: 'error',
        title: 'Save Error',
        message: error instanceof Error ? error.message : 'Failed to save quiz. Please try again.'
      });
    }
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
            <h1 className="text-3xl font-bold text-gray-900">Create New Quiz</h1>
            <p className="text-gray-600">Set up your quiz information and add questions</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 bg-gradient-to-r from-rose-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-shadow disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Quiz'}</span>
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
                Quiz Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Our Love Story"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Date *
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
              placeholder="Brief description of your quiz"
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors resize-none"
            />
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Theme *
            </label>
            <select
              value={selectedThemeId}
              onChange={(e) => setSelectedThemeId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors"
            >
              <option value="">Select a theme</option>
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
              onClick={addQuestion}
              className="flex items-center space-x-2 bg-gradient-to-r from-rose-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Add Question</span>
            </button>
          </div>

          <div className="space-y-6">
            {questions.map((question, qIndex) => (
              <div key={qIndex} className="border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Question {qIndex + 1}</h3>
                  {questions.length > 1 && (
                    <button
                      onClick={() => removeQuestion(qIndex)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question Text *
                    </label>
                    <textarea
                      value={question.text}
                      onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)}
                      placeholder="Ex: Where did we meet?"
                      rows={2}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Answer Options *
                    </label>
                    <div className="space-y-3">
                      {question.options.map((option, oIndex) => (
                        <div key={oIndex} className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name={`correct-${qIndex}`}
                            checked={question.correctAnswer === oIndex}
                            onChange={() => setCorrectAnswer(qIndex, oIndex)}
                            className="w-4 h-4 text-rose-600 focus:ring-rose-500"
                          />
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                            placeholder={`Option ${oIndex + 1}`}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors"
                          />
                          <span className="text-sm text-gray-500 w-16">
                            {question.correctAnswer === oIndex && (
                              <span className="text-green-600 font-medium">Correct</span>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Select the radio button next to the correct answer
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
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-gradient-to-r from-rose-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-shadow disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save and Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateQuiz;