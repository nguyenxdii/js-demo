import React, { useState, useEffect, useMemo } from "react";
import { Table, Tag, Button, message, Space, Card, Avatar, Typography, Input, Select } from "antd";
import { UserOutlined, LockOutlined, UnlockOutlined, SearchOutlined } from "@ant-design/icons";
import axiosInstance from "../../../services/api";

const { Text } = Typography;
const { Option } = Select;

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get("/users");
            const mappedUsers = response.data.map(u => ({ ...u, id: u._id || u.id }));
            setUsers(mappedUsers);
        } catch (error) {
            message.error("Lỗi khi tải danh sách người dùng");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch = 
                user.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchText.toLowerCase()) ||
                user.phoneNumber?.includes(searchText);
            
            const matchesStatus = 
                statusFilter === "ALL" || 
                (statusFilter === "LOCKED" && user.locked) || 
                (statusFilter === "ACTIVE" && !user.locked);
            
            return matchesSearch && matchesStatus;
        });
    }, [users, searchText, statusFilter]);

    const toggleLock = async (userId, isLocked) => {
        try {
            const action = isLocked ? "unlock" : "lock";
            await axiosInstance.put(`/users/${userId}/toggle-lock`);
            message.success(`${isLocked ? "Mở khóa" : "Khóa"} người dùng thành công`);
            fetchUsers();
        } catch (error) {
            message.error("Lỗi khi thay đổi trạng thái người dùng");
        }
    };

    const columns = [
        {
            title: "Người dùng",
            key: "user",
            render: (_, record) => (
                <Space>
                    <Avatar src={record.avatarUrl} icon={<UserOutlined />} />
                    <div>
                        <div className="font-bold">{record.fullName}</div>
                        <div className="text-gray-400 text-xs">{record.email}</div>
                    </div>
                </Space>
            )
        },
        { title: "SĐT", dataIndex: "phoneNumber", key: "phoneNumber" },
        { 
            title: "Vai trò", 
            dataIndex: "role", 
            render: (role) => <Tag color={role === 'ADMIN' ? 'red' : 'blue'}>{role}</Tag> 
        },
        {
            title: "Trạng thái",
            dataIndex: "locked",
            render: (locked) => (
                <Tag color={locked ? "error" : "success"}>
                    {locked ? "Bị khóa" : "Hoạt động"}
                </Tag>
            )
        },
        {
            title: "Thao tác",
            key: "action",
            render: (_, record) => (
                record.role !== 'ADMIN' && (
                    <Button 
                        danger={!record.locked}
                        icon={record.locked ? <UnlockOutlined /> : <LockOutlined />}
                        onClick={() => toggleLock(record.id, record.locked)}
                    >
                        {record.locked ? "Mở khóa" : "Khóa tài khoản"}
                    </Button>
                )
            )
        }
    ];

    return (
        <Card 
            title={<div className="font-bold text-lg">Quản lý người dùng</div>} 
            className="shadow-sm border-none rounded-2xl"
            extra={
                <Space>
                    <Input 
                        placeholder="Tên, email, sđt..." 
                        prefix={<SearchOutlined />} 
                        onChange={e => setSearchText(e.target.value)}
                        style={{ width: 250 }}
                        allowClear
                    />
                    <Select defaultValue="ALL" style={{ width: 150 }} onChange={val => setStatusFilter(val)}>
                        <Option value="ALL">Tất cả trạng thái</Option>
                        <Option value="LOCKED">Bị khóa</Option>
                        <Option value="ACTIVE">Đang hoạt động</Option>
                    </Select>
                </Space>
            }
        >
            <Table columns={columns} dataSource={filteredUsers} rowKey="id" loading={loading} />
        </Card>
    );
};

export default UserManagement;
