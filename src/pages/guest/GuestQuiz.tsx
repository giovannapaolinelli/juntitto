import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Heart, Clock, Trophy, Users, CheckCircle, XCircle } from 'lucide-react';
import { useQuizzes } from '../../hooks/useQuizzes';
import { useQuizResults } from '../../hooks/useQuizResults';

const GuestQuiz = () => {
  const { slug } = useParams();
  const location = useLocation();
  const { getQuizBySlug } = useQuizzes();
  
  // Handle demo mode
  const isDemo = location.pathname === '/play/demo';
  const demoQuiz = {
    id: 'demo',
    title: 'Quiz Demonstração - Nossa História',
    slug: 'demo',
    event_date: '2025-06-15',
    status: 'active' as const,
    theme: {
      backgroundColor: '#fdf2f8'
    },
    questions: [
      {
        id: '1',
        text: 'Onde João e Maria se conheceram?',
        options: ['Na faculdade', 'No trabalho', 'Em uma festa', 'No shopping'],
        correctAnswer: 0
      },
      {
        id: '2', 
        text: 'Qual foi o primeiro filme que assistiram juntos?',
        options: ['Titanic', 'Vingadores', 'Harry Potter', 'Star Wars'],
        correctAnswer: 2
      },
      {
        id: '3',
        text: 'Em que cidade fizeram a primeira viagem juntos?',
        options: ['Paris', 'Nova York', 'Rio de Janeiro', 'Buenos Aires'],
        correctAnswer: 2
      }
    ]
  };
  
  const quiz = isDemo ? demoQuiz : getQuizBySlug(slug || '');
  const { submitResult, getLeaderboard } = useQuizResults(quiz?.id || '');
  
  const [currentStep, setCurrentStep] = useState('welcome'); // welcome, quiz, results
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [guestName, setGuestName] = useState('');
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [showResult, setShowResult] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);

  const leaderboard = isDemo ? [
    { id: '1', guestName: 'Ana Silva', score: 100, timeSpent: 165, position: 1 },
    { id: '2', guestName: 'Carlos Santos', score: 67, timeSpent: 192, position: 2 },
    { id: '3', guestName: 'Lucia Oliveira', score: 33, timeSpent: 178, position: 3 }
  ] : getLeaderboard();

  // Timer effect
  useEffect(() => {
    if (currentStep === 'quiz' && timeRemaining > 0) {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0) {
      handleNextQuestion();
    }
  }, [currentStep, timeRemaining]);

  if (!quiz) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando quiz...</p>
      </div>
    </div>;
  }

  const handleStartQuiz = () => {
    if (guestName.trim()) {
      setCurrentStep('quiz');
      setTimeRemaining(30);
      setStartTime(Date.now());
    }
  };

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
    setShowResult(true);
    
    setTimeout(() => {
      handleNextQuestion();
    }, 1500);
  };

  const handleNextQuestion = () => {
    setShowResult(false);
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setTimeRemaining(30);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    const totalTime = Math.round((Date.now() - startTime) / 1000);
    const score = calculateScore();
    
    // Only submit results for real quizzes, not demo
    if (!isDemo) {
      try {
        await submitResult({
          quizId: quiz.id,
          guestName,
          answers,
          score,
          timeSpent: totalTime
        });
      } catch (error) {
        console.error('Error submitting result:', error);
      }
    }
    
    setCurrentStep('results');
  };

  const calculateScore = () => {
    let correct = 0;
    answers.forEach((answer, index) => {
      if (answer === quiz.questions[index].correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / quiz.questions.length) * 100);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (currentStep === 'welcome') {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: quiz.theme.backgroundColor }}
      >
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-rose-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{quiz.title}</h1>
          <p className="text-gray-600 mb-6">
            Teste seus conhecimentos sobre o casal
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{quiz.questions.length} perguntas</span>
              </div>
              <div className="flex items-center space-x-1">
                <Trophy className="w-4 h-4" />
                <span>30s por pergunta</span>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seu nome
            </label>
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Digite seu nome"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleStartQuiz()}
            />
          </div>
          
          <button
            onClick={handleStartQuiz}
            disabled={!guestName.trim()}
            className="w-full bg-gradient-to-r from-rose-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            Começar Quiz
          </button>
        </div>
      </div>
    );
  }

  if (currentStep === 'quiz') {
    const question = quiz.questions[currentQuestion];
    const isCorrect = showResult && answers[currentQuestion] === question.correctAnswer;
    
    return (
      <div 
        className="min-h-screen p-4"
        style={{ backgroundColor: quiz.theme.backgroundColor }}
      >
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <Heart className="w-5 h-5 text-rose-500" />
                <span className="font-medium text-gray-900">{quiz.title}</span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>Pergunta {currentQuestion + 1} de {quiz.questions.length}</span>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span className={timeRemaining <= 10 ? 'text-red-600 font-bold' : ''}>
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-rose-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Question */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              {question.text}
            </h2>
            
            <div className="grid gap-4">
              {question.options.map((option, index) => {
                let buttonClass = "w-full p-4 text-left border-2 rounded-xl transition-all duration-200 ";
                
                if (showResult) {
                  if (index === question.correctAnswer) {
                    buttonClass += "border-green-500 bg-green-50 text-green-800";
                  } else if (index === answers[currentQuestion] && index !== question.correctAnswer) {
                    buttonClass += "border-red-500 bg-red-50 text-red-800";
                  } else {
                    buttonClass += "border-gray-200 bg-gray-50 text-gray-500";
                  }
                } else {
                  buttonClass += "border-gray-200 hover:border-rose-300 hover:bg-rose-50 cursor-pointer";
                }
                
                return (
                  <button
                    key={index}
                    onClick={() => !showResult && handleAnswer(index)}
                    disabled={showResult}
                    className={buttonClass}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg">{option}</span>
                      {showResult && index === question.correctAnswer && (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      )}
                      {showResult && index === answers[currentQuestion] && index !== question.correctAnswer && (
                        <XCircle className="w-6 h-6 text-red-600" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            
            {showResult && (
              <div className="mt-6 text-center">
                <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${
                  isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {isCorrect ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Correto!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5" />
                      <span>Incorreto!</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'results') {
    const score = calculateScore();
    const position = leaderboard.findIndex(entry => score > entry.score) + 1;
    
    return (
      <div 
        className="min-h-screen p-4"
        style={{ backgroundColor: quiz.theme.backgroundColor }}
      >
        <div className="max-w-2xl mx-auto">
          {/* Results Header */}
          <div className="bg-white rounded-xl shadow-sm p-8 mb-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-rose-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Parabéns, {guestName}!
            </h1>
            <p className="text-gray-600 mb-6">Você completou o quiz "{quiz.title}"</p>
            
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-rose-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-rose-600">{score}%</div>
                <div className="text-sm text-gray-600">Pontuação</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">#{leaderboard.findIndex(entry => entry.guestName === guestName) + 1 || leaderboard.length + 1}</div>
                <div className="text-sm text-gray-600">Posição</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{answers.filter((answer, index) => answer === quiz.questions[index].correctAnswer).length}</div>
                <div className="text-sm text-gray-600">Acertos</div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-rose-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-shadow"
              >
                Jogar Novamente
              </button>
              <button className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                Compartilhar Resultado
              </button>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Ranking</span>
            </h2>
            
            <div className="space-y-3">
              {leaderboard.map((entry, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-800' :
                      index === 1 ? 'bg-gray-100 text-gray-800' :
                      index === 2 ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="font-medium text-gray-900">{entry.guestName}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>{entry.score}%</span>
                    <span>{Math.floor(entry.timeSpent / 60)}:{(entry.timeSpent % 60).toString().padStart(2, '0')}</span>
                  </div>
                </div>
              ))}
              
              {/* Show current user if not in visible leaderboard */}
              {leaderboard.length > 3 && !leaderboard.slice(0, 3).find(entry => entry.guestName === guestName) && (
                <div className="flex items-center justify-between p-3 bg-rose-50 rounded-lg border-2 border-rose-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-rose-100 text-rose-800">
                      {leaderboard.findIndex(entry => entry.guestName === guestName) + 1}
                    </div>
                    <span className="font-medium text-gray-900">{guestName} (Você)</span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>{score}%</span>
                    <span>Agora</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default GuestQuiz;