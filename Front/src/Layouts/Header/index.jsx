import React from "react";
import { Row, Typography } from "antd";
import style from './style.module.scss';
import { useLocation } from 'react-router-dom';

const Index = () => {
    const location = useLocation();

    return (
        <div className={style.Header} >
            <Typography style={{ height: "100%" }} className={style.Toptext}>
                {location.pathname}
            </Typography>
        </div>
    );
};

export default Index;