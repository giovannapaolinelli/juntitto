import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Palette, Clock, Users } from 'lucide-react';
import { useQuizManagementViewModel } from '../../viewmodels/QuizManagementViewModel';

const PreviewQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { quiz, loading } = useQuizManagementViewModel(id);
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [showWelcome, setShowWelcome] = useState(true);
  
  console.log('PreviewQuiz: Rendering with quiz:', quiz);

  if (loading) {
    console.log('PreviewQuiz: Loading quiz...');
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    console.error('PreviewQuiz: Quiz not found');
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-red-600">Quiz not found</p>
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

  const questions = quiz.questions || [];
  const currentQ = questions[currentQuestion];
  
  console.log('PreviewQuiz: Current question:', currentQ);

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: quiz.theme?.background_color || '#fdf2f8' }}
    >
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-rose-100 p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate(`/quiz/${id}/edit`)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Preview Mode</h1>
              <p className="text-sm text-gray-600">This is how guests will see your quiz</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button 
              onClick={() => navigate(`/quiz/${id}/edit`)}
              className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </button>
            <button 
              onClick={() => navigate(`/quiz/${id}/customize`)}
              className="flex items-center space-x-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors"
            >
              <Palette className="w-4 h-4" />
              <span>Customize</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4 py-8">
        {showWelcome ? (
          /* Welcome Screen */
          <div className="text-center">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto">
              {quiz.photo_url && (
                <img 
                  src={quiz.photo_url} 
                  alt="Quiz cover" 
                  className="w-full h-48 object-cover rounded-lg mb-6"
                />
              )}
              
              <h1 
                className="text-3xl font-bold mb-4"
                style={{ color: quiz.theme?.text_color || '#1f2937' }}
              >
                {quiz.title}
              </h1>
              
              {quiz.description && (
                <p className="text-gray-600 mb-6">{quiz.description}</p>
              )}
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{questions.length} questions</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>30s per question</span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setShowWelcome(false)}
                className="w-full text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-shadow"
                style={{ 
                  background: `linear-gradient(to right, ${quiz.theme?.primary_color || '#ec4899'}, ${quiz.theme?.secondary_color || '#8b5cf6'})`
                }}
              >
                Start Quiz
              </button>
            </div>
          </div>
        ) : questions.length === 0 ? (
          /* No Questions */
          <div className="text-center">
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">No Questions Added</h2>
              <p className="text-gray-600 mb-6">Add some questions to see the quiz preview</p>
              <button
                onClick={() => navigate(`/quiz/${id}/edit`)}
                className="bg-gradient-to-r from-rose-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-shadow"
              >
                Add Questions
              </button>
            </div>
          </div>
        ) : (
          /* Question View */
          <>
            {/* Progress Header */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">{quiz.title}</span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>Question {currentQuestion + 1} of {questions.length}</span>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>0:30</span>
                  </div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="h-3 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${((currentQuestion + 1) / questions.length) * 100}%`,
                    background: `linear-gradient(to right, ${quiz.theme?.primary_color || '#ec4899'}, ${quiz.theme?.secondary_color || '#8b5cf6'})`
                  }}
                ></div>
              </div>
            </div>

            {/* Question */}
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h2 
                className="text-2xl md:text-3xl font-bold mb-8 text-center"
                style={{ color: quiz.theme?.text_color || '#1f2937' }}
              >
                {currentQ?.text}
              </h2>
              
              <div className="grid gap-4 max-w-2xl mx-auto">
                {currentQ?.options?.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedAnswers(prev => ({ ...prev, [currentQuestion]: index }))}
                    className={`w-full p-4 md:p-6 text-left border-2 rounded-xl transition-all duration-200 text-lg ${
                      selectedAnswers[currentQuestion] === index
                        ? 'border-rose-500 bg-rose-50'
                        : 'border-gray-200 hover:border-rose-300 hover:bg-rose-50'
                    }`}
                  >
                    <span>{option}</span>
                  </button>
                ))}
              </div>
              
              {/* Navigation */}
              <div className="flex justify-between items-center mt-8 max-w-2xl mx-auto">
                <button
                  onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                  disabled={currentQuestion === 0}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <span className="text-sm text-gray-500">
                  {currentQuestion + 1} / {questions.length}
                </span>
                
                <button
                  onClick={() => {
                    if (currentQuestion < questions.length - 1) {
                      setCurrentQuestion(currentQuestion + 1);
                    }
                  }}
                  disabled={currentQuestion >= questions.length - 1}
                  className="px-6 py-3 text-white rounded-lg hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ 
                    background: `linear-gradient(to right, ${quiz.theme?.primary_color || '#ec4899'}, ${quiz.theme?.secondary_color || '#8b5cf6'})`
                  }}
                >
                  {currentQuestion >= questions.length - 1 ? 'Finish' : 'Next'}
                </button>
              </div>
            </div>
          </>
        )}

        {/* Start from Welcome Screen */}
        {!showWelcome && (
          <div className="text-center mt-8">
            <button
              onClick={() => setShowWelcome(true)}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Back to Welcome Screen
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviewQuiz;