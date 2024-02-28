import { useState, useEffect } from 'react';
import { Row, Col, Table, Typography, message, Button } from "antd";
import style from './style.module.scss';
import axios from "axios";

function App() {
  const [messageApi, contextHolder] = message.useMessage();
  const [sections, setSections] = useState([]);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const response = await axios.get('http://localhost:10000/cms/sections');
        setSections(response.data);
        console.log(response.data)
      } catch (error) {
        console.error('Error fetching sections:', error);
        messageApi.error('Error fetching sections');
      }
    };

    const interval = setInterval(() => {
      fetchSections();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {contextHolder}
        <Row gutter={[16, 16]}>
          {sections?.map(section => (
            <Col key={section?.id} span={24 / sections?.length} style={{ border: "1px solid black", borderRadius: "6px", padding: "5px" }}>
              <Row style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <Typography.Title level={3}>Section: {section?.section.toUpperCase()}</Typography.Title>
              </Row>
              <Row gutter={[16, 16]}>
                {section?.users.map(user => (
                  <Col key={user.id} span={8}>
                    <div style={{ width: '100px', height: '100px', backgroundColor: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <Typography.Text>{user.first_name} {user.last_name}</Typography.Text>
                    </div>
                  </Col>
                ))}
              </Row>
            </Col>
          ))}
        </Row>
    </>
  );
}

export default App;
