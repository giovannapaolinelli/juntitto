import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Play, Settings, BarChart3, Users, Calendar, Copy, QrCode, MoreVertical } from 'lucide-react';
import { useQuizViewModel } from '../../viewmodels/QuizViewModel';
import { useAuth } from '../../contexts/AuthContext';
import { useAuthRedirect } from '../../hooks/useAuthRedirect';
import { useToast } from '../../contexts/ToastContext';
import { useTranslation } from 'react-i18next';
import QRCodeModal from '../../components/quiz/QRCodeModal';

const Dashboard = () => {
  const { t } = useTranslation();
  const { state } = useAuth();
  const { isAuthenticated, isLoading } = useAuthRedirect();
  const { addToast } = useToast();
  const { quizzes, loading } = useQuizViewModel(state.user?.id);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);

  const [currentPlan] = useState({
    name: "Gratuito",
    maxGuests: 30,
    usedGuests: 23,
    maxQuizzes: 1,
    usedQuizzes: 1
  });

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // This should not happen due to ProtectedRoute, but adding as safeguard
  if (!isAuthenticated) {
    return null; // ProtectedRoute will handle redirect
  }

  const copyQuizLink = (slug: string) => {
    const url = `${window.location.origin}/play/${slug}`;
    navigator.clipboard.writeText(url);
    addToast({
      type: 'success',
      title: 'Link copiado!',
      message: 'O link do quiz foi copiado para a área de transferência'
    });
  };

  const generateQRCode = (slug: string) => {
    const quiz = quizzes.find(q => q.slug === slug);
    if (quiz) {
      setSelectedQuiz(quiz);
      setQrModalOpen(true);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('dashboard.title')}</h1>
          <p className="text-gray-600">{t('dashboard.subtitle')}</p>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <Link 
            to="/quiz/new"
            className="bg-gradient-to-r from-rose-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>{t('dashboard.newQuiz')}</span>
          </Link>
        </div>
      </div>

      {/* Plan Status */}
      <div className="bg-gradient-to-r from-rose-50 to-purple-50 rounded-xl p-6 mb-8 border border-rose-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('dashboard.plan.title', { plan: currentPlan.name })}</h3>
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <span>{t('dashboard.plan.guests', { used: currentPlan.usedGuests, max: currentPlan.maxGuests })}</span>
              <span>{t('dashboard.plan.quizzes', { used: currentPlan.usedQuizzes, max: currentPlan.maxQuizzes })}</span>
            </div>
          </div>
          
          <Link 
            to="/pricing"
            className="mt-4 md:mt-0 bg-white text-purple-600 px-4 py-2 rounded-lg hover:shadow-md transition-shadow border border-purple-200"
          >
            {t('dashboard.plan.upgrade')}
          </Link>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>{t('dashboard.plan.guestsUsed')}</span>
            <span>{Math.round((currentPlan.usedGuests / currentPlan.maxGuests) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-rose-500 to-purple-600 h-2 rounded-full"
              style={{ width: `${(currentPlan.usedGuests / currentPlan.maxGuests) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Quizzes Grid */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      ) : (
      <>
      {quizzes.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Play className="w-12 h-12 text-rose-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('dashboard.noQuizzes.title')}</h3>
          <p className="text-gray-600 mb-6">{t('dashboard.noQuizzes.subtitle')}</p>
          <Link 
            to="/quiz/new"
            className="inline-flex items-center bg-gradient-to-r from-rose-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>{t('dashboard.noQuizzes.cta')}</span>
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 border border-gray-100">
              <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{quiz.title}</h3>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        quiz.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {quiz.status === 'active' ? t('dashboard.quiz.active') : t('dashboard.quiz.draft')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-3 bg-rose-50 rounded-lg">
                    <Users className="w-5 h-5 text-rose-600 mx-auto mb-1" />
                    <div className="text-lg font-semibold text-gray-900">{quiz.questions?.length || 0}</div>
                    <div className="text-xs text-gray-600">{t('dashboard.quiz.questions')}</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                    <div className="text-lg font-semibold text-gray-900">{quiz.guest_count}</div>
                    <div className="text-xs text-gray-600">{t('dashboard.quiz.responses')}</div>
                  </div>
                </div>

                {/* Event Date */}
                <div className="flex items-center text-sm text-gray-600 mb-6">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{t('dashboard.quiz.event', { date: new Date(quiz.event_date).toLocaleDateString() })}</span>
                </div>

                {/* Actions */}
                <div className="flex flex-col space-y-2">
                  {quiz.status === 'active' && (
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => copyQuizLink(quiz.slug)}
                        className="flex-1 bg-rose-50 text-rose-600 px-3 py-2 rounded-lg hover:bg-rose-100 transition-colors flex items-center justify-center space-x-1 text-sm"
                      >
                        <Copy className="w-4 h-4" />
                        <span>{t('dashboard.quiz.copyLink')}</span>
                      </button>
                      <button 
                        onClick={() => generateQRCode(quiz.slug)}
                        className="flex-1 bg-purple-50 text-purple-600 px-3 py-2 rounded-lg hover:bg-purple-100 transition-colors flex items-center justify-center space-x-1 text-sm"
                      >
                        <QrCode className="w-4 h-4" />
                        <span>{t('dashboard.quiz.qrCode')}</span>
                      </button>
                    </div>
                  )}
                  
                  <div className="flex space-x-2">
                    <Link 
                      to={`/quiz/${quiz.id}/edit`}
                      className="flex-1 bg-gray-50 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center space-x-1 text-sm"
                    >
                      <Settings className="w-4 h-4" />
                      <span>{t('common.edit')}</span>
                    </Link>
                    <Link 
                      to={`/quiz/${quiz.id}/results`}
                      className="flex-1 bg-gray-50 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center space-x-1 text-sm"
                    >
                      <BarChart3 className="w-4 h-4" />
                      <span>{t('dashboard.quiz.results')}</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </>)}
      
      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        quizUrl={selectedQuiz ? `${window.location.origin}/play/${selectedQuiz.slug}` : ''}
        quizTitle={selectedQuiz?.title || ''}
      />
    </div>
  );
};

export default Dashboard;