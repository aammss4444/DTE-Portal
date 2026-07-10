import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { 
  Award, 
  Save, 
  X, 
  Star, 
  MessageSquare, 
  Presentation, 
  BookOpen,
  Loader2
} from 'lucide-react';
import { Button, Input } from '../../components/common/UIComponents';
import { enterMarks, fetchShortlisted } from './selectionSlice';

const MarkEntryForm = ({ candidate, advertisementId, institutionId, onCancel, onSuccess }) => {
  const dispatch = useDispatch();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    subject_knowledge: candidate.subject_knowledge || 0,
    teaching_aptitude: candidate.teaching_aptitude || 0,
    communication_skills: candidate.communication_skills || 0,
    overall_impression: candidate.overall_impression || 0
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    const val = Math.min(100, Math.max(0, parseFloat(value) || 0));
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await dispatch(enterMarks({
        advertisement_id: advertisementId,
        application_id: candidate.application_id,
        candidate_id: candidate.candidate_id,
        institution_id: institutionId,
        ...formData
      })).unwrap();
      
      // Refresh list and notify
      dispatch(fetchShortlisted(advertisementId));
      if (onSuccess) onSuccess();
    } catch (err) {
      // Toast handled by slice
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200/50 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
            <Award size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Score Assessment</h2>
            <p className="text-xs text-slate-500 font-medium">Evaluating: <span className="text-indigo-600 font-bold">{candidate.candidate_name}</span></p>
          </div>
        </div>
        <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
              <BookOpen size={14} className="text-indigo-500" />
              Subject Knowledge
            </label>
            <Input 
              type="number"
              name="subject_knowledge"
              value={formData.subject_knowledge}
              onChange={handleChange}
              placeholder="0-100"
              max="100"
              min="0"
              className="text-lg font-bold"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
              <Presentation size={14} className="text-emerald-500" />
              Teaching Aptitude
            </label>
            <Input 
              type="number"
              name="teaching_aptitude"
              value={formData.teaching_aptitude}
              onChange={handleChange}
              placeholder="0-100"
              max="100"
              min="0"
              className="text-lg font-bold"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
              <MessageSquare size={14} className="text-amber-500" />
              Communication Skills
            </label>
            <Input 
              type="number"
              name="communication_skills"
              value={formData.communication_skills}
              onChange={handleChange}
              placeholder="0-100"
              max="100"
              min="0"
              className="text-lg font-bold"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
              <Star size={14} className="text-purple-500" />
              Overall Impression
            </label>
            <Input 
              type="number"
              name="overall_impression"
              value={formData.overall_impression}
              onChange={handleChange}
              placeholder="0-100"
              max="100"
              min="0"
              className="text-lg font-bold"
            />
          </div>
        </div>

        <div className="pt-6 border-t border-slate-50 flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={onCancel} className="px-8 border-slate-200">
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={saving}
            className="min-w-[160px] shadow-sm"
          >
            {saving ? <Loader2 size={18} className="animate-spin mr-2" /> : <Save size={18} className="mr-2" />}
            Save Scores
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MarkEntryForm;
