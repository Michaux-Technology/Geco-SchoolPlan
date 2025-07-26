import React from 'react';
import QRCode from 'react-qr-code';
import { useTranslation } from 'react-i18next';

const backendUrl = import.meta.env.VITE_API_URL || 'URL_BACKEND_NON_TROUVEE';
const schoolName = import.meta.env.VITE_SCHOOL_NAME || 'École non définie';
const eleveUsername = 'eleve';
const elevePassword = '1234';

const qrData = JSON.stringify({
  backend: backendUrl,
  schoolName: schoolName,
  username: eleveUsername,
  password: elevePassword
});

const QRCodePage = () => {
  const { t } = useTranslation();
  return (
    <div style={{ textAlign: 'center', marginTop: 40 }}>
      <h2 style={{ marginBottom: 32 }}>{t('qr.title')}</h2>
      <QRCode value={qrData} size={256} />
      <div style={{ marginTop: 24 }}>
        <strong>{t('qr.schoolName')} :</strong> {schoolName}<br />
        <strong>{t('qr.backend')} :</strong> {backendUrl}<br />
        <strong>{t('qr.username')} :</strong> {eleveUsername}<br />
        <strong>{t('qr.password')} :</strong> {elevePassword}
      </div>
      <div style={{ marginTop: 16, fontSize: 12, color: '#888' }}>
        {t('qr.jsonInfo')}
      </div>
    </div>
  );
};

export default QRCodePage; 