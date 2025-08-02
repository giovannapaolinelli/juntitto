import React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Heart, Users, Trophy, ArrowRight, Star, Check } from 'lucide-react';

const LandingPage = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-50 border-b border-rose-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Heart className="w-8 h-8 text-rose-500" />
              <span className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent">
                Juntitto
              </span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-rose-600 transition-colors">Recursos</a>
              <Link to="/pricing" className="text-gray-700 hover:text-rose-600 transition-colors">Preços</Link>
              <Link to="/demo" className="text-gray-700 hover:text-rose-600 transition-colors">Demo</Link>
              <Link to="/login" className="text-gray-700 hover:text-rose-600 transition-colors">Entrar</Link>
              <Link 
                to="/signup" 
                className="bg-gradient-to-r from-rose-500 to-purple-600 text-white px-6 py-2 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Começar Grátis
              </Link>
            </nav>
            
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500 rounded-lg"
              aria-label="Toggle mobile menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
          
          {/* Mobile menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-rose-100 py-4">
              <div className="flex flex-col space-y-4">
                <a href="#features" className="text-gray-700 hover:text-rose-600 transition-colors px-4 py-2">Recursos</a>
                <Link to="/pricing" className="text-gray-700 hover:text-rose-600 transition-colors px-4 py-2">Preços</Link>
                <Link to="/demo" className="text-gray-700 hover:text-rose-600 transition-colors px-4 py-2">Demo</Link>
                <Link to="/login" className="text-gray-700 hover:text-rose-600 transition-colors px-4 py-2">Entrar</Link>
                <Link 
                  to="/signup" 
                  className="bg-gradient-to-r from-rose-500 to-purple-600 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all duration-200 mx-4 text-center"
                >
                  Começar Grátis
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
              Quem viveu
              <span className="bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent"> sabe</span>
            </h1>
            <p className="text-2xl md:text-3xl text-gray-600 mb-4 font-light">
              Sabe mesmo?
            </p>
            <p className="text-xl text-gray-500 mb-12 max-w-3xl mx-auto">
              Crie quizzes divertidos sobre sua história de amor e desafie seus convidados a descobrir o quanto eles realmente sabem sobre vocês
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link 
                to="/signup"
                className="bg-gradient-to-r from-rose-500 to-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
              >
                <Play className="w-5 h-5" />
                <span>Criar Meu Quiz</span>
              </Link>
              <Link 
                to="/demo"
                className="text-gray-700 hover:text-rose-600 transition-colors flex items-center space-x-2 px-8 py-4"
              >
                <span>Ver Demonstração</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Social Proof */}
            <div className="flex flex-col items-center space-y-4">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600">Mais de 1.000 casais já criaram seus quizzes</p>
            </div>
          </div>
        </div>

        {/* Background Elements */}
        <div className="absolute top-1/2 left-1/4 w-72 h-72 bg-rose-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tudo que você precisa para um quiz perfeito
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Ferramentas simples e poderosas para criar experiências memoráveis
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center mb-6">
                <Heart className="w-6 h-6 text-rose-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Criação Intuitiva</h3>
              <p className="text-gray-600 mb-6">
                Interface simples para criar perguntas personalizadas sobre sua história de amor
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  Perguntas ilimitadas
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  Múltipla escolha ou texto
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Experiência Mobile</h3>
              <p className="text-gray-600 mb-6">
                Seus convidados podem participar facilmente pelo celular
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  Design responsivo
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  Compartilhamento por QR Code
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-6">
                <Trophy className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Ranking e Resultados</h3>
              <p className="text-gray-600 mb-6">
                Veja quem conhece vocês melhor com rankings em tempo real
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  Leaderboard ao vivo
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  Estatísticas detalhadas
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-rose-500 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Pronto para surpreender seus convidados?
          </h2>
          <p className="text-xl text-rose-100 mb-8">
            Comece gratuitamente e crie seu primeiro quiz em minutos
          </p>
          <Link 
            to="/signup"
            className="inline-flex items-center bg-white text-rose-600 px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-200 space-x-2"
          >
            <Play className="w-5 h-5" />
            <span>Criar Meu Quiz Agora</span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Heart className="w-6 h-6 text-rose-500" />
                <span className="text-xl font-bold">Juntitto</span>
              </div>
              <p className="text-gray-400">
                Criando memórias através de quizzes interativos para casais
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Recursos</a></li>
                <li><Link to="/pricing" className="hover:text-white transition-colors">Preços</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/terms" className="hover:text-white transition-colors">Termos</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacidade</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Juntitto. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;