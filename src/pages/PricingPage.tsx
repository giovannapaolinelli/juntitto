import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Check, Crown, Star, Users, Zap } from 'lucide-react';

const PricingPage = () => {
  const plans = [
    {
      id: 'free',
      name: 'Gratuito',
      price: 0,
      period: 'para sempre',
      description: 'Perfeito para testar a plataforma',
      features: [
        '1 quiz ativo',
        'Até 5 convidados',
        '3 temas básicos',
        'Suporte por email',
        'Resultados básicos'
      ],
      limitations: [
        'Marca Juntitto no quiz',
        'Sem personalização avançada'
      ],
      cta: 'Começar Grátis',
      popular: false,
      color: 'gray'
    },
    {
      id: 'starter',
      name: 'Iniciante',
      price: 10,
      period: '/mês',
      description: 'Ideal para casamentos pequenos',
      features: [
        'Até 3 quizzes ativos',
        'Até 30 convidados',
        'Todos os temas',
        'Personalização básica',
        'Suporte prioritário',
        'Estatísticas detalhadas',
        'Sem marca Juntitto'
      ],
      cta: 'Escolher Plano',
      popular: false,
      color: 'rose'
    },
    {
      id: 'pro',
      name: 'Profissional',
      price: 15,
      period: '/mês',
      description: 'Para casamentos médios',
      features: [
        'Até 5 quizzes ativos',
        'Até 50 convidados',
        'Temas premium',
        'Personalização completa',
        'Suporte 24/7',
        'Analytics avançados',
        'QR codes personalizados',
        'Exportar resultados'
      ],
      cta: 'Escolher Plano',
      popular: true,
      color: 'purple'
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 25,
      period: '/mês',
      description: 'Para casamentos grandes',
      features: [
        'Quizzes ilimitados',
        'Até 100 convidados',
        'Todos os recursos',
        'Temas exclusivos',
        'Suporte dedicado',
        'White-label completo',
        'API personalizada',
        'Consultoria inclusa'
      ],
      cta: 'Escolher Plano',
      popular: false,
      color: 'yellow'
    }
  ];

  const getColorClasses = (color: string, type: 'border' | 'bg' | 'text' | 'button') => {
    const colors = {
      gray: {
        border: 'border-gray-200',
        bg: 'bg-gray-50',
        text: 'text-gray-600',
        button: 'bg-gray-600 hover:bg-gray-700'
      },
      rose: {
        border: 'border-rose-200',
        bg: 'bg-rose-50',
        text: 'text-rose-600',
        button: 'bg-rose-600 hover:bg-rose-700'
      },
      purple: {
        border: 'border-purple-200',
        bg: 'bg-purple-50',
        text: 'text-purple-600',
        button: 'bg-gradient-to-r from-rose-500 to-purple-600 hover:shadow-lg'
      },
      yellow: {
        border: 'border-yellow-200',
        bg: 'bg-yellow-50',
        text: 'text-yellow-600',
        button: 'bg-yellow-600 hover:bg-yellow-700'
      }
    };
    return colors[color as keyof typeof colors][type];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-50 border-b border-rose-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center space-x-2">
              <Heart className="w-8 h-8 text-rose-500" />
              <span className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent">
                Juntitto
              </span>
            </Link>
            <nav className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-700 hover:text-rose-600 transition-colors">
                Entrar
              </Link>
              <Link 
                to="/signup" 
                className="bg-gradient-to-r from-rose-500 to-purple-600 text-white px-6 py-2 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Começar Grátis
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Escolha o plano
            <span className="bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent"> perfeito</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Comece gratuitamente e faça upgrade conforme seu casamento cresce
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <span className="text-gray-600">Mensal</span>
            <div className="relative">
              <input type="checkbox" className="sr-only" />
              <div className="w-12 h-6 bg-gray-300 rounded-full cursor-pointer"></div>
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform"></div>
            </div>
            <span className="text-gray-600">
              Anual 
              <span className="ml-1 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                -20%
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {plans.map((plan) => (
            <div 
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-8 ${
                plan.popular ? 'ring-2 ring-purple-500 scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-rose-500 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                    <Star className="w-4 h-4" />
                    <span>Mais Popular</span>
                  </div>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-gray-900">R${plan.price}</span>
                  <span className="text-gray-600 ml-1">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-gray-700">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
                {plan.limitations?.map((limitation, index) => (
                  <li key={index} className="flex items-center text-gray-500">
                    <div className="w-5 h-5 mr-3 flex-shrink-0 flex items-center justify-center">
                      <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                    </div>
                    <span className="text-sm">{limitation}</span>
                  </li>
                ))}
              </ul>

              <Link
                to="/signup"
                className={`w-full text-white py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 text-center block ${getColorClasses(plan.color, 'button')}`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Additional Guests Pricing */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
          <div className="text-center mb-8">
            <Users className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Precisa de mais convidados?</h2>
            <p className="text-gray-600">Adicione mais convidados por apenas R$5 a cada 30 pessoas</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-rose-50 rounded-xl">
              <div className="text-2xl font-bold text-rose-600 mb-2">+30</div>
              <div className="text-gray-600">convidados extras</div>
              <div className="text-lg font-semibold text-gray-900 mt-2">R$5/mês</div>
            </div>
            <div className="text-center p-6 bg-purple-50 rounded-xl">
              <div className="text-2xl font-bold text-purple-600 mb-2">+60</div>
              <div className="text-gray-600">convidados extras</div>
              <div className="text-lg font-semibold text-gray-900 mt-2">R$10/mês</div>
            </div>
            <div className="text-center p-6 bg-yellow-50 rounded-xl">
              <div className="text-2xl font-bold text-yellow-600 mb-2">+100</div>
              <div className="text-gray-600">convidados extras</div>
              <div className="text-lg font-semibold text-gray-900 mt-2">R$15/mês</div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Perguntas Frequentes</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Posso cancelar a qualquer momento?</h3>
              <p className="text-gray-600">Sim, você pode cancelar sua assinatura a qualquer momento sem taxas de cancelamento.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">O que acontece se eu exceder o limite de convidados?</h3>
              <p className="text-gray-600">Você será notificado e poderá fazer upgrade ou adicionar convidados extras antes de ativar o quiz.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Posso mudar de plano depois?</h3>
              <p className="text-gray-600">Claro! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Os dados ficam salvos se eu cancelar?</h3>
              <p className="text-gray-600">Seus quizzes ficam salvos por 30 dias após o cancelamento para caso você queira reativar.</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Pronto para começar?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Crie sua conta gratuita e comece a surpreender seus convidados
          </p>
          <Link 
            to="/signup"
            className="inline-flex items-center bg-gradient-to-r from-rose-500 to-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-200 space-x-2"
          >
            <Zap className="w-5 h-5" />
            <span>Começar Grátis Agora</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;