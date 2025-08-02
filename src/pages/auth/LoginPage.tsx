import React, { useState } from 'react';
import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Heart, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useAuthRedirect } from '../../hooks/useAuthRedirect';

const LoginPage = () => {
  const { state, signIn } = useAuth();
  const { addToast } = useToast();
  const { isAuthenticated } = useAuthRedirect();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initTimeout, setInitTimeout] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // Add timeout for initialization to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!state.initialized) {
        console.warn('LoginPage: Auth initialization timeout after 10 seconds');
        setInitTimeout(true);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timer);
  }, [state.initialized]);

  // Reset timeout when initialization completes
  useEffect(() => {
    if (state.initialized && initTimeout) {
      setInitTimeout(false);
    }
  }, [state.initialized, initTimeout]);

  // Show loading while auth is initializing
  if (!state.initialized && !initTimeout) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Show error state if initialization times out
  if (!state.initialized && initTimeout) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Problema de Conexão</h2>
          <p className="text-gray-600 mb-6">
            Não foi possível inicializar a autenticação. Verifique sua conexão com a internet.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gradient-to-r from-rose-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-shadow"
            >
              Tentar Novamente
            </button>
            <Link
              to="/"
              className="block w-full text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Voltar para o início
            </Link>
          </div>
        </div>
      </div>
    );
  }
  // Redirect if already logged in (handled by useAuthRedirect)
  if (isAuthenticated) {
    console.log('LoginPage: User already authenticated, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    console.log('LoginPage: Button loading set to true'); // NOVO LOG

    try {
      console.log('LoginPage: Attempting login...');
      
      const result = await signIn({
        email: formData.email,
         password: formData.password
       });
       
       console.log('LoginPage: signIn result:', result);
       
       if (result.success) {
        addToast({
          type: 'success',
          title: 'Login realizado com sucesso!',
          message: 'Bem-vindo de volta ao Juntitto'
        });
      } else {
        console.error('LoginPage: Login failed:', result.error);
        addToast({
          type: 'error',
          title: 'Erro no login',
          message: result.error || 'Email ou senha incorretos'
        });
      }
    } catch (error) {
      console.error('LoginPage: Unexpected login error in handleSubmit:', error); // NOVO LOG
      console.error('LoginPage: Unexpected login error:', error);
      addToast({
        type: 'error',
        title: 'Erro no login',
        message: 'Ocorreu um erro inesperado. Tente novamente.'
      });
    } finally {
      // Always reset loading state regardless of success or failure
      setIsSubmitting(false);
      console.log('LoginPage: Button loading set to false (finally block)'); // NOVO LOG
      console.log('LoginPage: Loading state reset');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-6">
            <Heart className="w-8 h-8 text-rose-500" />
            <span className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent">
              Juntitto
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bem-vindo de volta</h1>
          <p className="text-gray-600">Entre na sua conta para continuar criando quizzes incríveis</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors"
                  placeholder="Sua senha"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-600">Lembrar de mim</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-rose-600 hover:text-rose-700">
                Esqueceu a senha?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || state.loading}
              className="w-full bg-gradient-to-r from-rose-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Não tem uma conta?{' '}
              <Link to="/signup" className="text-rose-600 hover:text-rose-700 font-medium">
                Cadastre-se grátis
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link to="/" className="text-gray-600 hover:text-gray-800 transition-colors">
            ← Voltar para o início
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;