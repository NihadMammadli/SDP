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
      theme={"light"}
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        width={260}
        collapsedWidth={75}
        style={{boxShadow: "0 5px 6px rgba(0, 0, 0, 0.2)"}}
      >
        <div style={{ borderRadius: "5px" }}>
          <div className={style.logo}>
            <Image
              width={collapsed ? 0 : 155}
              height={collapsed ? 0 : 100}
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
