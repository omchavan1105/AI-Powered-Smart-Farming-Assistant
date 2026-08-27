import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { diseaseService } from '../services/diseaseService';
import { whatsappService } from '../services/whatsappService';
import { weatherService } from '../services/weatherService';
import { marketService } from '../services/marketService';
import { enrichMarketItem } from '../services/marketAnalytics';
import { generateFusionAdvisory } from '../services/fusionAdvisoryEngine';
import FusionAdvisoryCard from '../components/FusionAdvisoryCard';
import DiseaseProgressTracker from '../components/DiseaseProgressTracker';
import { Card, Badge, SectionHeading, DataBadge } from '../components/ui';
import { UploadCloud, CheckCircle, AlertTriangle, Info, Trash2, RefreshCw, Shield, Loader2, History, AlertCircle, Share2, Activity } from 'lucide-react';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const MAX_SIZE_MB = 10;

const DiseaseDetection = () => {
  const { t, language } = useLanguage();
  const { user, profile } = useAuth();
  const fileInputRef = useRef(null);
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isAiOnline, setIsAiOnline] = useState(null);
  const [fusionAdvisory, setFusionAdvisory] = useState(null);

  useEffect(() => {
    // Ping backend AI microservice health on mount
    diseaseService.checkHealth().then(status => {
      setIsAiOnline(status.isOnline && status.model_loaded);
    }).catch(() => setIsAiOnline(false));
  }, []);

  useEffect(() => {
    if (user) {
      diseaseService.getDiseaseHistory(user.id).then(data => setHistory(data || [])).catch(() => {});
    }
  }, [user, result]);

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
      if (res) setIsAiOnline(res.isRealAI);

      // Generate Fusion Advisory after successful detection
      if (res && res.isRealAI) {
        try {
          const location = profile?.village || profile?.district || 'Pune';
          const [forecast, currentWeather] = await Promise.all([
            weatherService.getForecast(location),
            weatherService.getCurrentWeather(location)
          ]);

          // Build a basic market trend object for the detected crop
          let marketTrend = null;
          try {
            const prices = await marketService.getMarketPrices(res.crop || 'Tomato');
            if (prices && prices.length > 0) {
              marketTrend = enrichMarketItem(prices[0]);
            }
          } catch { /* market data optional — skip silently */ }

          const weatherData = forecast && forecast.length > 0 ? forecast : currentWeather;
          const advisory = generateFusionAdvisory(res, weatherData, marketTrend);
          setFusionAdvisory(advisory);
        } catch {
          // Fusion advisory is supplementary — don't block on failure
          setFusionAdvisory(null);
        }
      } else {
        // For offline/demo results, still generate advisory with limited data
        const advisory = generateFusionAdvisory(res, null, null);
        setFusionAdvisory(advisory);
      }
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
    setFusionAdvisory(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUploadAnother = () => {
    handleRemoveImage();
    setTimeout(() => fileInputRef.current?.click(), 100);
  };

  const isReal = result ? result.isRealAI : (isAiOnline !== false);

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      <header style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <SectionHeading
          title={t('disease.title')}
          subtitle={t('disease.subtitle')}
          style={{ marginBottom: 0 }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isAiOnline === false || (result && !result.isRealAI) ? (
            <Badge variant="warning" small icon={<Info size={12} />}>
              Offline / Demo Mode
            </Badge>
          ) : (
            <Badge variant="success" small icon={<CheckCircle size={12} />}>
              PlantVillage Real AI (95.1% Acc)
            </Badge>
          )}
          {history.length > 0 && (
            <button 
              onClick={() => setShowHistory(!showHistory)} 
              className="secondary-btn" 
              style={{ padding: '6px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <History size={14} /> History ({history.length})
            </button>
          )}
        </div>
      </header>

      {/* Longitudinal Disease Progress Tracker */}
      {showHistory && (
        <div style={{ marginBottom: '25px' }}>
          <DiseaseProgressTracker history={history} />
        </div>
      )}

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
            <img src={image} alt="Crop Leaf" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '12px', marginBottom: '20px', objectFit: 'cover' }} />
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {!result && !loading && (
                <button onClick={handleAnalyze} className="primary-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={18} /> Analyze Leaf Health
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
        <Card white style={{ padding: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          {/* Offline Fallback Banner if applicable */}
          {!result.isRealAI && (
            <div style={{ background: '#fef3c7', border: '1px solid #fde68a', padding: '12px 18px', borderRadius: '12px', marginBottom: '20px', fontSize: '13px', color: '#92400e', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <AlertTriangle size={18} />
              <span>AI microservice is currently offline or unreachable. Please start the Python FastAPI service at <code>localhost:8000</code>.</span>
            </div>
          )}

          {/* Uncertainty Warning */}
          {result.isUncertain && result.isRealAI && (
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '14px 18px', borderRadius: '12px', marginBottom: '20px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <AlertCircle size={22} style={{ color: '#d97706', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ color: '#92400e', display: 'block', fontSize: '15px' }}>Inconclusive Leaf Diagnosis ({result.confidence}%)</strong>
                <p style={{ color: '#b45309', margin: '4px 0 0 0', fontSize: '13px', lineHeight: 1.5 }}>
                  The leaf image confidence fell below our 60% precision threshold. Please capture a clear, well-focused close-up photograph of individual leaf spots in direct daylight.
                </p>
              </div>
            </div>
          )}

          {/* Disease & Confidence Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '25px', borderBottom: '1px solid #f0f4f1', paddingBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <span style={{ color: '#627168', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase' }}>{t('disease.detected')}</span>
              <h2 style={{ margin: '5px 0 0 0', color: result.disease === 'Healthy Plant' ? '#15803d' : '#991b1b', fontSize: '28px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                {result.disease === 'Healthy Plant' ? <CheckCircle size={26} style={{ color: '#15803d' }} /> : <AlertTriangle size={24} />} 
                {result.disease}
              </h2>
              {result.crop && <span style={{ fontSize: '13px', color: '#627168' }}>Crop Host: <strong>{result.crop}</strong></span>}
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ color: '#627168', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase' }}>{t('disease.confidence')}</span>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: result.confidence >= 80 ? '#15803d' : '#d97706', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <CheckCircle size={20} /> {result.confidence}%
              </div>
            </div>
          </div>
          
          {/* Severity Badge */}
          <div style={{ marginBottom: '20px' }}>
            <span style={{ color: '#627168', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase' }}>{t('disease.severity')}: </span>
            <Badge
              variant={result.severity === 'High' ? 'danger' : result.severity === 'Moderate' ? 'warning' : 'success'}
            >
              {result.severity}
            </Badge>
          </div>

          {/* Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <h3 style={{ fontSize: '16px', color: '#17351f', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}><Info size={18} /> {t('disease.symptoms')}</h3>
              <ul style={{ paddingLeft: '20px', color: '#627168', lineHeight: 1.6, margin: 0 }}>
                {result.symptoms.map((sym, i) => <li key={i}>{sym}</li>)}
              </ul>
            </div>
            <div style={{ background: result.disease === 'Healthy Plant' ? '#f0fdf4' : '#fef2f2', padding: '20px', borderRadius: '12px', border: `1px solid ${result.disease === 'Healthy Plant' ? '#bbf7d0' : '#fecaca'}` }}>
              <h3 style={{ fontSize: '16px', color: result.disease === 'Healthy Plant' ? '#166534' : '#991b1b', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '8px' }}><Shield size={16} /> {t('disease.action')}</h3>
              <p style={{ margin: 0, color: result.disease === 'Healthy Plant' ? '#15803d' : '#b91c1c', lineHeight: 1.6 }}>{result.recommendedAction}</p>
            </div>
          </div>

          {/* Prevention */}
          {result.prevention && (
            <div style={{ marginTop: '20px', background: '#f0fdf4', padding: '20px', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
              <h3 style={{ fontSize: '16px', color: '#166534', margin: '0 0 10px 0' }}>{t('disease.prevention')}</h3>
              <p style={{ margin: 0, color: '#166534', lineHeight: 1.6 }}>{result.prevention}</p>
            </div>
          )}

          {/* Actions (WhatsApp Share + Upload Another) */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '25px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => {
                const msg = whatsappService.formatDiseaseShareMessage(result, language);
                whatsappService.shareToWhatsApp(msg);
              }}
              style={{
                backgroundColor: '#25D366',
                color: '#ffffff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                boxShadow: '0 2px 6px rgba(37, 211, 102, 0.3)'
              }}
            >
              <Share2 size={16} /> 
              {language === 'mr' ? 'व्हाट्सअ‍ॅपवर शेअर करा' : language === 'hi' ? 'व्हाट्सएप पर शेयर करें' : 'Share via WhatsApp'}
            </button>
            <button onClick={handleUploadAnother} className="secondary-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <RefreshCw size={16} /> {t('disease.uploadAnother')}
            </button>
          </div>
        </Card>
      )}

      {/* Fusion Advisory Card — appears after disease result */}
      {result && fusionAdvisory && (
        <FusionAdvisoryCard
          advisory={fusionAdvisory}
          diseaseResult={result}
          language={language}
        />
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