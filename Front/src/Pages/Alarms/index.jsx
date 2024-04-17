import { useState, useEffect } from 'react'
import { Row, Col, Card, Table, message, Button } from "antd";
import axios from "axios"
import { ExclamationCircleOutlined, WarningOutlined } from '@ant-design/icons';
import './style.css'
import socketIOClient from 'socket.io-client';
const ENDPOINT = `${import.meta.env.VITE_BASE}`;

function App() {
  const [messageApi, contextHolder] = message.useMessage();
  const [alarms, setAlarms] = useState([])

  const columns = [
    {
      title: <div style={{ fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>User ID</div>,
      dataIndex: 'user_id',
      key: 'user_id',
      width: '5%',
      align: 'center',
      render: text => <div style={{ fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{text}</div>,
    },
    {
      title: <div style={{ fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Full Name</div>,
      dataIndex: 'first_name',
      key: 'first_name',
      width: '20%',
      align: 'center',
      render: (text, record) => (
        <div style={{ fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {record?.first_name} {record?.last_name}
        </div>
      ),
    },
    {
      title: <div style={{ fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Username</div>,
      dataIndex: 'username',
      key: 'username',
      width: '25%',
      align: 'center',
      render: text => <div style={{ fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{text}</div>,
    },
    {
      title: <div style={{ fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Time</div>,
      dataIndex: 'time',
      key: 'time',
      width: '25%',
      align: 'center',
      render: text => {
        const formattedTime = new Date(text).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric',
        });
        return (
          <div style={{ fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {formattedTime}
          </div>
        );
      },
    },
    {
      title: <div style={{ fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Event Type</div>,
      dataIndex: 'alarm_name',
      key: 'alarm_name',
      width: '10%',
      align: 'center',
      render: text =>
        <div
          style={{
            background: "#FAFAFA",
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            gap:"8px",
            justifyContent: 'center',
            color: text === "after-event" ? "#F9AA33" : (text === "plagiarism" ? "#FF0000" : "black")
          }}
        >
          {text == "after-event" ? <ExclamationCircleOutlined/> : <WarningOutlined/>} {text.charAt(0).toUpperCase() + text.slice(1)}
        </div>,
        
    },
  ];

  const getAlarms = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_API}/cms/alarms`);
      
      setAlarms(response?.data)
    } catch (error) {
      console.error('Error fetching sections:', error);
      messageApi.error('Error fetching sections');
    }
  };

  const getBackgroundColor = (alarmName) => {
    switch (alarmName) {
      case 'plagiarism':
        return 'red';
      case 'submitted':
        return 'green';
      case 'after-event':
        return 'yellow';
      case 'sudden-increase':
        return 'orange';
      default:
        return 'white';
    }
  };

  useEffect(() => {
    getAlarms();
  }, []);

  useEffect(() => {
    const socket = socketIOClient(import.meta.env.VITE_BASE_SOCKET);

    socket.on('output', data => {
      messageApi.success(`User with id ${data?.participation_id} submitted`);
      setTimeout(getAlarms, 1000);
    });

    socket.on('similarityAlarm', data => {
      messageApi.error(data.message);
      setTimeout(getAlarms, 1000);
    });

    socket.on('scoringPreceding', data => {
      messageApi.error(data.message);
      setTimeout(getAlarms, 1000);
    });

    return () => socket.disconnect();
  }, []);
  return (
    <>
      {contextHolder}
      <div>
        <Row >
          <Col style={{ height: '800px' }} span={24}>
            <div style={{ height: '90%', overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <Table
                columns={columns}
                pagination={false}
                dataSource={alarms.map(alarm => ({ ...alarm, key: alarm.alarm_id }))}
                bordered
              />
            </div>
          </Col>
        </Row>
      </div>
    </>

  )
}

export default App
