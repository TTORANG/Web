import { Outlet, useLocation } from 'react-router-dom';

import './App.css';
import { Gnb, Layout } from './components/layout';
import { getTabFromPathname } from './constants/navigation';

function App() {
  const location = useLocation();
  const activeTab = getTabFromPathname(location.pathname);

  return (
    <Layout
      headerLeft={<div>로고</div>}
      headerCenter={<Gnb activeTab={activeTab} />}
      headerRight={<div>로그인</div>}
    >
      <Outlet />
    </Layout>
  );
}

export default App;
