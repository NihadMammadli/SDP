import { useState, useEffect } from 'react'
import { Row, Col, Table, Typography, message, Button } from "antd";
import View from './View'
import axios from "axios"

function App() {
  const [messageApi, contextHolder] = message.useMessage();

  const [users, setUsers] = useState([])
  const [viewOpen, setViewOpen] = useState(false)
  const [viewData, setViewData] = useState(false)

  const columns = [
    {
      title: <div style={{ fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>ID</div>,
      dataIndex: 'id',
      key: 'id',
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
      title: <div style={{ fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Username</div>,
      dataIndex: 'username',
      key: 'username',
      width: '20%',
      align: 'center',
      render: text => <div style={{ fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{text}</div>,
    },
    {
      title: <div style={{ fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Email</div>,
      dataIndex: 'email',
      key: 'email',
      width: '25%',
      align: 'center',
      render: text => <div style={{ fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{text}</div>,
    },
  ];

  const showView = (data, index) => {
    setViewOpen(true)
    setViewData(data)
  }

  const viewClose = () => {
    setViewOpen(false)
  }

  const fetchSections = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_API}/cms/users`);
      setUsers(response?.data);
    } catch (error) {
      console.error('Error fetching sections:', error);
      messageApi.error('Error fetching sections');
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  return (

    <>
      {contextHolder}
      <div>
        <Row>
        <Col style={{height: '800px'}}span={24}>
            <div style={{ height: '90%', overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <Table
                columns={columns}
                pagination={false}
                dataSource={users.map(user => ({ ...user, key: user.id }))}
                onRow={(record, rowIndex) => ({ onClick: () => showView(record, rowIndex) })}
              />
            </div>
          </Col>
        </Row>
      </div>

      <View open={viewOpen} close={viewClose} data={viewData} />
    </>

  )
}

export default App
