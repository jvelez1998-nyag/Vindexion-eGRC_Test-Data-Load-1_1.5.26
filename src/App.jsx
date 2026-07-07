import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import RiskRegister from '@/pages/RiskRegister';
import Compliance from '@/pages/Compliance';
import Controls from '@/pages/Controls';
import Incidents from '@/pages/Incidents';
import Vendors from '@/pages/Vendors';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/risks" element={<RiskRegister />} />
          <Route path="/compliance" element={<Compliance />} />
          <Route path="/controls" element={<Controls />} />
          <Route path="/incidents" element={<Incidents />} />
          <Route path="/vendors" element={<Vendors />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
