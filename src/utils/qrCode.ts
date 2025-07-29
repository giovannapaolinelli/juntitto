// QR Code generation utility
export const generateQRCodeURL = (text: string, size: number = 200): string => {
  // Using QR Server API for QR code generation
  const baseURL = 'https://api.qrserver.com/v1/create-qr-code/';
  const params = new URLSearchParams({
    size: `${size}x${size}`,
    data: text,
    format: 'png',
    bgcolor: 'FFFFFF',
    color: '000000',
    qzone: '1',
    margin: '10'
  });
  
  return `${baseURL}?${params.toString()}`;
};

export const downloadQRCode = (url: string, filename: string = 'qr-code.png') => {
  const qrCodeURL = generateQRCodeURL(url);
  
  // Create a temporary link element and trigger download
  const link = document.createElement('a');
  link.href = qrCodeURL;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};