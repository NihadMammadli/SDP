import React, { useState } from 'react';
import { Row, Col, Typography, Collapse } from "antd";
import { Button, Drawer } from 'antd';
const App = (props) => {
    const onClose = () => {
        props.close();
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
                <Row style={{ margin: "50px 20px 1  0px 20px", display:'flex', justifyContent:'center' }}>
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
                                            <Typography style={{ fontSize: "16px", fontWeight: "600" }}>
                                                Submission number {val?.id}:
                                            </Typography>,
                                        children:
                                            <div>
                                                <Typography style={{ padding: "20px", border: '1px solid black', borderRadius: "5px" }}>{val?.content}</Typography>
                                                {val?.files && val.files.map((file, fileIndex) => (
                                                    <div style={{ marginTop: "10px", paddingBottom:"20px", borderBottom: "1px solid black" }} key={fileIndex}>
                                                        <Typography  style={{ fontSize: "12px", fontWeight: "600", marginBottom:"10px"}}>
                                                            Similarity with submission number {file.fileId.substring(2, 4)} from user with id {file.fileId.substring(0, 1)}:
                                                        </Typography>
                                                        <Typography  style={{ fontSize: "17px", fontWeight: "600", display:'flex', justifyContent:"center", marginBottom:"10px"}}>
                                                            {file?.similarity}%
                                                        </Typography>
                                                        {file?.commonLines?.length != 0 &&
                                                            <Collapse
                                                                style={{ width: "100%" }}
                                                                items={
                                                                    [
                                                                        {
                                                                            key: { fileIndex },
                                                                            label:
                                                                                <Typography style={{ fontSize: "14px", fontWeight: "400" }}>
                                                                                    Common Lines
                                                                                </Typography>,
                                                                            children:
                                                                                <div >
                                                                                    {file?.commonLines && file?.commonLines?.map((line, lineIndex) => (
                                                                                        <div key={fileIndex}>
                                                                                            <Typography>
                                                                                                {line}
                                                                                            </Typography>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>,
                                                                        }
                                                                    ]
                                                                }
                                                            />
                                                        }
                                                    </div>
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