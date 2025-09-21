
import { Route, Routes } from 'react-router-dom';
import './App.css';

import { AuthContextApp } from './contexts/AuthContextApp';
import AppLayout from './components/layouts/AppLayout';
import HistogramExpansion from './components/modules/Histograms/HistogramExpansion';
import HistogramEqualization from './components/modules/Histograms/HistogramEqualization';
import OpinionPage from './pages/OpinionPage';

function App() {
  return (
    <AuthContextApp>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route path="" element={<HistogramExpansion />} />
          <Route path="expansion" element={<HistogramExpansion />} />
          <Route path="ecualization" element={<HistogramEqualization />} />
        </Route>
        <Route path="opinion" element={<OpinionPage />} />
      </Routes>
    </AuthContextApp>
  );
}

export default App;