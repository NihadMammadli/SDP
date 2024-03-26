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
  const [lastSimilarityAlarm, setLastSimilarityAlarm] = useState([]);
  const [lastScoringPreceding, setLastScoringPreceding] = useState([]);
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


  const fetchSections = async () => {
    setLastSubmitted([])
    setLastSimilarityAlarm([])
    setLastScoringPreceding([])
    try {
      const response = await axios.get('http://localhost:10000/cms/sections');
      setSections(response.data);
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
      messageApi.success(`User with id ${data?.participation_id} submitted`);
      setLastSubmitted(data)
      setTimeout(fetchSections, 5000);
    });

    socket.on('similarityAlarm', data => {
      console.log(data)
      messageApi.error(data.message);
      setLastSimilarityAlarm(data.id)
      setTimeout(fetchSections, 5000);
    });

    socket.on('scoringPreceding', data => {
      console.log(data)
      messageApi.error(data.message);
      setLastScoringPreceding(data.id)
      setTimeout(fetchSections, 5000);
    });

    return () => socket.disconnect();
  }, []);

  return (
    <>
      {contextHolder}
      <div style={{ height: '90%' }}>
        <Row gutter={[16, 16]} style={{ padding: "5px" }}>
          {sections?.map(section => (
            <Col key={section?.id} span={5}
              style={{
                boxShadow: "0 5px 6px rgba(0, 0, 5, 0.1)",
                transition: "border-color 0.3s ease",
                border: "1px solid transparent",
                borderRadius: "6px",
                padding: "10px 20px 20px 20px",
                margin: "auto"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#1677FF";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "transparent";
              }}
            >
              <Row style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <Typography style={{ fontSize: "20px", fontWeight: "600" }}>{section?.section.toUpperCase()}</Typography>
              </Row>
              <Row gutter={[16, 16]}>
                {section?.users.map(user => (
                  <Col key={user?.id} span={8}
                    style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <div
                      // onClick={(_) => showView(user)}
                      style={{
                        width: '100px',
                        borderRadius: "5px",
                        height: '100px',
                        backgroundColor: user?.id === lastSubmitted?.participation_id ? (user?.id === lastSimilarityAlarm ? 'red' : (user?.id === lastScoringPreceding ? 'yellow' : (blink ? 'green' : 'white'))) : 'white',
                        display: 'flex',
                        transition: "border-color 0.3s ease",
                        border: "1px solid transparent",
                        flexDirection: "column",
                        boxShadow: "0 5px 6px rgba(15, 15, 15, 0.1)",
                        justifyContent: 'center',
                        alignItems: 'center',
                        transition: 'background-color 0.5s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#1677FF";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "transparent";
                      }}
                    >
                      <Typography.Text style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>{user?.first_name}</Typography.Text>
                      <Typography.Text style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>{user?.last_name}</Typography.Text>
                    </div>
                  </Col>
                ))}
              </Row>
            </Col>
          ))}
        </Row>
      </div>
      <View open={viewOpen} close={viewClose} data={viewData} />
    </>
  );
}

export default App;
