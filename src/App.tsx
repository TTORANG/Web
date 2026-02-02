import { RouterProvider } from 'react-router-dom';

import { DevFab } from '@/components/common/DevFab';
import { router } from '@/router';
import { useThemeListener } from '@/stores/themeStore';

function App() {
  useThemeListener();

  return (
    <>
      <RouterProvider router={router} />
      <DevFab />
    </>
  );
}

export default App;
