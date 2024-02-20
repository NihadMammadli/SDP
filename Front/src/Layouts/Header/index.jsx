import React from "react";
import { Row, Typography } from "antd";
import style from './style.module.scss'

const Index = () => {
    return (
        <div className={style.Header} style={{}}>
            <Typography style={{ height: "60px" }} className={style.Toptext}>
                CMS
            </Typography>
        </div>
    );
};

export default Index;
