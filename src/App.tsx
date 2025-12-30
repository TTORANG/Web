import { Outlet, useLocation } from 'react-router-dom';

import './App.css';
import { Gnb, Layout } from './components/layout';
import { PATH_TO_TAB } from './constants/navigation';

function App() {
  const location = useLocation();
  const activeTab = PATH_TO_TAB[location.pathname] ?? 'slide';

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
