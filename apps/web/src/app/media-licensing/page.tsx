'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export default function MediaLicensingPage() {
  const { token, isAuthenticated } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [form, setForm] = useState({ organizationName: '', organizationType: 'newspaper', purpose: '', offeredAmount: '', currency: 'NGN', licenseType: 'one_time' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    api.reports.feed('NG').then(setReports).catch(() => {});
  }, []);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedReport) return;
    setSubmitting(true);
    try {
      await api.licensing.request(token, {
        reportId: selectedReport.id,
        ...form,
        offeredAmount: Number(form.offeredAmount) || undefined,
      });
      setSuccess('License request sent! The reporter will review your request.');
      setSelectedReport(null);
      setForm({ organizationName: '', organizationType: 'newspaper', purpose: '', offeredAmount: '', currency: 'NGN', licenseType: 'one_time' });
    } catch (err: any) {
      alert(err.message || 'Failed to send request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Media Licensing</h1>
        <p className="text-gray-500 mt-1">Browse verified citizen reports and request content usage rights</p>
      </div>

      {success && <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 mb-6">{success}</div>}

      {/* Report Browser */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {reports.map((report: any) => (
          <div key={report.id} className={`bg-white rounded-xl border p-5 cursor-pointer transition ${selectedReport?.id === report.id ? 'border-[#0F7B6C] ring-2 ring-[#0F7B6C]/20' : 'border-gray-100 hover:border-gray-300'}`}
            onClick={() => setSelectedReport(report)}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs px-2 py-0.5 bg-gray-100 rounded capitalize">{report.category.replace('_', ' ')}</span>
              <span className="text-xs text-gray-400">{report.verificationLevel.replace('_', ' ')}</span>
            </div>
            <h3 className="font-semibold text-gray-900 line-clamp-2">{report.title}</h3>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{report.description}</p>
            <p className="text-xs text-gray-400 mt-2">By: {report.author?.displayName || 'Anonymous'}</p>
          </div>
        ))}
      </div>

      {/* License Request Form */}
      {selectedReport && isAuthenticated && (
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Request License</h2>
          <p className="text-sm text-gray-500 mb-6">For: &quot;{selectedReport.title}&quot;</p>

          <form onSubmit={handleRequest} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
                <input type="text" value={form.organizationName} onChange={(e) => setForm({ ...form, organizationName: e.target.value })} required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#0F7B6C]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Organization Type</label>
                <select value={form.organizationType} onChange={(e) => setForm({ ...form, organizationType: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#0F7B6C]">
                  <option value="tv_station">TV Station</option>
                  <option value="newspaper">Newspaper</option>
                  <option value="blog">Blog / Online Media</option>
                  <option value="news_agency">News Agency</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purpose of Use</label>
              <textarea value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} required rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#0F7B6C] resize-none"
                placeholder="How will you use this content?" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Offered Amount</label>
                <input type="number" value={form.offeredAmount} onChange={(e) => setForm({ ...form, offeredAmount: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#0F7B6C]" placeholder="500000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none">
                  <option value="NGN">NGN</option>
                  <option value="GHS">GHS</option>
                  <option value="KES">KES</option>
                  <option value="USD">USD</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">License Type</label>
                <select value={form.licenseType} onChange={(e) => setForm({ ...form, licenseType: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none">
                  <option value="one_time">One-Time Use</option>
                  <option value="non_exclusive">Non-Exclusive</option>
                  <option value="exclusive">Exclusive</option>
                </select>
              </div>
            </div>

            <p className="text-xs text-gray-400">Note: 50% of the payment goes to the reporter, 50% to the platform.</p>

            <button type="submit" disabled={submitting}
              className="w-full py-3 bg-[#0F7B6C] text-white font-semibold rounded-lg hover:bg-[#0B6E4F] transition disabled:opacity-50">
              {submitting ? 'Sending...' : 'Send License Request'}
            </button>
          </form>
        </div>
      )}

      {selectedReport && !isAuthenticated && (
        <p className="text-center text-gray-500 mt-4">Please <a href="/login" className="text-[#0F7B6C] font-semibold">sign in</a> to request a license.</p>
      )}
    </div>
  );
}
