import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, CreditCard, Bell, Shield } from 'lucide-react';

const AccountSettings = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center space-x-4 mb-8">
        <button 
          onClick={() => navigate('/dashboard')}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configurações da Conta</h1>
          <p className="text-gray-600">Gerencie suas informações pessoais e preferências</p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Profile Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <User className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">Perfil</h2>
          </div>
          <p className="text-gray-600">
            Configurações de perfil em desenvolvimento...
          </p>
        </div>

        {/* Billing Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <CreditCard className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">Cobrança</h2>
          </div>
          <p className="text-gray-600">
            Configurações de cobrança em desenvolvimento...
          </p>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Bell className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">Notificações</h2>
          </div>
          <p className="text-gray-600">
            Configurações de notificações em desenvolvimento...
          </p>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Shield className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">Segurança</h2>
          </div>
          <p className="text-gray-600">
            Configurações de segurança em desenvolvimento...
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;