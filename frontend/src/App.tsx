import React, { Suspense } from 'react';
import { useRoutes } from 'react-router-dom';
import { ConfigProvider } from 'antd-mobile';
import { Spin } from 'antd';
import { routes } from './routes';

const App: React.FC = () => {
  const element = useRoutes(routes);

  return (
    <ConfigProvider
      theme={{
        root: {
          '--adm-color-background': '#f5f5f5',
          '--adm-color-text': '#333',
          '--adm-color-text-secondary': '#666',
          '--adm-border-color': '#eee',
        }
      }}
    >
      <Suspense fallback={<Spin className="global-loading" size="large" />}>
        {element}
      </Suspense>
    </ConfigProvider>
  );
};

export default App;
