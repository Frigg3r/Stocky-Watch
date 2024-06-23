import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Row, Col } from 'antd';
import { ApiService } from '../../services/api.service';
import '../../styles/UserProfile.css'; // Import CSS file

const apiService = new ApiService();

function UserProfile({ currentUserInfo, setCurrentUserInfo }) {
    const [form] = Form.useForm();
    const [isEditing, setIsEditing] = useState({
        name: false,
        lastname: false,
        email: false,
        phone: false,
    });

    useEffect(() => {
        if (currentUserInfo) {
            form.setFieldsValue(currentUserInfo);
        }
    }, [currentUserInfo, form]);

    const handleEditClick = (field) => {
        setIsEditing((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    const handleUpdate = async () => {
        try {
            const values = form.getFieldsValue();
            const response = await apiService.updateUser(currentUserInfo.id, values);
            if (response.success) {
                setCurrentUserInfo(response.userInfo);
                setIsEditing({ name: false, lastname: false, email: false, phone: false });
            }
        } catch (error) {
            console.error('Failed to update user info:', error);
        }
    };

    return (
        <div className="user-profile">
            <h1>Личный кабинет</h1>
            <Form form={form} layout="vertical">
                <Form.Item label="Логин" name="login">
                    <Input disabled />
                </Form.Item>
                <Row gutter={16}>
                    <Col span={18}>
                        <Form.Item label="Имя" name="name">
                            <Input disabled={!isEditing.name} />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Button className="edit-button" onClick={() => handleEditClick('name')}>
                            {isEditing.name ? 'Сохранить' : 'Редактировать'}
                        </Button>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={18}>
                        <Form.Item label="Фамилия" name="lastname">
                            <Input disabled={!isEditing.lastname} />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Button className="edit-button" onClick={() => handleEditClick('lastname')}>
                            {isEditing.lastname ? 'Сохранить' : 'Редактировать'}
                        </Button>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={18}>
                        <Form.Item label="Почта" name="email">
                            <Input disabled={!isEditing.email} />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Button className="edit-button" onClick={() => handleEditClick('email')}>
                            {isEditing.email ? 'Сохранить' : 'Редактировать'}
                        </Button>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={18}>
                        <Form.Item label="Номер телефона" name="phone">
                            <Input disabled={!isEditing.phone} />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Button className="edit-button" onClick={() => handleEditClick('phone')}>
                            {isEditing.phone ? 'Сохранить' : 'Редактировать'}
                        </Button>
                    </Col>
                </Row>
                <Button type="primary" className="save-all-button" onClick={handleUpdate}>
                    Сохранить все изменения
                </Button>
            </Form>
        </div>
    );
}

export default UserProfile;
