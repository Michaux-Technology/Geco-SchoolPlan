import React from 'react';
import QRCode from 'react-qr-code';

const backendUrl = import.meta.env.VITE_API_URL || 'URL_BACKEND_NON_TROUVEE';
const eleveUsername = 'eleve';
const elevePassword = '1234';

const qrData = JSON.stringify({
  backend: backendUrl,
  username: eleveUsername,
  password: elevePassword
});

const QRCodePage = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: 40 }}>
      <h2 style={{ marginBottom: 32 }}>QR Code Connexion Élève</h2>
      <QRCode value={qrData} size={256} />
      <div style={{ marginTop: 24 }}>
        <strong>Backend :</strong> {backendUrl}<br />
        <strong>Utilisateur :</strong> {eleveUsername}<br />
        <strong>Mot de passe :</strong> {elevePassword}
      </div>
      <div style={{ marginTop: 16, fontSize: 12, color: '#888' }}>
        (Le QR code encode ces informations au format JSON)
      </div>
    </div>
  );
};

export default QRCodePage; 