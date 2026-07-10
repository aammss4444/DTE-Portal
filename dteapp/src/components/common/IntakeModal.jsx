import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Save, Calendar, Users, BarChart3 } from 'lucide-react';
import Modal from './Modal';
import { Button, Input } from './UIComponents';
import { createIntake } from '../../features/admin/institutionSlice';

const IntakeModal = ({ isOpen, onClose, course }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    course_id: course?.id || '',
    academic_year: '2026-2027',
    approved_seats: 60,
    actual_admitted: 0
  });

  if (!course) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(createIntake({
      ...formData,
      course_id: course.id
    }));
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Manage Intake: ${course.name}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-accent/5 p-4 rounded-xl border border-accent/10 flex items-center mb-6">
          <BarChart3 className="text-accent mr-3" size={24} />
          <div>
            <p className="text-xs font-bold text-accent uppercase tracking-wider">Course Level</p>
            <p className="text-sm font-bold text-foreground">{course.level}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="relative">
            <Calendar className="absolute left-3 top-[38px] text-secondary" size={18} />
            <Input 
              label="Academic Year"
              value={formData.academic_year}
              onChange={(e) => setFormData(prev => ({ ...prev, academic_year: e.target.value }))}
              className="pl-10"
              placeholder="e.g. 2026-2027"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <Users className="absolute left-3 top-[38px] text-secondary" size={18} />
              <Input 
                label="Approved Seats"
                type="number"
                value={formData.approved_seats}
                onChange={(e) => setFormData(prev => ({ ...prev, approved_seats: parseInt(e.target.value) }))}
                className="pl-10"
                required
              />
            </div>
            <div className="relative">
              <Users className="absolute left-3 top-[38px] text-secondary" size={18} />
              <Input 
                label="Actual Admitted"
                type="number"
                value={formData.actual_admitted}
                onChange={(e) => setFormData(prev => ({ ...prev, actual_admitted: parseInt(e.target.value) }))}
                className="pl-10"
                required
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-6 border-t border-border mt-6">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="accent" className="flex items-center px-8">
            <Save size={18} className="mr-2" />
            Save Intake Data
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default IntakeModal;
