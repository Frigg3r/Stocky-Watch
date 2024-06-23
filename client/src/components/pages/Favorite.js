import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Button, notification, Modal } from 'antd';
import { EyeOutlined, HeartFilled } from '@ant-design/icons';
import { ApiService } from '../../services/api.service';
import '../../styles/Store.css'; // Assuming styles are in the same directory

const apiService = new ApiService();

function Favorite({ currentUserInfo }) {
    const [favorites, setFavorites] = useState([]);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [itemRecord, setItemRecord] = useState({});
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        if (currentUserInfo && currentUserInfo.id) {
            fetchFavorites();
        }
        fetchCategories();
    }, [currentUserInfo]);

    function fetchFavorites() {
        apiService.getFavorites(currentUserInfo.id).then(res => {
            setFavorites(res || []);
        }).catch(err => {
            notification.error({ message: 'Ошибка при загрузке избранных', description: 'Не удалось получить данные с сервера.' });
        });
    }

    function fetchCategories() {
        apiService.getCategories().then(res => {
            setCategories(res || []);
        }).catch(err => {
            notification.error({ message: 'Ошибка загрузки категорий', description: 'Не удалось получить данные с сервера.' });
        });
    }

    function removeFromFavorites(itemId) {
        apiService.removeFromFavorites(currentUserInfo.id, itemId).then(response => {
            notification.success({ message: response.message });
            fetchFavorites(); // Обновляем список после удаления
        }).catch(err => {
            notification.error({ message: 'Ошибка при удалении из избранного', description: err.message });
        });
    }

    const fetchItemWithDetails = (id) => {
        return apiService.get(`/item/${id}`).then(item => {
            return {
                ...item,
                categories: item.categories || [],
                characteristics: item.characteristics.map(c => ({
                    id_characteristic: c.id_characteristic,
                    name: c.name,
                    value: c.value
                })) || [],
                photo: item.photo || ''
            };
        });
    };

    const showItemDetails = (item) => {
        fetchItemWithDetails(item.id).then(fullItem => {
            setItemRecord(fullItem);
            setDetailModalVisible(true);
        });
    };

    const getCategoryNames = (categoryIds) => {
        return categoryIds.map(categoryId => {
            const category = categories.find(c => c.id_category === categoryId);
            return category ? category.name : '';
        }).filter(name => name).join(', ');
    };

    return (
        <>
            <Row gutter={16}>
                {favorites.map(item => (
                    <Col key={item.id} xs={24} sm={12} md={8} lg={6}>
                        <Card
                            hoverable
                            title={item.name}
                            extra={<>
                                <Button type="link" onClick={() => showItemDetails(item)} className="icon-button">
                                    <EyeOutlined />
                                </Button>
                                <Button
                                    type="link"
                                    onClick={() => removeFromFavorites(item.id)}
                                    icon={<HeartFilled className="icon-button filled" />}
                                    danger
                                />
                            </>}
                            style={{ marginBottom: 16 }}
                        >
                            <img src={item.photo} alt={item.name} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                            <p>Бренд: {item.brand_name}</p>
                            <p>Количество: {item.quantity}</p>
                            <p>Стоимость: ${item.cost}</p>
                        </Card>
                    </Col>
                ))}
            </Row>
            {detailModalVisible && (
                <Modal
                    title={`Описание`}
                    visible={detailModalVisible}
                    onCancel={() => setDetailModalVisible(false)}
                    footer={[
                        <Button key="close" onClick={() => setDetailModalVisible(false)}>Закрыть</Button>
                    ]}
                    style={{ top: 20 }}
                    width={800}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <img src={itemRecord.photo} alt={itemRecord.name} style={{ width: '100%', height: '400px', objectFit: 'cover', borderRadius: '16px', marginBottom: '20px' }} />
                        <div style={{ textAlign: 'left', width: '100%' }}>
                            <p><strong>Бренд:</strong> {itemRecord.brand_name}</p>
                            <p><strong>Страна:</strong> {itemRecord.country_name}</p>
                            <p><strong>Описание:</strong> {itemRecord.description}</p>
                            <p><strong>Количество:</strong> {itemRecord.quantity}</p>
                            <p><strong>Стоимость:</strong> ${itemRecord.cost}</p>
                            <p><strong>Категории:</strong> {getCategoryNames(itemRecord.categories)}</p>
                            <p><strong>Характеристики:</strong></p>
                            <ul>
                                {itemRecord.characteristics.map(c => (
                                    <li key={c.id_characteristic}>{c.name}: {c.value}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </Modal>
            )}
        </>
    );
}

export default Favorite;
