import React, { Suspense } from "react";
import { Result, Button, Spin } from "antd";
import { Route, Link, Routes, BrowserRouter, } from "react-router-dom";
import Layout from "../Layouts";
import { Competitors, Alarms, Seats } from '../Pages';


const Index = () => {
    return (
        <BrowserRouter>
            <Suspense>
                <Routes>
                    <Route path="cms" element={<Layout />}>
                        <Route path='competitors' element={<Competitors />} />
                        <Route path='alarms' element={<Alarms />} />
                        <Route path='seats' element={<Seats />} />
                    </Route>
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
};

export default Index;
