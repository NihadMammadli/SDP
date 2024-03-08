import { useState, useEffect } from 'react';
import { Row, Col, Table, Typography, message, Button } from "antd";
import style from './style.module.scss';
import axios from "axios";
import View from './View'
import socketIOClient from 'socket.io-client';
const ENDPOINT = 'http://localhost:5000';

function App() {
  const [messageApi, contextHolder] = message.useMessage();

  const [sections, setSections] = useState([]);
  const [lastSubmitted, setLastSubmitted] = useState([]);
  const [blink, setBlink] = useState(false);

  const [viewOpen, setViewOpen] = useState(false)
  const [viewData, setViewData] = useState(false)

  const showView = (data, index) => {
    setViewOpen(true)
    setViewData(data)
  }

  const viewClose = () => {
    setViewOpen(false)
  }

  const handleClick = () => {
    showView(user);
  };

  const fetchSections = async () => {
    setLastSubmitted([])
    try {
      const response = await axios.get('http://localhost:10000/cms/sections');
      setSections(response.data);
      console.log(response.data)
    } catch (error) {
      console.error('Error fetching sections:', error);
      messageApi.error('Error fetching sections');
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  useEffect(() => {
    setInterval(() => {
      setBlink(prevBlink => !prevBlink);
    }, 500);

    const socket = socketIOClient(ENDPOINT);

    socket.on('output', data => {
      console.log(data);
      setLastSubmitted(data)
      setTimeout(fetchSections, 5000);
    });

    socket.on('similarityAlarm', data => {
      console.log(data);
      messageApi.error(data);
    });

    return () => socket.disconnect();
  }, []);

  return (
    <>
      {contextHolder}
      <Row gutter={[16, 16]}>
        {sections?.map(section => (
          <Col key={section?.id} style={{ border: "1px solid black", borderRadius: "6px", padding: "5px", margin: "auto" }}>
            <Row style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <Typography.Title level={3}>Section: {section?.section.toUpperCase()}</Typography.Title>
            </Row>
            <Row gutter={[16, 16]}>
              {section?.users.map(user => (
                <Col key={user?.id} span={8} style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <div onClick={handleClick} style={{
                    width: '100px',
                    borderRadius: "5px",
                    border: "0.5px solid black",
                    height: '100px',
                    backgroundColor: user?.id === lastSubmitted?.participation_id ? (blink ? 'green' : 'white') : 'white',
                    display: 'flex',
                    flexDirection: "column",
                    justifyContent: 'center',
                    alignItems: 'center',
                    transition: 'background-color 0.5s ease'
                  }}>
                    <Typography.Text style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>{user?.first_name}</Typography.Text>
                    <Typography.Text style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>{user?.last_name}</Typography.Text>
                  </div>
                </Col>
              ))}
            </Row>
          </Col>
        ))}
      </Row>

      <View open={viewOpen} close={viewClose} data={viewData} />
    </>
  );
}

export default App;
