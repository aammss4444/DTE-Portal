import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { User, Briefcase, GraduationCap, Save, Plus, Trash2, CheckCircle, AlertCircle, Edit2, X, Calendar, MapPin, Mail, Phone, ShieldCheck, Flag, Users } from 'lucide-react';
import { Button, Input } from '../../components/common/UIComponents';
import { updateProfile, updateExperience, updateQualifications, getProfile, resetState } from './candidateSlice';

import { toast } from 'react-hot-toast';

const CandidateProfile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { loading, error, success, profile } = useSelector((state) => state.candidate);

  // Section State
  const [activeTab, setActiveTab] = useState('basic');
  const [isEditing, setIsEditing] = useState(false);

  // Basic Profile State
  const [profileData, setProfileData] = useState({
    full_name: user?.full_name || '',
    father_name: '',
    date_of_birth: '',
    gender: 'MALE',
    category: 'OPEN',
    religion: '',
    nationality: 'Indian',
    mobile: user?.phone_number || '',
    email: user?.email || '',
    address: '',
    district: '',
    state: '',
    pincode: '',
    aadhar_number: ''
  });

  // Experience State
  const [experiences, setExperiences] = useState([
    { institution_name: '', designation: '', from_date: '', to_date: '', is_current: false, experience_type: 'TEACHING', description: '' }
  ]);

  // Qualification State
  const [qualifications, setQualifications] = useState([
    { degree: '', specialization: '', university: '', year_of_passing: '', percentage: '', is_highest: false }
  ]);

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    dispatch(updateProfile(profileData));
  };

  const handleExperienceSubmit = (e) => {
    e.preventDefault();
    dispatch(updateExperience({ experiences }));
  };

  const handleQualificationSubmit = (e) => {
    e.preventDefault();
    dispatch(updateQualifications({ qualifications }));
  };

  const addExperience = () => {
    setExperiences([...experiences, { institution_name: '', designation: '', from_date: '', to_date: '', is_current: false, experience_type: 'TEACHING', description: '' }]);
  };

  const removeExperience = (index) => {
    const newExp = experiences.filter((_, i) => i !== index);
    setExperiences(newExp.length ? newExp : [{ institution_name: '', designation: '', from_date: '', to_date: '', is_current: false, experience_type: 'TEACHING', description: '' }]);
  };

  const addQualification = () => {
    setQualifications([...qualifications, { degree: '', specialization: '', university: '', year_of_passing: '', percentage: '', is_highest: false }]);
  };

  const removeQualification = (index) => {
    const newQual = qualifications.filter((_, i) => i !== index);
    setQualifications(newQual.length ? newQual : [{ degree: '', specialization: '', university: '', year_of_passing: '', percentage: '', is_highest: false }]);
  };

  useEffect(() => {
    dispatch(getProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      setProfileData({
        full_name: profile.full_name || '',
        father_name: profile.father_name || '',
        date_of_birth: profile.date_of_birth || '',
        gender: profile.gender || 'MALE',
        category: profile.category || 'OPEN',
        religion: profile.religion || '',
        nationality: profile.nationality || 'Indian',
        mobile: profile.mobile || '',
        email: profile.email || '',
        address: profile.address || '',
        district: profile.district || '',
        state: profile.state || '',
        pincode: profile.pincode || '',
        aadhar_number: profile.aadhar_number || ''
      });

      if (profile.experiences && profile.experiences.length > 0) {
        setExperiences(profile.experiences.map(exp => ({
          ...exp,
          institution_name: exp.institution_name || exp.organization || '',
          is_current: exp.is_current || false
        })));
      } else {
        setExperiences([{ institution_name: '', designation: '', from_date: '', to_date: '', is_current: false, experience_type: 'TEACHING', description: '' }]);
      }

      if (profile.qualifications && profile.qualifications.length > 0) {
        setQualifications(profile.qualifications.map(q => ({
          ...q,
          is_highest: q.is_highest || false
        })));
      } else {
        setQualifications([{ degree: '', specialization: '', university: '', year_of_passing: '', percentage: '', is_highest: false }]);
      }
    }
  }, [profile]);

  useEffect(() => {
    if (success) {
      setIsEditing(false);
      toast.success('Saved successfully!');
      const timer = setTimeout(() => dispatch(resetState()), 3000);
      return () => clearTimeout(timer);
    }
  }, [success, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const DetailItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-start space-x-3 p-4 bg-muted/5 rounded-xl border border-border/50">
      <div className="bg-accent/10 p-2 rounded-lg text-accent">
        <Icon size={18} />
      </div>
      <div>
        <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">{label}</p>
        <p className="text-sm font-semibold text-foreground">{value || 'Not provided'}</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      <div className="bg-background border border-border rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 p-8 text-white">
          <div className="flex items-center space-x-4">
            <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md">
              <User size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Complete Your Profile</h1>
              <p className="text-slate-300 text-sm">Provide your details to start applying for vacancies</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border bg-muted/30">
          <button 
            onClick={() => setActiveTab('basic')}
            className={`flex-1 flex items-center justify-center py-4 px-6 text-sm font-bold transition-all border-b-2 ${activeTab === 'basic' ? 'border-accent text-accent bg-background' : 'border-transparent text-secondary hover:bg-muted'}`}
          >
            <User size={18} className="mr-2" /> Basic Info
          </button>
          <button 
            onClick={() => setActiveTab('education')}
            className={`flex-1 flex items-center justify-center py-4 px-6 text-sm font-bold transition-all border-b-2 ${activeTab === 'education' ? 'border-accent text-accent bg-background' : 'border-transparent text-secondary hover:bg-muted'}`}
          >
            <GraduationCap size={18} className="mr-2" /> Education
          </button>
          <button 
            onClick={() => setActiveTab('experience')}
            className={`flex-1 flex items-center justify-center py-4 px-6 text-sm font-bold transition-all border-b-2 ${activeTab === 'experience' ? 'border-accent text-accent bg-background' : 'border-transparent text-secondary hover:bg-muted'}`}
          >
            <Briefcase size={18} className="mr-2" /> Experience
          </button>
        </div>

        {/* Status Messages */}
        <div className="px-8 pt-4">
          {success && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-3 rounded-xl flex items-center text-sm font-medium animate-in fade-in slide-in-from-top-2">
              <CheckCircle size={18} className="mr-2" /> Profile updated successfully!
            </div>
          )}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl flex items-center text-sm font-medium">
              <AlertCircle size={18} className="mr-2" /> {error}
            </div>
          )}
        </div>

        <div className="p-8">
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold flex items-center">
                  <User className="mr-2 text-accent" size={20} /> Basic Information
                </h2>
                {!isEditing ? (
                  <Button variant="outline" onClick={() => setIsEditing(true)} className="flex items-center text-xs">
                    <Edit2 size={14} className="mr-2" /> Edit Details
                  </Button>
                ) : (
                  <Button variant="outline" onClick={() => setIsEditing(false)} className="flex items-center text-xs text-red-500 border-red-500/20 hover:bg-red-500/10">
                    <X size={14} className="mr-2" /> Cancel Editing
                  </Button>
                )}
              </div>

              {!isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <DetailItem icon={User} label="Full Name" value={profileData.full_name} />
                  <DetailItem icon={Users} label="Father's Name" value={profileData.father_name} />
                  <DetailItem icon={Calendar} label="Date of Birth" value={profileData.date_of_birth} />
                  <DetailItem icon={Users} label="Gender" value={profileData.gender} />
                  <DetailItem icon={ShieldCheck} label="Category" value={profileData.category} />
                  <DetailItem icon={Flag} label="Nationality" value={profileData.nationality} />
                  <DetailItem icon={Phone} label="Mobile Number" value={profileData.mobile} />
                  <DetailItem icon={Mail} label="Email Address" value={profileData.email} />
                  <DetailItem icon={ShieldCheck} label="Aadhar Number" value={profileData.aadhar_number} />
                  <DetailItem icon={MapPin} label="District" value={profileData.district} />
                  <DetailItem icon={MapPin} label="State" value={profileData.state} />
                  <DetailItem icon={MapPin} label="Pincode" value={profileData.pincode} />
                  <div className="md:col-span-2 lg:col-span-3">
                    <DetailItem icon={MapPin} label="Full Address" value={profileData.address} />
                  </div>
                </div>
              ) : (
                <form onSubmit={handleProfileSubmit} className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Input 
                      label="Full Name" 
                      value={profileData.full_name} 
                      onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
                      placeholder="Enter full name"
                      required
                    />
                    <Input 
                      label="Father's Name" 
                      value={profileData.father_name} 
                      onChange={(e) => setProfileData({...profileData, father_name: e.target.value})}
                      placeholder="Enter father's name"
                    />
                    <Input 
                      label="Date of Birth" 
                      type="date"
                      value={profileData.date_of_birth} 
                      onChange={(e) => setProfileData({...profileData, date_of_birth: e.target.value})}
                      required
                    />
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-secondary uppercase tracking-wider">Gender</label>
                      <select 
                        className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 focus:ring-2 focus:ring-accent outline-none transition-all"
                        value={profileData.gender}
                        onChange={(e) => setProfileData({...profileData, gender: e.target.value})}
                      >
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-secondary uppercase tracking-wider">Category</label>
                      <select 
                        className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 focus:ring-2 focus:ring-accent outline-none transition-all"
                        value={profileData.category}
                        onChange={(e) => setProfileData({...profileData, category: e.target.value})}
                      >
                        <option value="OPEN">Open</option>
                        <option value="OBC">OBC</option>
                        <option value="SC">SC</option>
                        <option value="ST">ST</option>
                        <option value="EWS">EWS</option>
                      </select>
                    </div>
                    <Input 
                      label="Religion" 
                      value={profileData.religion} 
                      onChange={(e) => setProfileData({...profileData, religion: e.target.value})}
                      placeholder="Enter religion"
                    />
                    <Input 
                      label="Nationality" 
                      value={profileData.nationality} 
                      onChange={(e) => setProfileData({...profileData, nationality: e.target.value})}
                      placeholder="Enter nationality"
                    />
                    <Input 
                      label="Mobile Number" 
                      value={profileData.mobile} 
                      onChange={(e) => setProfileData({...profileData, mobile: e.target.value})}
                      placeholder="Enter mobile number"
                      required
                    />
                    <Input 
                      label="Email Address" 
                      type="email"
                      value={profileData.email} 
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      placeholder="Enter email address"
                      required
                    />
                    <Input 
                      label="Aadhar Number" 
                      value={profileData.aadhar_number} 
                      onChange={(e) => setProfileData({...profileData, aadhar_number: e.target.value})}
                      placeholder="Enter 12 digit Aadhar number"
                    />
                    <div className="sm:col-span-2 space-y-2">
                      <label className="text-sm font-bold text-secondary uppercase tracking-wider">Full Address</label>
                      <textarea 
                        className="w-full p-4 rounded-xl border border-border bg-muted/20 focus:ring-2 focus:ring-accent outline-none transition-all min-h-[100px]"
                        placeholder="Enter full address"
                        value={profileData.address}
                        onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                      />
                    </div>
                    <Input 
                      label="District" 
                      value={profileData.district} 
                      onChange={(e) => setProfileData({...profileData, district: e.target.value})}
                      placeholder="Enter district"
                    />
                    <Input 
                      label="State" 
                      value={profileData.state} 
                      onChange={(e) => setProfileData({...profileData, state: e.target.value})}
                      placeholder="Enter state"
                    />
                    <Input 
                      label="Pincode" 
                      value={profileData.pincode} 
                      onChange={(e) => setProfileData({...profileData, pincode: e.target.value})}
                      placeholder="Enter pincode"
                    />
                  </div>
                  <div className="flex justify-end space-x-4">
                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)} className="px-8 py-3">
                      Cancel
                    </Button>
                    <Button variant="primary" className="px-8 py-3 bg-slate-900 text-white hover:bg-black" disabled={loading}>
                      {loading ? 'Saving...' : 'Save Profile Details'}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}

          {activeTab === 'education' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold flex items-center">
                  <GraduationCap className="mr-2 text-accent" size={20} /> Educational Qualifications
                </h2>
                {!isEditing ? (
                  <Button variant="outline" onClick={() => setIsEditing(true)} className="flex items-center text-xs">
                    <Edit2 size={14} className="mr-2" /> Edit Qualifications
                  </Button>
                ) : (
                  <Button variant="outline" onClick={() => setIsEditing(false)} className="flex items-center text-xs text-red-500 border-red-500/20 hover:bg-red-500/10">
                    <X size={14} className="mr-2" /> Cancel Editing
                  </Button>
                )}
              </div>

              {!isEditing ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {qualifications.length > 0 && qualifications[0].degree ? (
                    qualifications.map((qual, index) => (
                      <div key={index} className="p-6 bg-muted/5 rounded-2xl border border-border/50 relative overflow-hidden group">
                        {qual.is_highest && (
                          <div className="absolute top-0 right-0 bg-accent text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl flex items-center">
                            <ShieldCheck size={12} className="mr-1" /> HIGHEST
                          </div>
                        )}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-bold text-foreground">{qual.degree}</h3>
                            <p className="text-sm text-secondary font-medium">{qual.specialization} • {qual.university}</p>
                          </div>
                          <div className="flex items-center space-x-6">
                            <div className="text-right">
                              <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Passing Year</p>
                              <p className="text-sm font-semibold">{qual.year_of_passing}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Percentage</p>
                              <p className="text-sm font-bold text-accent">{qual.percentage}%</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 bg-muted/5 rounded-2xl border border-dashed border-border">
                      <GraduationCap className="mx-auto text-secondary/30 mb-4" size={48} />
                      <p className="text-secondary font-medium">No educational qualifications added yet.</p>
                      <Button variant="outline" onClick={() => setIsEditing(true)} className="mt-4 text-xs">
                        Add Qualification
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleQualificationSubmit} className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
                  {qualifications.map((qual, index) => (
                    <div key={index} className="bg-muted/10 p-6 rounded-2xl border border-border relative group">
                      <button 
                        type="button"
                        onClick={() => removeQualification(index)}
                        className="absolute top-4 right-4 text-secondary hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <Input 
                          label="Degree" 
                          value={qual.degree} 
                          onChange={(e) => {
                            const newQuals = [...qualifications];
                            newQuals[index].degree = e.target.value;
                            setQualifications(newQuals);
                          }}
                          placeholder="e.g. B.Tech, M.Tech"
                        />
                        <Input 
                          label="Specialization" 
                          value={qual.specialization} 
                          onChange={(e) => {
                            const newQuals = [...qualifications];
                            newQuals[index].specialization = e.target.value;
                            setQualifications(newQuals);
                          }}
                          placeholder="e.g. Computer Science"
                        />
                        <Input 
                          label="University" 
                          value={qual.university} 
                          onChange={(e) => {
                            const newQuals = [...qualifications];
                            newQuals[index].university = e.target.value;
                            setQualifications(newQuals);
                          }}
                          placeholder="e.g. Pune University"
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <Input 
                            label="Year of Passing" 
                            type="number"
                            value={qual.year_of_passing} 
                            onChange={(e) => {
                              const newQuals = [...qualifications];
                              newQuals[index].year_of_passing = parseInt(e.target.value);
                              setQualifications(newQuals);
                            }}
                          />
                          <Input 
                            label="Percentage" 
                            type="number"
                            step="0.01"
                            value={qual.percentage} 
                            onChange={(e) => {
                              const newQuals = [...qualifications];
                              newQuals[index].percentage = parseFloat(e.target.value);
                              setQualifications(newQuals);
                            }}
                          />
                        </div>
                        <div className="flex items-center space-x-2 pt-4">
                          <input 
                            type="checkbox" 
                            id={`highest-${index}`}
                            className="w-5 h-5 rounded border-border text-accent focus:ring-accent"
                            checked={qual.is_highest}
                            onChange={(e) => {
                              const newQuals = qualifications.map((q, i) => ({
                                ...q,
                                is_highest: i === index ? e.target.checked : false
                              }));
                              setQualifications(newQuals);
                            }}
                          />
                          <label htmlFor={`highest-${index}`} className="text-sm font-bold text-secondary uppercase tracking-wider cursor-pointer">
                            Mark as Highest Qualification
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <Button type="button" variant="outline" onClick={addQualification} className="w-full sm:w-auto">
                      <Plus size={18} className="mr-2" /> Add Another Qualification
                    </Button>
                    <div className="flex space-x-4 w-full sm:w-auto">
                      <Button type="button" variant="outline" onClick={() => setIsEditing(false)} className="flex-1 sm:flex-none px-8">
                        Cancel
                      </Button>
                      <Button variant="primary" className="flex-1 sm:flex-none px-12 bg-slate-900 text-white hover:bg-black" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Qualifications'}
                      </Button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          )}

          {activeTab === 'experience' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold flex items-center">
                  <Briefcase className="mr-2 text-accent" size={20} /> Work Experience
                </h2>
                {!isEditing ? (
                  <Button variant="outline" onClick={() => setIsEditing(true)} className="flex items-center text-xs">
                    <Edit2 size={14} className="mr-2" /> Edit Experience
                  </Button>
                ) : (
                  <Button variant="outline" onClick={() => setIsEditing(false)} className="flex items-center text-xs text-red-500 border-red-500/20 hover:bg-red-500/10">
                    <X size={14} className="mr-2" /> Cancel Editing
                  </Button>
                )}
              </div>

              {!isEditing ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {experiences.length > 0 && experiences[0].institution_name ? (
                    experiences.map((exp, index) => (
                      <div key={index} className="flex space-x-6 group">
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center text-accent ring-8 ring-background group-hover:bg-accent group-hover:text-white transition-all">
                            <Briefcase size={20} />
                          </div>
                          {index !== experiences.length - 1 && (
                            <div className="w-0.5 h-full bg-border mt-2 mb-2"></div>
                          )}
                        </div>
                        <div className="flex-1 pb-8">
                          <div className="p-6 bg-muted/5 rounded-2xl border border-border/50 hover:border-accent/30 transition-all">
                            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                              <div>
                                <h3 className="text-lg font-bold text-foreground">{exp.designation}</h3>
                                <p className="text-sm text-accent font-bold">{exp.institution_name}</p>
                              </div>
                              <div className="bg-muted px-3 py-1 rounded-full text-[10px] font-bold text-secondary uppercase tracking-widest h-fit mt-2 md:mt-0">
                                {exp.from_date} — {exp.is_current ? 'Present' : exp.to_date}
                              </div>
                            </div>
                            <div className="space-y-3">
                              <div className="flex items-center text-xs text-secondary font-medium">
                                <ShieldCheck size={14} className="mr-2" /> {exp.experience_type}
                              </div>
                              <p className="text-sm text-secondary leading-relaxed">
                                {exp.description || 'No description provided.'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 bg-muted/5 rounded-2xl border border-dashed border-border">
                      <Briefcase className="mx-auto text-secondary/30 mb-4" size={48} />
                      <p className="text-secondary font-medium">No work experience added yet.</p>
                      <Button variant="outline" onClick={() => setIsEditing(true)} className="mt-4 text-xs">
                        Add Experience
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleExperienceSubmit} className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
                  {experiences.map((exp, index) => (
                    <div key={index} className="bg-muted/10 p-6 rounded-2xl border border-border relative group">
                      <button 
                        type="button"
                        onClick={() => removeExperience(index)}
                        className="absolute top-4 right-4 text-secondary hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <Input 
                          label="Institution Name" 
                          value={exp.institution_name} 
                          onChange={(e) => {
                            const newExp = [...experiences];
                            newExp[index].institution_name = e.target.value;
                            setExperiences(newExp);
                          }}
                          placeholder="e.g. ABC Polytechnic"
                        />
                        <Input 
                          label="Designation" 
                          value={exp.designation} 
                          onChange={(e) => {
                            const newExp = [...experiences];
                            newExp[index].designation = e.target.value;
                            setExperiences(newExp);
                          }}
                          placeholder="e.g. Lecturer"
                        />
                        <Input 
                          label="From Date" 
                          type="date"
                          value={exp.from_date} 
                          onChange={(e) => {
                            const newExp = [...experiences];
                            newExp[index].from_date = e.target.value;
                            setExperiences(newExp);
                          }}
                        />
                        {!exp.is_current && (
                          <Input 
                            label="To Date" 
                            type="date"
                            value={exp.to_date} 
                            onChange={(e) => {
                              const newExp = [...experiences];
                              newExp[index].to_date = e.target.value;
                              setExperiences(newExp);
                            }}
                          />
                        )}
                        <div className="flex items-center space-x-2 pt-4">
                          <input 
                            type="checkbox" 
                            id={`current-${index}`}
                            className="w-5 h-5 rounded border-border text-accent focus:ring-accent"
                            checked={exp.is_current}
                            onChange={(e) => {
                              const newExp = [...experiences];
                              newExp[index].is_current = e.target.checked;
                              if (e.target.checked) {
                                newExp[index].to_date = null;
                              }
                              setExperiences(newExp);
                            }}
                          />
                          <label htmlFor={`current-${index}`} className="text-sm font-bold text-secondary uppercase tracking-wider cursor-pointer">
                            Currently Working Here
                          </label>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-secondary uppercase tracking-wider">Experience Type</label>
                          <select 
                            className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 focus:ring-2 focus:ring-accent outline-none transition-all"
                            value={exp.experience_type}
                            onChange={(e) => {
                              const newExp = [...experiences];
                              newExp[index].experience_type = e.target.value;
                              setExperiences(newExp);
                            }}
                          >
                            <option value="TEACHING">Teaching</option>
                            <option value="INDUSTRIAL">Industrial</option>
                            <option value="RESEARCH">Research</option>
                          </select>
                        </div>
                        <div className="sm:col-span-2 space-y-2">
                          <label className="text-sm font-bold text-secondary uppercase tracking-wider">Description</label>
                          <textarea 
                            className="w-full p-4 rounded-xl border border-border bg-muted/20 focus:ring-2 focus:ring-accent outline-none transition-all min-h-[80px]"
                            placeholder="Key responsibilities and achievements"
                            value={exp.description}
                            onChange={(e) => {
                              const newExp = [...experiences];
                              newExp[index].description = e.target.value;
                              setExperiences(newExp);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <Button type="button" variant="outline" onClick={addExperience} className="w-full sm:w-auto">
                      <Plus size={18} className="mr-2" /> Add More Experience
                    </Button>
                    <div className="flex space-x-4 w-full sm:w-auto">
                      <Button type="button" variant="outline" onClick={() => setIsEditing(false)} className="flex-1 sm:flex-none px-8">
                        Cancel
                      </Button>
                      <Button variant="primary" className="flex-1 sm:flex-none px-12 bg-slate-900 text-white hover:bg-black" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Experience Details'}
                      </Button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateProfile;
