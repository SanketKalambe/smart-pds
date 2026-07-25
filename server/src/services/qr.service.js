const QRCode = require('qrcode');

/**
 * Generate QR Code data URL for receipts & digital verification
 */
const generateReceiptQR = async (receiptData) => {
  try {
    const payloadString = JSON.stringify({
      txId: receiptData.transactionId,
      rationCardNo: receiptData.rationCardNo,
      amount: receiptData.totalAmount,
      date: receiptData.timestamp,
      verificationHash: receiptData.verificationHash || 'VERIFIED_SMART_PDS'
    });

    const qrDataUrl = await QRCode.toDataURL(payloadString, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    });

    return qrDataUrl;
  } catch (err) {
    console.error('Error generating QR code:', err.message);
    return null;
  }
};

module.exports = {
  generateReceiptQR
};
