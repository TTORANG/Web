import { Outlet } from 'react-router-dom';

import './App.css';
import { Gnb, Layout } from './components/layout';

function App() {
  return (
    <Layout headerLeft={<div>로고</div>} headerCenter={<Gnb />} headerRight={<div>로그인</div>}>
      <Outlet />
    </Layout>
  );
}

export default App;
