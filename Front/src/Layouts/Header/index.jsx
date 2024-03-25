import React from "react";
import { Row, Typography } from "antd";
import style from './style.module.scss'

const { pathname } = window.location

const Index = () => {
    return (
        <div className={style.Header} >
            <Typography style={{ height: "100%" }} className={style.Toptext}>
                {pathname}
            </Typography>
        </div>
    );
};

export default Index;
