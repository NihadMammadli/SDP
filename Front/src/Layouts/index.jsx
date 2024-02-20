import React, { useState } from "react";
import Header from "./Header";
import Menu from "./Menu";
import Container from "./Container";
import style from "./style.module.scss";
import { Layout, Image } from "antd";
const { Sider } = Layout;

const Index = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout className={style.container}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        width={260}
        collapsedWidth={75}
      >
        <div style={{ border: "1px solid black" }}>
          <div className={style.logo}>
            <Image
              width={collapsed ? 50 : 155}
              height={collapsed ? 30 : 100}
              src="https://upload.wikimedia.org/wikipedia/commons/2/20/Adalogonew.png"
            />
          </div>
          <Menu />
        </div>

      </Sider>

      <Layout>
        <Header />
        <Container />
      </Layout>
    </Layout>
  );
};
export default Index;
