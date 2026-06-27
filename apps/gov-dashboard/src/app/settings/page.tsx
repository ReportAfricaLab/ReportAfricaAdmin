'use client';
import { useState } from 'react';

export default function SettingsPage() {
  const [jurisdiction, setJurisdiction] = useState({ country: 'NG', state: '', lga: '' });
  const [alerts, setAlerts] = useState({ enabled: true, minSeverity: 'high', categories: ['emergency', 'police_security'], threshold: 5 });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem('gov_settings', JSON.stringify({ jurisdiction, alerts }));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">⚙️ Settings</h1>
      <p className="text-gray-400 text-sm mb-6">Configure your jurisdiction and alert preferences</p>

      <div className="max-w-lg space-y-6">
        {/* Jurisdiction */}
        <div className="bg-[#1E293B] rounded-xl p-6 border border-gray-700">
          <h2 className="font-semibold mb-4">📍 Jurisdiction</h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-400">Country</label>
              <select value={jurisdiction.country} onChange={(e) => setJurisdiction({ ...jurisdiction, country: e.target.value })}
                className="w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm outline-none">
                <option value="NG">Nigeria</option><option value="GH">Ghana</option><option value="KE">Kenya</option><option value="ZA">South Africa</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400">State/Region</label>
              <input value={jurisdiction.state} onChange={(e) => setJurisdiction({ ...jurisdiction, state: e.target.value })}
                placeholder="e.g. Lagos" className="w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm outline-none" />
            </div>
            <div>
              <label className="text-xs text-gray-400">LGA/District</label>
              <input value={jurisdiction.lga} onChange={(e) => setJurisdiction({ ...jurisdiction, lga: e.target.value })}
                placeholder="e.g. Ikeja" className="w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm outline-none" />
            </div>
          </div>
        </div>

        {/* Alert Preferences */}
        <div className="bg-[#1E293B] rounded-xl p-6 border border-gray-700">
          <h2 className="font-semibold mb-4">🔔 Alert Preferences</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={alerts.enabled} onChange={(e) => setAlerts({ ...alerts, enabled: e.target.checked })}
                className="rounded border-gray-600 bg-gray-700 text-blue-500" />
              <span className="text-sm text-gray-300">Enable email alerts</span>
            </label>
            <div>
              <label className="text-xs text-gray-400">Minimum Severity</label>
              <select value={alerts.minSeverity} onChange={(e) => setAlerts({ ...alerts, minSeverity: e.target.value })}
                className="w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm outline-none">
                <option value="low">All (Low+)</option><option value="medium">Medium+</option><option value="high">High+</option><option value="critical">Critical only</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400">Alert Threshold (reports per hour to trigger)</label>
              <input type="number" value={alerts.threshold} onChange={(e) => setAlerts({ ...alerts, threshold: Number(e.target.value) })}
                className="w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm outline-none" min={1} max={50} />
            </div>
          </div>
        </div>

        {saved && <p className="text-sm text-emerald-400">✅ Settings saved</p>}
        <button onClick={handleSave} className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500">
          Save Settings
        </button>
      </div>
    </div>
  );
}
