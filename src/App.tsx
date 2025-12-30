import { Outlet } from 'react-router-dom';

import './App.css';
import { Gnb, Layout } from './components/layout';

function App() {
  return (
    <Layout logo={<div>로고</div>} nav={<Gnb />} actions={<div>로그인</div>}>
      <Outlet />
    </Layout>
  );
}

export default App;
