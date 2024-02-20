import React from "react";
import { useNavigate } from "react-router-dom";
import { Menu } from 'antd';

import {
  HomeOutlined,
  AppstoreOutlined,
  ReadOutlined,
} from "@ant-design/icons";

const getItem = (label, key, url, icon, children) => ({
  label,
  key,
  url,
  icon,
  children,
});

const items = [
  getItem(
    "Notification Based",
    "notification",
    `${import.meta.env.VITE_NOTIFICATION}`,
    <HomeOutlined />
  ),
  getItem(
    "User Based",
    "user",
    `${import.meta.env.VITE_USER}`,
    <AppstoreOutlined />
  ),
  getItem(
    "Seat Based",
    "seat",
    `${import.meta.env.VITE_SEAT}`,
    <ReadOutlined />
  ),
];

const Index = () => {
  const Navigation = useNavigate();
  const onSelect = (event) => {
    const { keyPath } = event;
    const path = keyPath.reverse();
    const { length } = path;
    let url;
    switch (length) {
      case 1: {
        url = items.find((value) => value.key === path[0]).url;
        break;
      }
      case 2: {
        const children = items.find((value) => value.key === path[0]).children;
        url = children.find((value) => value.key === path[1]).url;
        break;
      }
      default:
        url = import.meta.env.VITE_HOME;
    }
    Navigation(url);
  };
  return (
    <Menu
    defaultSelectedKeys="user"
      theme="dark"
      mode="inline"
      items={items}
      onSelect={onSelect}
    />
  );
};
export default Index;
