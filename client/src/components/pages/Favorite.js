import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Button, notification } from 'antd';
import { ApiService } from '../../services/api.service';
import { DeleteOutlined } from '@ant-design/icons';

const apiService = new ApiService();

function Favorite({ currentUserInfo }) {
    const [favorites, setFavorites] = useState([]);

    useEffect(() => {
        if (currentUserInfo && currentUserInfo.id) {
            fetchFavorites();
        }
    }, [currentUserInfo]);

    function fetchFavorites() {
        apiService.getFavorites(currentUserInfo.id).then(res => {
            setFavorites(res || []);
        }).catch(err => {
            notification.error({ message: 'Error fetching favorites', description: 'Could not retrieve data from server.' });
        });
    }

    function removeFromFavorites(itemId) {
        apiService.removeFromFavorites(currentUserInfo.id, itemId).then(response => {
            notification.success({ message: response.message });
            fetchFavorites(); // Обновляем список после удаления
        }).catch(err => {
            notification.error({ message: 'Error removing from favorites', description: err.message });
        });
    }

    return (
        <Row gutter={16}>
            {favorites.map(item => (
                <Col key={item.id} xs={24} sm={12} md={8} lg={6}>
                    <Card
                        hoverable
                        title={item.name}
                        extra={
                            <Button
                                type="link"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => removeFromFavorites(item.id)}
                            />
                        }
                        style={{ marginBottom: 16 }}
                    >
                        <img src={item.photo} alt={item.name} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                        <p>{item.description}</p>
                        <p>Brand: {item.brand_name}</p>
                        <p>Country: {item.country_name}</p>
                        <p>Quantity: {item.quantity}</p>
                        <p>Cost: ${item.cost}</p>
                    </Card>
                </Col>
            ))}
        </Row>
    );
}

export default Favorite;
