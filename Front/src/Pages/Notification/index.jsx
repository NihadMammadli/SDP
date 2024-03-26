import { useState, useEffect } from 'react'
import { Row, Col, Card, Typography, message, Button } from "antd";
import axios from "axios"
import style from "./style.module.scss"
import './style.css'

function App() {
  const [messageApi, contextHolder] = message.useMessage();

  const [alarms, setAlarms] = useState([])

  const getAlarms = async () => {
    try {
      const response = await axios.get('http://localhost:10000/cms/alarms');
      console.log(response?.data)
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

  return (

    <>
      {contextHolder}
      <div>
        <Row>
          <Col span={24}>
            {alarms.map(alarm => (
              <Card
                style={{height:100, backgroundColor: getBackgroundColor(alarm.alarm_name), margin:"15px 5px 15px 5px", boxShadow: '0px 4px 5px rgba(0, 0, 1, 0.3)'}}
                key={alarm.id}
              >
                <Row style={{ marginBottom: "20px" }}>
                  <Col span={12}>
                    <Typography className={style.alarmTopRow}>
                      {alarm?.alarm_name}
                    </Typography>
                  </Col>
                  <Col span={12}>
                    <Typography className={style.alarmTopRow} style={{justifyContent:"end"}}>
                      Time: {alarm?.time}
                    </Typography>
                  </Col>
                </Row>
                <Row>
                  <Col span={4}>
                    <Typography className={style.alarmBottomRow}>
                      UserID: {alarm?.user_id}
                    </Typography>
                  </Col>
                  <Col span={9}>
                    <Typography className={style.alarmBottomRow}>
                      Name: {alarm?.first_name}
                    </Typography>
                  </Col>
                  <Col span={11}>
                    <Typography className={style.alarmBottomRow}>
                      Surname: {alarm?.last_name}
                    </Typography>
                  </Col>

                </Row>
              </Card>
            ))}
          </Col>
        </Row>
      </div>
    </>

  )
}

export default App
