import React, { useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import QRCode from 'qrcode';

const backendUrl = import.meta.env.VITE_API_URL || 'URL_BACKEND_NON_TROUVEE';
const schoolName = import.meta.env.VITE_SCHOOL_NAME || 'École non définie';
const eleveUsername = import.meta.env.VITE_ELEVE_USERNAME;
const elevePassword = import.meta.env.VITE_ELEVE_PASSWORD;
const enseignantUsername = import.meta.env.VITE_ENSEIGNANT_USERNAME;
const enseignantPassword = import.meta.env.VITE_ENSEIGNANT_PASSWORD;

const qrDataEleve = JSON.stringify({
  backend: backendUrl,
  schoolName: schoolName,
  username: eleveUsername,
  password: elevePassword
});

const qrDataEnseignant = JSON.stringify({
  backend: backendUrl,
  schoolName: schoolName,
  username: enseignantUsername,
  password: enseignantPassword
});

console.log('Données QR code élève:', qrDataEleve);
console.log('Données QR code enseignant:', qrDataEnseignant);

const QRCodePage = () => {
  const { t } = useTranslation();
  const qrRefEleve = useRef(null);
  const qrRefEnseignant = useRef(null);
  const [qrReadyEleve, setQrReadyEleve] = useState(false);
  const [qrCanvasEleve, setQrCanvasEleve] = useState(null);
  const [qrReadyEnseignant, setQrReadyEnseignant] = useState(false);
  const [qrCanvasEnseignant, setQrCanvasEnseignant] = useState(null);

  // Générer les QR codes directement
  useEffect(() => {
    const generateQRCodes = async () => {
      try {
        // QR code pour les élèves
        const canvasEleve = document.createElement('canvas');
        const size = 256;
        
        canvasEleve.width = size;
        canvasEleve.height = size;
        
        await QRCode.toCanvas(canvasEleve, qrDataEleve, {
          width: size,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        
        setQrCanvasEleve(canvasEleve);
        setQrReadyEleve(true);
        console.log('QR code élève généré avec succès');
        
        // QR code pour les enseignants
        const canvasEnseignant = document.createElement('canvas');
        
        canvasEnseignant.width = size;
        canvasEnseignant.height = size;
        
        await QRCode.toCanvas(canvasEnseignant, qrDataEnseignant, {
          width: size,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        
        setQrCanvasEnseignant(canvasEnseignant);
        setQrReadyEnseignant(true);
        console.log('QR code enseignant généré avec succès');
      } catch (error) {
        console.error('Erreur lors de la génération des QR codes:', error);
      }
    };
    
    generateQRCodes();
  }, []);

  const copyQRCodeToClipboard = async (type) => {
    const isEleve = type === 'eleve';
    const qrReady = isEleve ? qrReadyEleve : qrReadyEnseignant;
    const qrCanvas = isEleve ? qrCanvasEleve : qrCanvasEnseignant;
    
    if (!qrReady || !qrCanvas) {
      alert(t('qr.notReady') || 'Le QR code n\'est pas encore prêt');
      return;
    }

    try {
      // Créer un canvas optimisé pour la copie
      const copyCanvas = document.createElement('canvas');
      const ctx = copyCanvas.getContext('2d');
      
      const size = 400;
      const margin = 40;
      const qrSize = size - (2 * margin);
      
      copyCanvas.width = size;
      copyCanvas.height = size;
      
      // Fond blanc
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, size, size);
      
      // Bordure noire fine
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, size - 2, size - 2);
      
      // Dessiner le QR code au centre
      const scale = qrSize / qrCanvas.width;
      ctx.save();
      ctx.translate(margin, margin);
      ctx.scale(scale, scale);
      ctx.drawImage(qrCanvas, 0, 0);
      ctx.restore();
      
      // Copier dans le presse-papiers
      copyCanvas.toBlob(async (blob) => {
        try {
          // Essayer la méthode moderne
          const item = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
          alert(t('qr.copied') || 'QR code copié dans le presse-papiers !');
        } catch (clipboardError) {
          // Fallback: téléchargement si la copie échoue
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `qr-code-${type}-copie.png`;
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          alert(t('qr.downloaded') || 'QR code téléchargé. Vous pouvez maintenant l\'insérer dans LibreOffice via Insertion > Image > À partir d\'un fichier.');
        }
      }, 'image/png', 1.0);
    } catch (error) {
      console.error('Erreur lors de la copie du QR code:', error);
      alert(t('qr.copyError') || 'Erreur lors de la copie du QR code: ' + error.message);
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: 40 }}>
      <h2 style={{ marginBottom: 32 }}>{t('qr.title')}</h2>
      
      {/* Container pour les QR codes en ligne */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'row', 
        justifyContent: 'center', 
        alignItems: 'flex-start',
        gap: '40px',
        flexWrap: 'wrap',
        maxWidth: '100%',
        marginBottom: 20
      }}>
        
        {/* QR Code Élève */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          minWidth: '280px',
          maxWidth: '320px'
        }}>
          <h3 style={{ marginBottom: 16, color: '#007bff' }}>{t('qr.eleveTitle') || 'QR Code Élève'}</h3>
          <div ref={qrRefEleve}>
            {qrReadyEleve && qrCanvasEleve && (
              <canvas
                ref={(canvas) => {
                  if (canvas) {
                    const ctx = canvas.getContext('2d');
                    canvas.width = qrCanvasEleve.width;
                    canvas.height = qrCanvasEleve.height;
                    ctx.drawImage(qrCanvasEleve, 0, 0);
                  }
                }}
                style={{ border: '1px solid #ccc', marginBottom: 10 }}
              />
            )}
          </div>
          <button 
            onClick={() => copyQRCodeToClipboard('eleve')}
            disabled={!qrReadyEleve}
            style={{
              padding: '12px 24px',
              backgroundColor: qrReadyEleve ? '#007bff' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: qrReadyEleve ? 'pointer' : 'not-allowed',
              fontSize: '16px',
              fontWeight: 'bold',
              width: '100%',
              maxWidth: '200px'
            }}
            onMouseOver={(e) => {
              if (qrReadyEleve) e.target.style.backgroundColor = '#0056b3';
            }}
            onMouseOut={(e) => {
              if (qrReadyEleve) e.target.style.backgroundColor = '#007bff';
            }}
          >
            {t('qr.copyEleveButton') || 'Copier QR Code Élève'}
          </button>
        </div>

        {/* QR Code Enseignant */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          minWidth: '280px',
          maxWidth: '320px'
        }}>
          <h3 style={{ marginBottom: 16, color: '#28a745' }}>{t('qr.enseignantTitle') || 'QR Code Enseignant'}</h3>
          <div ref={qrRefEnseignant}>
            {qrReadyEnseignant && qrCanvasEnseignant && (
              <canvas
                ref={(canvas) => {
                  if (canvas) {
                    const ctx = canvas.getContext('2d');
                    canvas.width = qrCanvasEnseignant.width;
                    canvas.height = qrCanvasEnseignant.height;
                    ctx.drawImage(qrCanvasEnseignant, 0, 0);
                  }
                }}
                style={{ border: '1px solid #ccc', marginBottom: 10 }}
              />
            )}
          </div>
          <button 
            onClick={() => copyQRCodeToClipboard('enseignant')}
            disabled={!qrReadyEnseignant}
            style={{
              padding: '12px 24px',
              backgroundColor: qrReadyEnseignant ? '#28a745' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: qrReadyEnseignant ? 'pointer' : 'not-allowed',
              fontSize: '16px',
              fontWeight: 'bold',
              width: '100%',
              maxWidth: '200px'
            }}
            onMouseOver={(e) => {
              if (qrReadyEnseignant) e.target.style.backgroundColor = '#218838';
            }}
            onMouseOut={(e) => {
              if (qrReadyEnseignant) e.target.style.backgroundColor = '#28a745';
            }}
          >
            {t('qr.copyEnseignantButton') || 'Copier QR Code Enseignant'}
          </button>
        </div>
      </div>

      {/* Message d'attente */}
      <div style={{ marginTop: 10, fontSize: 12, color: '#666' }}>
        {(!qrReadyEleve || !qrReadyEnseignant) && (t('qr.waitMessage') || 'Veuillez attendre que les QR codes soient générés')}
      </div>
    </div>
  );
};

export default QRCodePage; 