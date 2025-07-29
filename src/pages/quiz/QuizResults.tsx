import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Share, BarChart3, Users, Clock, Trophy, TrendingUp } from 'lucide-react';
import { useQuizResults } from '../../hooks/useQuizResults';
import { useQuizzes } from '../../hooks/useQuizzes';

const QuizResults = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { results, getLeaderboard, getStats } = useQuizResults(id || '');
  const { quizzes } = useQuizzes();
  
  const quiz = quizzes.find(q => q.id === id);
  const leaderboard = getLeaderboard();
  const stats = getStats();

  if (!quiz) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-center text-gray-600">Quiz não encontrado</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Resultados: {quiz.title}</h1>
            <p className="text-gray-600">Estatísticas e respostas dos convidados</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
            <Download className="w-4 h-4" />
            <span>Exportar</span>
          </button>
          <button className="flex items-center space-x-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors">
            <Share className="w-4 h-4" />
            <span>Compartilhar</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">{stats.totalParticipants}</span>
          </div>
          <p className="text-gray-600">Participantes</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-2">
            <Trophy className="w-8 h-8 text-yellow-600" />
            <span className="text-2xl font-bold text-gray-900">{stats.averageScore}%</span>
          </div>
          <p className="text-gray-600">Pontuação Média</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold text-gray-900">{Math.floor(stats.averageTime / 60)}:{(stats.averageTime % 60).toString().padStart(2, '0')}</span>
          </div>
          <p className="text-gray-600">Tempo Médio</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-purple-600" />
            <span className="text-2xl font-bold text-gray-900">{stats.completionRate}%</span>
          </div>
          <p className="text-gray-600">Taxa de Conclusão</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Leaderboard */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Trophy className="w-6 h-6 text-yellow-600" />
            <h2 className="text-xl font-semibold text-gray-900">Ranking</h2>
          </div>
          
          {leaderboard.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum participante ainda</p>
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboard.slice(0, 10).map((entry, index) => (
                <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-800' :
                      index === 1 ? 'bg-gray-100 text-gray-800' :
                      index === 2 ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {entry.position}
                    </div>
                    <span className="font-medium text-gray-900">{entry.guestName}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="font-medium">{entry.score}%</span>
                    <span>{Math.floor(entry.timeSpent / 60)}:{(entry.timeSpent % 60).toString().padStart(2, '0')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Question Analysis */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <BarChart3 className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">Análise das Perguntas</h2>
          </div>
          
          {quiz.questions.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma pergunta cadastrada</p>
            </div>
          ) : (
            <div className="space-y-4">
              {quiz.questions.map((question, index) => {
                const correctAnswers = results.filter(r => r.answers[index] === question.correctAnswer).length;
                const totalAnswers = results.length;
                const percentage = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;
                
                return (
                  <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900 text-sm">
                        {index + 1}. {question.text}
                      </h3>
                      <span className={`text-sm font-medium px-2 py-1 rounded ${
                        percentage >= 70 ? 'bg-green-100 text-green-800' :
                        percentage >= 40 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          percentage >= 70 ? 'bg-green-500' :
                          percentage >= 40 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {correctAnswers} de {totalAnswers} acertaram
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizResults;