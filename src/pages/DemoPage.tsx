import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Clock, Trophy, CheckCircle, XCircle, ArrowRight, Play } from 'lucide-react';
import { useDemoQuizViewModel } from '../viewmodels/DemoQuizViewModel';

const DemoPage = () => {
  const { quiz, state, getCurrentQuestion, startTimer, answerQuestion, resetQuiz } = useDemoQuizViewModel();

  useEffect(() => {
    if (!state.completed && !state.showResult) {
      startTimer();
    }
  }, [state.currentQuestion, state.showResult, state.completed]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (state.completed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-2xl mx-auto">
          {/* Results Header */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-rose-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Parabéns!
            </h1>
            <p className="text-gray-600 mb-8">Você completou o quiz de demonstração</p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-rose-50 p-6 rounded-xl">
                <div className="text-3xl font-bold text-rose-600 mb-2">{state.score}%</div>
                <div className="text-gray-600">Pontuação</div>
              </div>
              <div className="bg-purple-50 p-6 rounded-xl">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {state.answers.filter((answer, index) => answer === quiz.questions[index].correctAnswer).length}
                </div>
                <div className="text-gray-600">Acertos</div>
              </div>
              <div className="bg-yellow-50 p-6 rounded-xl">
                <div className="text-3xl font-bold text-yellow-600 mb-2">{quiz.questions.length}</div>
                <div className="text-gray-600">Perguntas</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-rose-500 to-purple-600 rounded-xl p-8 text-white mb-8">
              <h2 className="text-2xl font-bold mb-4">Gostou da experiência?</h2>
              <p className="text-rose-100 mb-6">
                Crie seu próprio quiz personalizado para o seu casamento e surpreenda seus convidados!
              </p>
              <Link 
                to="/signup"
                className="inline-flex items-center bg-white text-rose-600 px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-200 space-x-2"
              >
                <Play className="w-5 h-5" />
                <span>Criar Meu Quiz Grátis</span>
              </Link>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={resetQuiz}
                className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Jogar Novamente
              </button>
              <Link
                to="/"
                className="text-gray-600 hover:text-gray-800 transition-colors flex items-center justify-center space-x-2"
              >
                <span>Voltar ao Início</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = getCurrentQuestion();
  const isCorrect = state.showResult && state.answers[state.currentQuestion] === currentQuestion.correctAnswer;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-rose-100 p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <Heart className="w-6 h-6 text-rose-500" />
            <span className="text-xl font-bold bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent">
              Juntitto
            </span>
          </Link>
          <div className="text-sm text-gray-600">
            <span className="bg-rose-100 text-rose-800 px-3 py-1 rounded-full font-medium">
              DEMONSTRAÇÃO
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4 py-8">
        {/* Progress Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <Heart className="w-5 h-5 text-rose-500" />
              <span className="font-medium text-gray-900">{quiz.title}</span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>Pergunta {state.currentQuestion + 1} de {quiz.questions.length}</span>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span className={state.timeRemaining <= 10 ? 'text-red-600 font-bold' : ''}>
                  {formatTime(state.timeRemaining)}
                </span>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-rose-500 to-purple-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${((state.currentQuestion + 1) / quiz.questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
            {currentQuestion.text}
          </h2>
          
          <div className="grid gap-4 max-w-2xl mx-auto">
            {currentQuestion.options.map((option, index) => {
              let buttonClass = "w-full p-4 md:p-6 text-left border-2 rounded-xl transition-all duration-200 text-lg ";
              
              if (state.showResult) {
                if (index === currentQuestion.correctAnswer) {
                  buttonClass += "border-green-500 bg-green-50 text-green-800";
                } else if (index === state.answers[state.currentQuestion] && index !== currentQuestion.correctAnswer) {
                  buttonClass += "border-red-500 bg-red-50 text-red-800";
                } else {
                  buttonClass += "border-gray-200 bg-gray-50 text-gray-500";
                }
              } else {
                buttonClass += "border-gray-200 hover:border-rose-300 hover:bg-rose-50 cursor-pointer transform hover:scale-105 active:scale-95";
              }
              
              return (
                <button
                  key={index}
                  onClick={() => !state.showResult && answerQuestion(index)}
                  disabled={state.showResult}
                  className={buttonClass}
                >
                  <div className="flex items-center justify-between">
                    <span>{option}</span>
                    {state.showResult && index === currentQuestion.correctAnswer && (
                      <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                    )}
                    {state.showResult && index === state.answers[state.currentQuestion] && index !== currentQuestion.correctAnswer && (
                      <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          
          {state.showResult && (
            <div className="mt-8 text-center">
              <div className={`inline-flex items-center space-x-2 px-6 py-3 rounded-full text-lg font-semibold ${
                isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {isCorrect ? (
                  <>
                    <CheckCircle className="w-6 h-6" />
                    <span>Correto!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-6 h-6" />
                    <span>Incorreto!</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Demo Notice */}
        <div className="mt-8 text-center">
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 inline-block">
            <p className="text-gray-600 text-sm">
              Esta é uma demonstração. 
              <Link to="/signup" className="text-rose-600 hover:text-rose-700 font-medium ml-1">
                Crie sua conta grátis
              </Link> para fazer seus próprios quizzes!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoPage;