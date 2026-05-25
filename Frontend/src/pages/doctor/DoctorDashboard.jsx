import { Stethoscope } from 'lucide-react';
import DashboardShell from '../../components/DashboardShell';

export default function DoctorDashboard() {
  return (
    <DashboardShell title="Doctor Dashboard">
      <div className="coming-soon">
        <div className="coming-soon__icon"><Stethoscope size={32} /></div>
        <h2>Doctor Dashboard</h2>
        <p>Phase 3 — Patient search &amp; clinical record access coming soon</p>
      </div>
    </DashboardShell>
  );
}
