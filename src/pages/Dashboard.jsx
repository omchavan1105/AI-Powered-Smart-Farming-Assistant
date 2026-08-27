import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { weatherService } from '../services/weatherService';
import { cropService } from '../services/cropService';
import { soilService } from '../services/soilService';
import { marketService } from '../services/marketService';
import { diseaseService } from '../services/diseaseService';
import { alertService } from '../services/alertService';
import { generateDailyFarmCopilot } from '../services/farmCopilotEngine';
import { calculateFarmHealthScore } from '../services/farmHealthScoreEngine';
import { generate7DayActionPlan } from '../services/actionPlanEngine';

import { StatTile, SectionHeading, DataBadge } from '../components/ui';
import FarmCopilotCard from '../components/FarmCopilotCard';
import FarmHealthScoreCard from '../components/FarmHealthScoreCard';
import ActionPlan7Day from '../components/ActionPlan7Day';

import { CloudSun, Sprout, Droplets, TrendingUp, ScanSearch, TestTube, Bot, MapPin, ArrowRight, ShieldCheck } from 'lucide-react';

const Dashboard = () => {
  const { t, language } = useLanguage();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [crops, setCrops] = useState([]);
  const [soil, setSoil] = useState(null);
  const [marketPrice, setMarketPrice] = useState(null);
  const [recentDisease, setRecentDisease] = useState(null);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      setWeatherLoading(true);
      try {
        const location = profile?.village || profile?.district || 'Pune';
        const [weatherData, forecastData] = await Promise.all([
          weatherService.getCurrentWeather(location),
          weatherService.getForecast(location)
        ]);
        setWeather(weatherData);
        setForecast(forecastData || []);

        if (user) {
          // Fetch farmer crops
          const userCrops = await cropService.getFarmerCrops(user.id);
          setCrops(userCrops || []);

          // Fetch latest soil record
          const latestSoil = await soilService.getLatestSoilRecord(user.id);
          setSoil(latestSoil);

          // Fetch latest disease diagnosis record
          const diseaseHistory = await diseaseService.getDiseaseHistory(user.id);
          if (diseaseHistory && diseaseHistory.length > 0) {
            const latest = diseaseHistory[0];
            setRecentDisease({
              disease: latest.detected_disease,
              confidence: latest.confidence_score,
              severity: latest.severity,
              recommendedAction: latest.recommended_action
            });
          }

          // Fetch alerts
          const userAlerts = await alertService.getFarmerAlerts(user.id);
          setAlerts(userAlerts || []);

          // Fetch market prices for active crop
          const cropName = (userCrops && userCrops.length > 0) ? userCrops[0].crop_name : (profile?.current_crop || 'Tomato');
          const prices = await marketService.getMarketPrices(cropName);
          if (prices && prices.length > 0) {
            setMarketPrice(prices[0]);
          }
        }
      } catch (err) {
        console.error('Dashboard data load error:', err);
      } finally {
        setWeatherLoading(false);
      }
    };
    loadDashboardData();
  }, [user, profile]);

  const activeCropName = (crops && crops.length > 0) ? crops[0].crop_name : profile?.current_crop;
  const activeCropSeason = (crops && crops.length > 0) ? `${crops[0].season || 'Active'} Season` : profile?.crop_stage;

  // Synthesize Copilot guidance from real data
  const copilotData = generateDailyFarmCopilot({
    profile,
    crops,
    soilRecord: soil,
    weatherData: weather,
    recentDisease,
    alerts
  });

  // Calculate transparent Farm Health Score
  const healthScoreData = calculateFarmHealthScore({
    soilRecord: soil,
    recentDisease,
    weatherData: weather,
    crops
  });

  // Generate 7-Day Action Plan
  const actionPlan = generate7DayActionPlan({
    cropName: activeCropName || 'Crop',
    weatherForecast: forecast,
    soilRecord: soil,
    recentDisease
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '12px' }}>
        <SectionHeading
          title={<>{t('dashboard.welcome')}, {profile?.full_name || 'Farmer'} 👋</>}
          subtitle={
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <MapPin size={16} /> {profile?.village || '—'}, {profile?.district || '—'}
              {weather && (
                <span style={{ marginLeft: '6px' }}>
                  <DataBadge type={weather.isDemo ? 'sample' : 'live'} customLabel={weather.isDemo ? 'Sample Weather' : 'Live Weather'} />
                </span>
              )}
            </span>
          }
          style={{ marginBottom: 0 }}
        />
      </header>

      {/* 1. Daily Farm Copilot — Top Hero Action */}
      <FarmCopilotCard
        copilotData={copilotData}
        onNavigate={navigate}
        language={language}
      />

      {/* 2. Overview Telemetry Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        {/* Crop Card */}
        <StatTile
          icon={<Sprout size={24} />}
          iconBg="#e7f5e9"
          iconColor="#166534"
          label={t('dashboard.myCrop')}
          value={activeCropName || t('dashboard.noCrop')}
          subtitle={activeCropName ? (activeCropSeason || 'Active') : t('dashboard.setupCrop')}
          subtitleColor={activeCropName ? '#166534' : '#9ca3af'}
          onClick={() => navigate('/my-farm')}
        />

        {/* Weather Card */}
        <StatTile
          icon={<CloudSun size={24} />}
          iconBg="#e0f2fe"
          iconColor="#0369a1"
          label={t('dashboard.weather')}
          value={weather ? `${weather.temp}°C` : null}
          subtitle={weather?.condition ? `${weather.condition} • ${weather.rainProb}% Rain` : ''}
          subtitleColor="#0369a1"
          isLoading={weatherLoading}
          isUnavailable={!weatherLoading && !weather}
          unavailableText={t('dashboard.dataUnavailable')}
          onClick={() => navigate('/weather')}
        />

        {/* Soil Health Card */}
        <StatTile
          icon={<Droplets size={24} />}
          iconBg="#fdf4ff"
          iconColor="#86198f"
          label={t('dashboard.soilHealth')}
          value={soil ? `pH ${soil.ph_level}` : null}
          subtitle={soil ? `Moisture: ${soil.moisture_level}%` : 'Tap to log soil test'}
          subtitleColor={soil ? '#86198f' : '#9ca3af'}
          isUnavailable={!soil}
          unavailableText="No soil test logged"
          onClick={() => navigate('/soil-analysis')}
        />

        {/* Mandi Price Card */}
        <StatTile
          icon={<TrendingUp size={24} />}
          iconBg="#fffbeb"
          iconColor="#b45309"
          label={t('dashboard.mandiPrice')}
          value={marketPrice ? `₹${marketPrice.currentPrice}/Q` : null}
          subtitle={marketPrice ? `${marketPrice.market} (${marketPrice.crop})` : null}
          subtitleColor="#b45309"
          isUnavailable={!marketPrice}
          unavailableText={t('dashboard.dataUnavailable')}
          onClick={() => navigate('/market-prices')}
        />
      </div>

      {/* 3. Transparent Farm Health Score */}
      <FarmHealthScoreCard
        healthScoreData={healthScoreData}
        loading={weatherLoading}
      />

      {/* 4. 7-Day Farm Action Plan */}
      <ActionPlan7Day plan={actionPlan} />

      {/* 5. Quick Farmer Action Shortcuts */}
      <div style={{ marginTop: '30px' }}>
        <h3 style={{ margin: '0 0 14px 0', fontSize: '18px', color: '#166534', fontFamily: "'Manrope', sans-serif" }}>
          Quick Farmer Tools
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <button
            onClick={() => navigate('/disease-detection')}
            className="secondary-btn"
            style={{
              padding: '16px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              textAlign: 'left',
              background: 'white',
              border: '1px solid #e5eee7',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ background: '#e7f5e9', color: '#166534', padding: '8px', borderRadius: '8px' }}>
                <ScanSearch size={20} />
              </div>
              <span style={{ fontWeight: 600, color: '#17351f', fontSize: '14px' }}>Scan Leaf Health</span>
            </div>
            <ArrowRight size={16} color="#627168" />
          </button>

          <button
            onClick={() => navigate('/soil-analysis')}
            className="secondary-btn"
            style={{
              padding: '16px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              textAlign: 'left',
              background: 'white',
              border: '1px solid #e5eee7',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ background: '#fdf4ff', color: '#86198f', padding: '8px', borderRadius: '8px' }}>
                <TestTube size={20} />
              </div>
              <span style={{ fontWeight: 600, color: '#17351f', fontSize: '14px' }}>Log Soil Test</span>
            </div>
            <ArrowRight size={16} color="#627168" />
          </button>

          <button
            onClick={() => navigate('/farmai')}
            className="secondary-btn"
            style={{
              padding: '16px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              textAlign: 'left',
              background: 'white',
              border: '1px solid #e5eee7',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ background: '#e0f2fe', color: '#0369a1', padding: '8px', borderRadius: '8px' }}>
                <Bot size={20} />
              </div>
              <span style={{ fontWeight: 600, color: '#17351f', fontSize: '14px' }}>Ask FarmAI</span>
            </div>
            <ArrowRight size={16} color="#627168" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
