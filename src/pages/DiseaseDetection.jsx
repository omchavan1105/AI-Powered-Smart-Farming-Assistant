import React, { useState, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { diseaseService } from '../services/diseaseService';
import { UploadCloud, CheckCircle, AlertTriangle, Info, Trash2, RefreshCw, Shield, Loader2 } from 'lucide-react';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const MAX_SIZE_MB = 10;

const DiseaseDetection = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateFile = (file) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError(t('disease.errorFileType'));
      return false;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(t('disease.errorFileSize'));
      return false;
    }
    return true;
  };

  const handleFileSelect = (e) => {
    setError('');
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!validateFile(file)) return;
      setImage(URL.createObjectURL(file));
      setImageFile(file);
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!imageFile) return;
    setLoading(true);
    setError('');
    try {
      const res = await diseaseService.detectDisease(imageFile, user?.id, language);
      setResult(res);
    } catch (err) {
      setError(t('disease.errorAnalysis'));
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImageFile(null);
    setResult(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUploadAnother = () => {
    handleRemoveImage();
    // Trigger file picker
    setTimeout(() => fileInputRef.current?.click(), 100);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h1 style={{ color: '#166534', margin: '0 0 10px 0', fontFamily: 'Manrope, sans-serif' }}>{t('disease.title')}</h1>
        <p style={{ color: '#627168', margin: 0 }}>{t('disease.subtitle')}</p>
        <div style={{ marginTop: '10px' }}>
          <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
            {t('disease.demoMode')}
          </span>
        </div>
      </header>

      {/* Error Display */}
      {error && (
        <div style={{ color: '#991b1b', marginBottom: '20px', textAlign: 'center', fontSize: '14px', padding: '12px 15px', background: '#fef2f2', borderRadius: '10px', border: '1px solid #fecaca' }}>
          {error}
        </div>
      )}

      {/* Upload Area */}
      <div style={{ background: 'white', border: image ? '1px solid #e5eee7' : '2px dashed #b9d7c0', borderRadius: '20px', padding: '40px', textAlign: 'center', marginBottom: '30px' }}>
        {image ? (
          <div>
            <img src={image} alt="Crop" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '12px', marginBottom: '20px', objectFit: 'cover' }} />
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {!result && !loading && (
                <button onClick={handleAnalyze} className="primary-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={18} /> {t('disease.title')}
                </button>
              )}
              <button onClick={handleRemoveImage} className="secondary-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b91c1c', borderColor: '#fecaca' }}>
                <Trash2 size={16} /> {t('disease.removeImage')}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ color: '#15803d', marginBottom: '20px' }}><UploadCloud size={64} style={{ margin: 'auto' }}/></div>
            <input ref={fileInputRef} type="file" id="file-upload" style={{ display: 'none' }} accept="image/jpeg,image/png,image/webp" onChange={handleFileSelect} />
            <label htmlFor="file-upload" className="primary-btn" style={{ display: 'inline-block', cursor: 'pointer' }}>
              {t('disease.upload')}
            </label>
            <p style={{ color: '#9ca3af', fontSize: '13px', marginTop: '10px' }}>JPG, PNG, WEBP • Max {MAX_SIZE_MB}MB</p>
          </div>
        )}
        
        {loading && (
          <div style={{ color: '#15803d', fontWeight: 'bold', marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
            {t('disease.analyzing')}
          </div>
        )}
      </div>

      {/* Result Display */}
      {result && (
        <div style={{ background: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e5eee7' }}>
          {/* Demo Disclaimer */}
          <div style={{ background: '#fef3c7', border: '1px solid #fde68a', padding: '10px 16px', borderRadius: '10px', marginBottom: '20px', fontSize: '13px', color: '#92400e', textAlign: 'center' }}>
            ⚠️ {t('disease.demoDisclaimer')}
          </div>

          {/* Disease & Confidence Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '25px', borderBottom: '1px solid #f0f4f1', paddingBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <span style={{ color: '#627168', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase' }}>{t('disease.detected')}</span>
              <h2 style={{ margin: '5px 0 0 0', color: '#991b1b', fontSize: '28px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertTriangle size={24} /> {result.disease}
              </h2>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ color: '#627168', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase' }}>{t('disease.confidence')}</span>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#15803d', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <CheckCircle size={20} /> {result.confidence}%
              </div>
            </div>
          </div>
          
          {/* Severity Badge */}
          <div style={{ marginBottom: '20px' }}>
            <span style={{ color: '#627168', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase' }}>{t('disease.severity')}: </span>
            <span style={{ 
              background: result.severity === 'High' ? '#fef2f2' : result.severity === 'Moderate' ? '#fef3c7' : '#f0fdf4',
              color: result.severity === 'High' ? '#991b1b' : result.severity === 'Moderate' ? '#92400e' : '#166534',
              padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold'
            }}>
              {result.severity}
            </span>
          </div>

          {/* Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <h3 style={{ fontSize: '16px', color: '#17351f', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}><Info size={18} /> {t('disease.symptoms')}</h3>
              <ul style={{ paddingLeft: '20px', color: '#627168', lineHeight: 1.6, margin: 0 }}>
                {result.symptoms.map((sym, i) => <li key={i}>{sym}</li>)}
              </ul>
            </div>
            <div style={{ background: '#fef2f2', padding: '20px', borderRadius: '12px', border: '1px solid #fecaca' }}>
              <h3 style={{ fontSize: '16px', color: '#991b1b', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '8px' }}><Shield size={16} /> {t('disease.action')}</h3>
              <p style={{ margin: 0, color: '#b91c1c', lineHeight: 1.6 }}>{result.recommendedAction}</p>
            </div>
          </div>

          {/* Prevention */}
          {result.prevention && (
            <div style={{ marginTop: '20px', background: '#f0fdf4', padding: '20px', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
              <h3 style={{ fontSize: '16px', color: '#166534', margin: '0 0 10px 0' }}>{t('disease.prevention')}</h3>
              <p style={{ margin: 0, color: '#166534', lineHeight: 1.6 }}>{result.prevention}</p>
            </div>
          )}

          {/* Upload Another */}
          <div style={{ textAlign: 'center', marginTop: '25px' }}>
            <button onClick={handleUploadAnother} className="secondary-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <RefreshCw size={16} /> {t('disease.uploadAnother')}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          div[style*="gridTemplateColumns: '1fr 1fr'"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default DiseaseDetection;