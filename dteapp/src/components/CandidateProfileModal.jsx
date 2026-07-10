import React, { useState, useEffect } from 'react';
import { 
  User, Briefcase, GraduationCap, XCircle, 
  Mail, Phone, Calendar, MapPin, ShieldCheck, 
  Flag, Users, Info, Award
} from 'lucide-react';
import { Button } from './common/UIComponents';
import { candidateService } from '../services/candidateService';
import { cn } from '../utils/cn';

const CandidateProfileModal = ({ candidateId, onClose }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    if (candidateId) {
      fetchProfile();
    }
  }, [candidateId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await candidateService.getCandidateProfile(candidateId);
      setProfile(response.data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!candidateId) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="relative w-full max-w-4xl bg-white rounded-[48px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 max-h-[90vh]">
        {/* Header */}
        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="w-16 h-16 rounded-[2rem] bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-indigo-200">
              {profile?.full_name?.charAt(0) || <User size={32} />}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{profile?.full_name || 'Loading Profile...'}</h2>
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mt-1">Candidate Profile Portfolio</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white rounded-2xl transition-all shadow-sm">
            <XCircle size={24} className="text-slate-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-8 bg-white border-b border-slate-50">
          {[
            { id: 'basic', label: 'Basic Info', icon: Info },
            { id: 'education', label: 'Education', icon: GraduationCap },
            { id: 'experience', label: 'Experience', icon: Briefcase }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center space-x-2 px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all border-b-2",
                activeTab === tab.id ? "border-indigo-600 text-indigo-600 bg-indigo-50/30" : "border-transparent text-slate-400 hover:text-slate-600"
              )}
            >
              <tab.icon size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-10 bg-slate-50/30">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <RefreshCw className="animate-spin text-indigo-600 mb-4" size={40} />
              <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Assembling Profile...</p>
            </div>
          ) : (
            <div className="animate-in fade-in duration-500">
              {activeTab === 'basic' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <DetailCard label="Date of Birth" value={profile.date_of_birth} icon={Calendar} />
                  <DetailCard label="Gender" value={profile.gender} icon={Users} />
                  <DetailCard label="Category" value={profile.category} icon={ShieldCheck} />
                  <DetailCard label="Email" value={profile.email} icon={Mail} />
                  <DetailCard label="Mobile" value={profile.mobile} icon={Phone} />
                  <DetailCard label="Nationality" value={profile.nationality} icon={Flag} />
                  <div className="md:col-span-2 lg:col-span-3">
                    <DetailCard label="Full Address" value={profile.address} icon={MapPin} />
                  </div>
                </div>
              )}

              {activeTab === 'education' && (
                <div className="space-y-4">
                  {profile.qualifications?.length > 0 ? (
                    profile.qualifications.map((qual, idx) => (
                      <div key={idx} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center justify-between group hover:border-indigo-200 transition-all">
                        <div className="flex items-center space-x-6">
                          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                            <Award size={24} />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900">{qual.degree}</h4>
                            <p className="text-sm text-slate-500 font-medium">{qual.specialization} • {qual.university}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Passing Year</p>
                          <p className="text-sm font-bold text-indigo-600">{qual.year_of_passing}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <EmptyState icon={GraduationCap} message="No education records found." />
                  )}
                </div>
              )}

              {activeTab === 'experience' && (
                <div className="space-y-6">
                  {profile.experiences?.length > 0 ? (
                    profile.experiences.map((exp, idx) => (
                      <div key={idx} className="relative pl-8 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-slate-200">
                        <div className="absolute left-[-4px] top-0 w-2 h-2 rounded-full bg-indigo-600 shadow-lg shadow-indigo-200"></div>
                        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:border-indigo-200 transition-all">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-bold text-slate-900">{exp.designation}</h4>
                            <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold uppercase tracking-widest text-slate-500">
                              {exp.from_date} - {exp.is_current ? 'Present' : exp.to_date}
                            </span>
                          </div>
                          <p className="text-sm text-indigo-600 font-bold mb-3">{exp.institution_name}</p>
                          <p className="text-sm text-slate-500 leading-relaxed">{exp.description}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <EmptyState icon={Briefcase} message="No experience records found." />
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <Button variant="ghost" onClick={onClose}>Close Profile</Button>
        </div>
      </div>
    </div>
  );
};

const DetailCard = ({ label, value, icon: Icon }) => (
  <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
    <div className="flex items-center space-x-3 mb-2">
      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
        <Icon size={14} />
      </div>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
    </div>
    <p className="font-bold text-slate-900">{value || 'Not provided'}</p>
  </div>
);

const EmptyState = ({ icon: Icon, message }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="w-16 h-16 bg-slate-100 text-slate-300 rounded-[2rem] flex items-center justify-center mb-4">
      <Icon size={32} />
    </div>
    <p className="text-slate-400 font-medium">{message}</p>
  </div>
);

const RefreshCw = ({ className, size }) => (
  <div className={className}>
    <Users size={size} />
  </div>
);

export default CandidateProfileModal;
