import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowLeft } from 'lucide-react';

const TermsPage = () => {
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
            <Link 
              to="/"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Termos de Uso</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Última atualização:</strong> 15 de janeiro de 2025
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Aceitação dos Termos</h2>
              <p className="text-gray-700 mb-4">
                Ao acessar e usar o Juntitto, você concorda em cumprir e estar vinculado a estes Termos de Uso. 
                Se você não concordar com qualquer parte destes termos, não deve usar nosso serviço.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Descrição do Serviço</h2>
              <p className="text-gray-700 mb-4">
                O Juntitto é uma plataforma SaaS que permite aos usuários criar quizzes interativos para eventos de casamento. 
                Nosso serviço inclui:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Criação e personalização de quizzes</li>
                <li>Compartilhamento com convidados</li>
                <li>Coleta e análise de respostas</li>
                <li>Geração de rankings e estatísticas</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Contas de Usuário</h2>
              <p className="text-gray-700 mb-4">
                Para usar nosso serviço, você deve criar uma conta fornecendo informações precisas e completas. 
                Você é responsável por:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Manter a confidencialidade de sua senha</li>
                <li>Todas as atividades que ocorrem em sua conta</li>
                <li>Notificar-nos imediatamente sobre qualquer uso não autorizado</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Planos e Pagamentos</h2>
              <p className="text-gray-700 mb-4">
                Oferecemos diferentes planos de assinatura com recursos variados. Os pagamentos são processados 
                mensalmente e são não reembolsáveis, exceto quando exigido por lei.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Uso Aceitável</h2>
              <p className="text-gray-700 mb-4">
                Você concorda em não usar o serviço para:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Atividades ilegais ou não autorizadas</li>
                <li>Violar direitos de propriedade intelectual</li>
                <li>Transmitir conteúdo ofensivo ou prejudicial</li>
                <li>Interferir no funcionamento do serviço</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Propriedade Intelectual</h2>
              <p className="text-gray-700 mb-4">
                O Juntitto e todo o seu conteúdo são propriedade nossa ou de nossos licenciadores. 
                Você mantém os direitos sobre o conteúdo que cria usando nosso serviço.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Limitação de Responsabilidade</h2>
              <p className="text-gray-700 mb-4">
                O serviço é fornecido "como está" sem garantias. Não seremos responsáveis por danos 
                indiretos, incidentais ou consequenciais decorrentes do uso do serviço.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Modificações</h2>
              <p className="text-gray-700 mb-4">
                Reservamo-nos o direito de modificar estes termos a qualquer momento. 
                As alterações entrarão em vigor imediatamente após a publicação.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Contato</h2>
              <p className="text-gray-700 mb-4">
                Se você tiver dúvidas sobre estes Termos de Uso, entre em contato conosco em:
              </p>
              <p className="text-gray-700">
                <strong>Email:</strong> legal@juntitto.com<br />
                <strong>Endereço:</strong> São Paulo, SP, Brasil
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;