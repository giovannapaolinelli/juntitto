import { AuthError } from '../types/auth';

export class ErrorHandler {
  private static instance: ErrorHandler;

  private constructor() {}

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Handle authentication errors with user-friendly messages
   */
  handleAuthError(error: AuthError): string {
    console.error('ErrorHandler: Auth error:', error);

    const userFriendlyMessages: Record<string, string> = {
      'invalid_credentials': 'Email ou senha incorretos',
      'email_not_confirmed': 'Email não confirmado. Verifique sua caixa de entrada.',
      'signup_disabled': 'Cadastro temporariamente desabilitado',
      'email_address_invalid': 'Endereço de email inválido',
      'password_too_short': 'Senha deve ter pelo menos 6 caracteres',
      'user_already_registered': 'Este email já está cadastrado',
      'network_error': 'Erro de conexão. Verifique sua internet.',
      'server_error': 'Erro no servidor. Tente novamente em alguns minutos.',
      'UNEXPECTED_ERROR': 'Ocorreu um erro inesperado. Tente novamente.'
    };

    return userFriendlyMessages[error.code] || error.message || 'Erro desconhecido';
  }

  /**
   * Handle network errors
   */
  handleNetworkError(error: any): string {
    console.error('ErrorHandler: Network error:', error);

    if (!navigator.onLine) {
      return 'Sem conexão com a internet. Verifique sua conexão.';
    }

    if (error.name === 'TimeoutError') {
      return 'Tempo limite excedido. Tente novamente.';
    }

    return 'Erro de conexão. Tente novamente.';
  }

  /**
   * Handle general application errors
   */
  handleGeneralError(error: any, context?: string): string {
    console.error(`ErrorHandler: General error${context ? ` in ${context}` : ''}:`, error);

    if (error instanceof TypeError) {
      return 'Erro interno da aplicação. Recarregue a página.';
    }

    if (error instanceof ReferenceError) {
      return 'Erro interno da aplicação. Recarregue a página.';
    }

    return 'Ocorreu um erro inesperado. Tente novamente.';
  }

  /**
   * Log error for debugging purposes
   */
  logError(error: any, context?: string, additionalData?: any): void {
    const errorInfo = {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      context,
      additionalData,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    console.error('ErrorHandler: Detailed error log:', errorInfo);

    // In production, you might want to send this to an error tracking service
    // like Sentry, LogRocket, or similar
  }
}