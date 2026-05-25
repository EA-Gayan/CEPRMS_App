import { User } from 'lucide-react';
import DashboardShell from '../../components/DashboardShell';

export default function PatientDashboard() {
  return (
    <DashboardShell title="Patient Dashboard">
      <div className="coming-soon">
        <div className="coming-soon__icon"><User size={32} /></div>
        <h2>Patient Dashboard</h2>
        <p>Phase 2 — Medical records &amp; consent management coming soon</p>
      </div>
    </DashboardShell>
  );
}
