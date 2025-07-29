import React from 'react';
import { X, Download, Copy } from 'lucide-react';
import { generateQRCodeURL } from '../../utils/qrCode';
import { useToast } from '../../contexts/ToastContext';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  quizUrl: string;
  quizTitle: string;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose, quizUrl, quizTitle }) => {
  const { addToast } = useToast();

  if (!isOpen) return null;

  const qrCodeURL = generateQRCodeURL(quizUrl, 300);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(quizUrl);
    addToast({
      type: 'success',
      title: 'Link copiado!',
      message: 'O link do quiz foi copiado para a área de transferência'
    });
  };

  const handleDownloadQR = () => {
    const link = document.createElement('a');
    link.href = qrCodeURL;
    link.download = `qr-code-${quizTitle.toLowerCase().replace(/\s+/g, '-')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    addToast({
      type: 'success',
      title: 'QR Code baixado!',
      message: 'O QR Code foi salvo em seus downloads'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">QR Code do Quiz</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-center mb-6">
          <div className="bg-white p-4 rounded-xl border-2 border-gray-200 inline-block mb-4">
            <img 
              src={qrCodeURL} 
              alt="QR Code do Quiz" 
              className="w-64 h-64"
            />
          </div>
          <h3 className="font-medium text-gray-900 mb-2">{quizTitle}</h3>
          <p className="text-sm text-gray-600 mb-4">
            Seus convidados podem escanear este QR Code para acessar o quiz
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
            <input
              type="text"
              value={quizUrl}
              readOnly
              className="flex-1 bg-transparent text-sm text-gray-600 outline-none"
            />
            <button
              onClick={handleCopyUrl}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleDownloadQR}
              className="flex-1 bg-gradient-to-r from-rose-500 to-purple-600 text-white py-3 rounded-lg hover:shadow-lg transition-shadow flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Baixar QR Code</span>
            </button>
            <button
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;