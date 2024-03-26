import { useState, useEffect } from 'react'
import { Row, Col, Card, Table, message, Button } from "antd";
import axios from "axios"
import style from "./style.module.scss"
import './style.css'
import socketIOClient from 'socket.io-client';
const ENDPOINT = 'http://localhost:5000';

function App() {
  const [messageApi, contextHolder] = message.useMessage();
  const [alarms, setAlarms] = useState([])

  const columns = [
    {
      title: <div style={{ fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>User Id</div>,
      dataIndex: 'user_id',
      key: 'user_id',
      width: '10%',
      align: 'center',
      render: text => <div style={{ fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{text}</div>,
    },
    {
      title: <div style={{ fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>First Name</div>,
      dataIndex: 'first_name',
      key: 'first_name',
      width: '20%',
      align: 'center',
      render: text => <div style={{ fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{text}</div>,
    },
    {
      title: <div style={{ fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Last Name</div>,
      dataIndex: 'last_name',
      key: 'last_name',
      width: '25%',
      align: 'center',
      render: text => <div style={{ fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{text}</div>,
    },
    {
      title: <div style={{ fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Event Type</div>,
      dataIndex: 'alarm_name',
      key: 'alarm_name',
      width: '20%',
      align: 'center',
      render: text => <div style={{ fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{text}</div>,
    },
    {
      title: <div style={{ fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Time</div>,
      dataIndex: 'time',
      key: 'time',
      width: '25%',
      align: 'center',
      render: text => <div style={{ fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{text}</div>,
    },
  ];

  const getAlarms = async () => {
    try {
      const response = await axios.get('http://localhost:10000/cms/alarms');
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
    const socket = socketIOClient(ENDPOINT);

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
          <Col style={{height: '800px'}}span={24}>
            <div style={{ height: '90%', overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <Table
                columns={columns}
                pagination={false}
                dataSource={alarms.map(alarm => ({ ...alarm, key: alarm.alarm_id }))}
                rowClassName={(record) => style[getBackgroundColor(record.alarm_name)]}
              />
            </div>
          </Col>
        </Row>
      </div>
    </>

  )
}

export default App
