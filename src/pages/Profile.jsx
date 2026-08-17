import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { User, LogOut, Edit3, Save, X, Loader2 } from 'lucide-react';

const Profile = () => {
  const { t } = useLanguage();
  const { user, profile, logout, fetchProfile } = useAuth();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Edit form state
  const [editData, setEditData] = useState({});

  const startEdit = () => {
    setEditData({
      full_name: profile?.full_name || '',
      village: profile?.village || '',
      district: profile?.district || '',
      state: profile?.state || '',
      farm_size_acres: profile?.farm_size_acres || '',
      soil_type: profile?.soil_type || ''
    });
    setEditing(true);
    setError('');
    setSuccess('');
  };

  const cancelEdit = () => {
    setEditing(false);
    setError('');
    setSuccess('');
  };

  const handleSave = async () => {
    if (!editData.full_name?.trim()) { setError(t('auth.errorNameRequired')); return; }
    if (!editData.village?.trim()) { setError(t('profile.village') + ' is required'); return; }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const { error: dbError } = await supabase
        .from('farmer_profiles')
        .update({
          full_name: editData.full_name,
          village: editData.village,
          district: editData.district,
          state: editData.state,
          farm_size_acres: parseFloat(editData.farm_size_acres) || null,
          soil_type: editData.soil_type,
        })
        .eq('id', user.id);

      if (dbError) throw dbError;

      await fetchProfile(user.id);
      setEditing(false);
      setSuccess(t('profile.updateSuccess'));
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(t('profile.updateError'));
    } finally {
      setSaving(false);
    }
  };

  const Field = ({ label, value, field }) => {
    if (editing) {
      return (
        <div>
          <label style={{ display: 'block', color: '#627168', fontSize: '13px', marginBottom: '5px', fontWeight: '500' }}>{label}</label>
          {field === 'soil_type' ? (
            <select 
              value={editData[field] || ''} 
              onChange={e => setEditData(prev => ({ ...prev, [field]: e.target.value }))}
              style={{ width: '100%', padding: '12px', background: 'white', borderRadius: '8px', border: '1px solid #d8e5da', fontSize: '14px', outline: 'none' }}
            >
              <option value="">{t('profile.selectSoil')}</option>
              <option value="Black Soil">Black Soil</option>
              <option value="Red Soil">Red Soil</option>
              <option value="Alluvial Soil">Alluvial Soil</option>
              <option value="Laterite Soil">Laterite Soil</option>
              <option value="Sandy Soil">Sandy Soil</option>
              <option value="Clay Soil">Clay Soil</option>
            </select>
          ) : (
            <input
              type={field === 'farm_size_acres' ? 'number' : 'text'}
              step={field === 'farm_size_acres' ? '0.01' : undefined}
              value={editData[field] || ''}
              onChange={e => setEditData(prev => ({ ...prev, [field]: e.target.value }))}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d8e5da', fontSize: '14px', outline: 'none' }}
            />
          )}
        </div>
      );
    }
    return (
      <div>
        <label style={{ display: 'block', color: '#627168', fontSize: '13px', marginBottom: '5px', fontWeight: '500' }}>{label}</label>
        <div style={{ padding: '12px', background: '#f8fcf8', borderRadius: '8px', border: '1px solid #e5eee7', color: '#17351f', fontSize: '14px' }}>
          {value || 'N/A'}
        </div>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <h1 style={{ color: '#166534', margin: 0, fontFamily: 'Manrope, sans-serif' }}>{t('sidebar.profile')}</h1>
        <button onClick={logout} className="secondary-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b91c1c', borderColor: '#fecaca', background: '#fef2f2' }}>
          <LogOut size={16} /> {t('auth.signOut')}
        </button>
      </header>

      {success && (
        <div style={{ color: '#166534', marginBottom: '20px', fontSize: '14px', padding: '12px 15px', background: '#f0fdf4', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
          {success}
        </div>
      )}
      {error && (
        <div style={{ color: '#991b1b', marginBottom: '20px', fontSize: '14px', padding: '12px 15px', background: '#fef2f2', borderRadius: '10px', border: '1px solid #fecaca' }}>
          {error}
        </div>
      )}

      <div style={{ background: 'white', padding: '30px', borderRadius: '16px', border: '1px solid #e5eee7' }}>
        {/* Profile Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px', borderBottom: '1px solid #f0f4f1', paddingBottom: '30px', flexWrap: 'wrap' }}>
          <div style={{ width: '80px', height: '80px', background: '#e7f5e9', color: '#166534', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
            <User size={40} />
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: '0 0 5px 0', color: '#17351f', fontSize: '24px' }}>{profile?.full_name || 'Farmer'}</h2>
            <p style={{ margin: 0, color: '#627168' }}>{user?.email}</p>
          </div>
          {!editing ? (
            <button onClick={startEdit} className="secondary-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Edit3 size={16} /> {t('profile.editProfile')}
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleSave} className="primary-btn" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: saving ? 0.7 : 1, padding: '10px 16px' }}>
                {saving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
                {saving ? t('profile.saving') : t('profile.saveChanges')}
              </button>
              <button onClick={cancelEdit} className="secondary-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px' }}>
                <X size={16} /> {t('profile.cancel')}
              </button>
            </div>
          )}
        </div>

        <h3 style={{ color: '#166534', margin: '0 0 20px 0', fontSize: '18px' }}>{t('profile.personalDetails')}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <Field label={t('profile.village')} value={profile?.village} field="village" />
          <Field label={t('profile.district')} value={profile?.district} field="district" />
          <Field label={t('profile.state')} value={profile?.state} field="state" />
          <Field label={t('profile.farmSizeAcres')} value={profile?.farm_size_acres ? `${profile.farm_size_acres} Acres` : null} field="farm_size_acres" />
          <Field label={t('profile.soilType')} value={profile?.soil_type} field="soil_type" />
        </div>
      </div>
    </div>
  );
};

export default Profile;