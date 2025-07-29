import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowLeft, Shield, Eye, Lock, Database } from 'lucide-react';

const PrivacyPage = () => {
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
          <div className="flex items-center space-x-3 mb-8">
            <Shield className="w-8 h-8 text-rose-500" />
            <h1 className="text-4xl font-bold text-gray-900">Política de Privacidade</h1>
          </div>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Última atualização:</strong> 15 de janeiro de 2025
            </p>

            <div className="bg-rose-50 border border-rose-200 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-rose-800 mb-2">Resumo da Nossa Política</h3>
              <p className="text-rose-700">
                Respeitamos sua privacidade e protegemos seus dados pessoais. Coletamos apenas as informações 
                necessárias para fornecer nosso serviço e nunca vendemos seus dados para terceiros.
              </p>
            </div>

            <section className="mb-8">
              <div className="flex items-center space-x-2 mb-4">
                <Database className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-semibold text-gray-900">1. Informações que Coletamos</h2>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Informações da Conta</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Nome completo e endereço de email</li>
                <li>Senha criptografada</li>
                <li>Informações de pagamento (processadas pelo Stripe)</li>
                <li>Data de criação da conta</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-800 mb-3">Dados dos Quizzes</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Perguntas e respostas criadas por você</li>
                <li>Configurações de personalização</li>
                <li>Respostas dos convidados</li>
                <li>Estatísticas de participação</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-800 mb-3">Dados Técnicos</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Endereço IP e localização aproximada</li>
                <li>Tipo de dispositivo e navegador</li>
                <li>Logs de acesso e uso do serviço</li>
                <li>Cookies para melhorar a experiência</li>
              </ul>
            </section>

            <section className="mb-8">
              <div className="flex items-center space-x-2 mb-4">
                <Eye className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-semibold text-gray-900">2. Como Usamos Suas Informações</h2>
              </div>
              
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li><strong>Fornecer o serviço:</strong> Criar e gerenciar seus quizzes</li>
                <li><strong>Comunicação:</strong> Enviar atualizações importantes e suporte</li>
                <li><strong>Melhorias:</strong> Analisar uso para aprimorar funcionalidades</li>
                <li><strong>Segurança:</strong> Detectar e prevenir atividades suspeitas</li>
                <li><strong>Cobrança:</strong> Processar pagamentos e gerenciar assinaturas</li>
              </ul>
            </section>

            <section className="mb-8">
              <div className="flex items-center space-x-2 mb-4">
                <Lock className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-semibold text-gray-900">3. Compartilhamento de Dados</h2>
              </div>
              
              <p className="text-gray-700 mb-4">
                <strong>Nunca vendemos seus dados.</strong> Compartilhamos informações apenas quando:
              </p>
              
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li><strong>Com seu consentimento:</strong> Quando você autoriza explicitamente</li>
                <li><strong>Prestadores de serviço:</strong> Stripe (pagamentos), Supabase (hospedagem)</li>
                <li><strong>Obrigação legal:</strong> Quando exigido por lei ou ordem judicial</li>
                <li><strong>Proteção de direitos:</strong> Para proteger nossos direitos legais</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Segurança dos Dados</h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800 mb-2">Criptografia</h3>
                  <p className="text-green-700 text-sm">
                    Todos os dados são criptografados em trânsito e em repouso usando padrões da indústria.
                  </p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 mb-2">Acesso Limitado</h3>
                  <p className="text-blue-700 text-sm">
                    Apenas funcionários autorizados têm acesso aos dados, com logs de auditoria.
                  </p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-800 mb-2">Backups Seguros</h3>
                  <p className="text-purple-700 text-sm">
                    Backups regulares são mantidos em locais seguros com criptografia adicional.
                  </p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-800 mb-2">Monitoramento</h3>
                  <p className="text-yellow-700 text-sm">
                    Sistemas de monitoramento 24/7 para detectar atividades suspeitas.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Seus Direitos</h2>
              
              <p className="text-gray-700 mb-4">Você tem o direito de:</p>
              
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li><strong>Acessar:</strong> Solicitar uma cópia dos seus dados</li>
                <li><strong>Corrigir:</strong> Atualizar informações incorretas</li>
                <li><strong>Excluir:</strong> Solicitar a remoção dos seus dados</li>
                <li><strong>Portabilidade:</strong> Exportar seus dados em formato legível</li>
                <li><strong>Objeção:</strong> Opor-se ao processamento de dados específicos</li>
              </ul>
              
              <p className="text-gray-700">
                Para exercer esses direitos, entre em contato conosco em <strong>privacy@juntitto.com</strong>
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Retenção de Dados</h2>
              
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li><strong>Contas ativas:</strong> Dados mantidos enquanto a conta estiver ativa</li>
                <li><strong>Contas canceladas:</strong> Dados excluídos após 30 dias</li>
                <li><strong>Dados de pagamento:</strong> Mantidos conforme exigências fiscais</li>
                <li><strong>Logs de segurança:</strong> Mantidos por até 1 ano</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Cookies e Tecnologias Similares</h2>
              
              <p className="text-gray-700 mb-4">
                Usamos cookies para melhorar sua experiência. Você pode controlar cookies através 
                das configurações do seu navegador.
              </p>
              
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li><strong>Essenciais:</strong> Necessários para o funcionamento do site</li>
                <li><strong>Funcionais:</strong> Lembram suas preferências</li>
                <li><strong>Analíticos:</strong> Ajudam a entender como você usa o site</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Alterações nesta Política</h2>
              
              <p className="text-gray-700 mb-4">
                Podemos atualizar esta política ocasionalmente. Notificaremos sobre mudanças 
                significativas por email ou através do serviço.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Contato</h2>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <p className="text-gray-700 mb-4">
                  Para questões sobre privacidade ou para exercer seus direitos:
                </p>
                <p className="text-gray-700">
                  <strong>Email:</strong> privacy@juntitto.com<br />
                  <strong>Endereço:</strong> São Paulo, SP, Brasil<br />
                  <strong>Tempo de resposta:</strong> Até 30 dias
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;