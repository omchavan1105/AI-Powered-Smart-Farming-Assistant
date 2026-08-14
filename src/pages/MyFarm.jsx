import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { cropService } from '../services/cropService';
import { Map, Sprout, MapPin, Edit3, Plus, Trash2, Loader2, Calendar } from 'lucide-react';

const MyFarm = () => {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [crops, setCrops] = useState([]);
  const [loadingCrops, setLoadingCrops] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCropName, setNewCropName] = useState('Tomato');
  const [newCropSeason, setNewCropSeason] = useState('Kharif');
  const [newSowingDate, setNewSowingDate] = useState('');
  const [submittingCrop, setSubmittingCrop] = useState(false);

  const fetchCrops = async () => {
    if (!user) return;
    setLoadingCrops(true);
    try {
      const data = await cropService.getFarmerCrops(user.id);
      setCrops(data || []);
    } catch (err) {
      console.error("Error fetching farmer crops:", err);
    } finally {
      setLoadingCrops(false);
    }
  };

  useEffect(() => {
    fetchCrops();
  }, [user]);

  const handleAddCrop = async (e) => {
    e.preventDefault();
    if (!newCropName.trim() || !user) return;

    setSubmittingCrop(true);
    try {
      const added = await cropService.addFarmerCrop({
        farmerId: user.id,
        cropName: newCropName,
        season: newCropSeason,
        sowingDate: newSowingDate || new Date().toISOString().split('T')[0],
        status: 'active'
      });

      setCrops(prev => [added, ...prev]);
      setShowAddForm(false);
      setNewSowingDate('');
    } catch (err) {
      console.error("Error adding crop:", err);
    } finally {
      setSubmittingCrop(false);
    }
  };

  const handleDeleteCrop = async (cropId) => {
    try {
      await cropService.deleteFarmerCrop(cropId);
      setCrops(prev => prev.filter(c => c.id !== cropId));
    } catch (err) {
      console.error("Error deleting crop:", err);
    }
  };

  if (!profile) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#166534' }}>
        {t('common.loading')}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
        <h1 style={{ color: '#166534', margin: 0, fontFamily: 'Manrope, sans-serif' }}>{t('sidebar.myFarm')}</h1>
        <button 
          onClick={() => navigate('/profile')} 
          className="secondary-btn" 
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Edit3 size={16} /> {t('profile.editProfile')}
        </button>
      </header>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '40px' }} className="farm-details-grid">
        {/* Farm Details Card */}
        <div style={{ background: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #e5eee7' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
            <div style={{ background: '#e7f5e9', padding: '12px', borderRadius: '12px', color: '#166534' }}>
              <Map size={28} />
            </div>
            <h2 style={{ margin: 0, color: '#17351f', fontSize: '20px' }}>{t('farm.overview')}</h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f4f1', paddingBottom: '10px' }}>
              <span style={{ color: '#627168' }}>{t('farm.farmSize')}</span>
              <strong style={{ color: '#17351f' }}>{profile.farm_size_acres ? `${profile.farm_size_acres} Acres` : 'N/A'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f4f1', paddingBottom: '10px' }}>
              <span style={{ color: '#627168' }}>{t('farm.soilType')}</span>
              <strong style={{ color: '#17351f' }}>{profile.soil_type || 'N/A'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f4f1', paddingBottom: '10px' }}>
              <span style={{ color: '#627168' }}>{t('farm.irrigation')}</span>
              <strong style={{ color: '#17351f' }}>{profile.irrigation_type || 'N/A'}</strong>
            </div>
          </div>
        </div>

        {/* Location Details Card */}
        <div style={{ background: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #e5eee7' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
            <div style={{ background: '#e0f2fe', padding: '12px', borderRadius: '12px', color: '#0369a1' }}>
              <MapPin size={28} />
            </div>
            <h2 style={{ margin: 0, color: '#17351f', fontSize: '20px' }}>{t('farm.location')}</h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f4f1', paddingBottom: '10px' }}>
              <span style={{ color: '#627168' }}>{t('farm.village')}</span>
              <strong style={{ color: '#17351f' }}>{profile.village || 'N/A'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f4f1', paddingBottom: '10px' }}>
              <span style={{ color: '#627168' }}>{t('farm.district')}</span>
              <strong style={{ color: '#17351f' }}>{profile.district || 'N/A'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f4f1', paddingBottom: '10px' }}>
              <span style={{ color: '#627168' }}>{t('farm.state')}</span>
              <strong style={{ color: '#17351f' }}>{profile.state || 'N/A'}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Active Crops Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <h2 style={{ color: '#166534', margin: 0, fontFamily: 'Manrope, sans-serif' }}>{t('farm.activeCrops')}</h2>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="primary-btn"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '9px 16px' }}
        >
          <Plus size={16} /> Add Crop
        </button>
      </div>

      {/* Add Crop Inline Form */}
      {showAddForm && (
        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #bbf7d0', marginBottom: '25px', boxShadow: '0 4px 15px rgba(22,101,52,0.06)' }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#166534', fontSize: '17px' }}>Add New Crop to Field</h3>
          <form onSubmit={handleAddCrop} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: '#506158', fontSize: '13px', fontWeight: '500' }}>Crop Name</label>
              <select value={newCropName} onChange={e => setNewCropName(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d8e5da', outline: 'none', background: 'white' }}>
                <option value="Tomato">Tomato</option>
                <option value="Onion">Onion</option>
                <option value="Soybean">Soybean</option>
                <option value="Cotton">Cotton</option>
                <option value="Wheat">Wheat</option>
                <option value="Gram">Gram</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: '#506158', fontSize: '13px', fontWeight: '500' }}>Season</label>
              <select value={newCropSeason} onChange={e => setNewCropSeason(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d8e5da', outline: 'none', background: 'white' }}>
                <option value="Kharif">Kharif</option>
                <option value="Rabi">Rabi</option>
                <option value="Zaid">Zaid</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: '#506158', fontSize: '13px', fontWeight: '500' }}>Sowing Date</label>
              <input type="date" value={newSowingDate} onChange={e => setNewSowingDate(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d8e5da', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="primary-btn" disabled={submittingCrop} style={{ flex: 1, padding: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
                {submittingCrop && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
                Save Crop
              </button>
              <button type="button" onClick={() => setShowAddForm(false)} className="secondary-btn" style={{ padding: '10px 14px' }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Crops List */}
      {loadingCrops ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '120px', gap: '8px', color: '#166534' }}>
          <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
          {t('common.loading')}
        </div>
      ) : crops.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {crops.map((crop) => (
            <div key={crop.id} style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #e5eee7', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{ background: '#e7f5e9', padding: '14px', borderRadius: '12px', color: '#166534' }}>
                  <Sprout size={28} />
                </div>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', color: '#17351f', fontSize: '18px' }}>{crop.crop_name}</h3>
                  <p style={{ margin: '0 0 8px 0', color: '#627168', fontSize: '13px' }}>
                    {crop.season} Season {crop.sowing_date ? `• Sown: ${crop.sowing_date}` : ''}
                  </p>
                  <span style={{ background: '#dcfce7', color: '#166534', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>
                    {crop.status || 'Active'}
                  </span>
                </div>
              </div>

              <button 
                onClick={() => handleDeleteCrop(crop.id)} 
                title="Remove crop"
                style={{ background: '#fef2f2', border: 'none', color: '#b91c1c', borderRadius: '8px', padding: '8px', cursor: 'pointer' }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ background: 'white', padding: '40px 20px', borderRadius: '16px', border: '1px dashed #d8e5da', textAlign: 'center' }}>
          <Sprout size={44} style={{ color: '#9ca3af', marginBottom: '10px' }} />
          <h3 style={{ margin: '0 0 5px 0', color: '#506158', fontSize: '17px' }}>{t('dashboard.noCrop')}</h3>
          <p style={{ margin: '0 0 15px 0', color: '#718278', fontSize: '14px' }}>Add crops you are currently growing to get customized farm insights.</p>
          <button onClick={() => setShowAddForm(true)} className="primary-btn" style={{ fontSize: '13px', padding: '8px 16px' }}>
            <Plus size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> Add Your First Crop
          </button>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .farm-details-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default MyFarm;