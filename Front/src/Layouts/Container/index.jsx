import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Breadcrumb, Layout, theme } from 'antd';

const { Content } = Layout;

const Index = () => {
  const [accordion, setAccordion] = useState([])
  const { token: { colorBgContainer } } = theme.useToken();
  const location = useLocation()

  useEffect(() => {
    setAccordion(location.pathname.split('/'))
  }, [location])

  return (
    <Content  >
      <div style={{ backgroundColor:"#efefef", margin: "20px 20px 0px 20px", padding: "10px", height: "80%", border: "1px solid black", borderRadius:"5px" }}>
        <Outlet />
      </div>
    </Content>
  )
}
export default Index;
