import React, { Suspense } from "react";
import { Result, Button, Spin } from "antd";
import { Route, Link, Routes, BrowserRouter, } from "react-router-dom";
import Layout from "../Layouts";
import { User, Notification, Seat } from '../Pages';


const Index = () => {
    return (
        <BrowserRouter>
            <Suspense>
                <Routes>
                    <Route path="cms" element={<Layout />}>
                        <Route path='user' element={<User />} />
                        <Route path='notification' element={<Notification />} />
                        <Route path='seat' element={<Seat />} />
                        {/* ---------status message--------- */}
                        <Route
                            path="404"
                            element={
                                <Result
                                    status="404"
                                    title="404"
                                    subTitle="Üzr istəyirik: Daxil etdiyiniz səhifə tapılmadı."
                                    extra={
                                        <Link to={import.meta.env.VITE_HOME}>
                                            <Button type="primary">Ana Səhifə</Button>
                                        </Link>
                                    }
                                />
                            }
                        />
                        <Route
                            path="500"
                            element={
                                <Result
                                    status="500"
                                    title="500"
                                    subTitle="Üzr istəyirik: Gözlənilməyən xəta baş verdi"
                                    extra={
                                        <Link to={import.meta.env.VITE_HOME}>
                                            <Button type="primary">Ana Səhifə</Button>
                                        </Link>
                                    }
                                />
                            }
                        />
                        {/* ---------status message--------- */}

                    </Route>
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
};

export default Index;
