import React, { useState, useEffect } from 'react';
import { Row, Col, Typography, Collapse } from "antd";
import { Button, Drawer } from 'antd';
import axios from "axios";

const App = (props) => {
    const [submissionsData, setSubmissionsData] = useState([]);

    useEffect(() => {
        if (props.data.submissions && props.data.submissions.length > 0) {
            props.data.submissions.forEach(submission => {
                getSubmission(submission.submission_id);
            });
        }
    }, [props.data.submissions]);

    const onClose = () => {
        setSubmissionsData([])
        props.close();
    };

    const getSubmission = async (id) => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BASE_API}/cms/comparisons/${id}`);
    
            const filteredData = response.data.filter(item => item.submission_id === id);

            setSubmissionsData(prevData => [...prevData, { id: id, data: filteredData }]);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <>
            <Drawer title={`${props?.data?.first_name} ${props?.data?.last_name}  ${props?.data?.username}`} onClose={onClose} open={props.open}>
                <Row style={{ margin: "20px" }}>
                    <Col span={4} >ID:</Col>
                    <Col span={4}>{props?.data?.id}</Col>
                </Row>
                <Row style={{ margin: "20px" }}>
                    <Col span={4}>Email:</Col>
                    <Col span={20}>{props?.data?.email} </Col>
                </Row>
                <Row style={{ margin: "50px 20px 1  0px 20px", display: 'flex', justifyContent: 'center' }}>
                    <Typography style={{ fontSize: "24px", fontWeight: "600" }}>
                        SUBMISSIONS:
                    </Typography>
                </Row>
                {props?.data?.submissions?.length == 0 &&
                    <Row style={{ margin: "20px" }}>
                        <Typography style={{ fontSize: "20px", fontWeight: "500" }}>
                            No submission for now
                        </Typography>
                    </Row>
                }
                {props?.data?.submissions?.map((val, index) => (
                    <Row key={index} style={{ margin: "20px" }}>
                        <Collapse
                            style={{ width: "100%" }}
                            items={
                                [
                                    {
                                        key: { index },
                                        label:
                                            <div>
                                                <Typography style={{ fontSize: "16px", fontWeight: "600" }}>
                                                    Submission number {val?.submission_id}:
                                                </Typography>
                                                < Typography style={{ fontSize: "16px", fontWeight: "600" }}>
                                                    {val?.submission_date}:
                                                </Typography>
                                            </div>,
                                        children:
                                            <div>
                                                <Typography style={{ padding: "20px", border: '1px solid black', borderRadius: "5px" }}>{val?.code}</Typography>
                                                {submissionsData.filter(submissionsData => submissionsData.id == val?.submission_id)[0]?.data.map((score, index) => (
                                                    <Typography style={{ padding: "20px", border: '1px solid black', borderRadius: "5px" }}>
                                                        Similarity of this submission with submission {score?.submission_id != val?.submission_id ? score.submission_id : score.compared_contestant_id} is {score.similarity_score}
                                                    </Typography>
                                                ))}
                                            </div>,
                                    }
                                ]
                            }
                            defaultActiveKey={['1']}
                        />

                    </Row>
                ))}
            </Drawer>
        </>
    );
};
export default App;