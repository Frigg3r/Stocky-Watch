import React, { useEffect, useState } from 'react';
import { Button, Card, Modal, Form, Input, notification, Col, Row } from 'antd';
import { PlusOutlined, ReloadOutlined, EyeOutlined, EditOutlined, HeartOutlined } from '@ant-design/icons';
import { ApiService } from '../../services/api.service';
import '../../styles/CrudExample.css';

const apiService = new ApiService();

function CrudExample({ searchQuery, setSearchQuery, currentUserInfo }) {
    const [items, setItems] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [itemRecord, setItemRecord] = useState({});

    useEffect(() => {
        fetchData();
    }, [searchQuery]);

    function fetchData() {
        const endpoint = searchQuery ? `/search?name=${encodeURIComponent(searchQuery)}` : '/items';
        apiService.get(endpoint).then(res => {
            setItems(res || []);
        }).catch(err => {
            notification.error({ message: 'Error fetching items', description: 'Could not retrieve data from server.' });
        });
    }

    function showItemDetails(item) {
        setItemRecord(item);
        setDetailModalVisible(true);
    }

    function showItem(item = {}) {
        setItemRecord(item);
        setModalVisible(true);
    }

    function saveItem() {
        const method = itemRecord.id ? 'put' : 'post';
        apiService[method](`/item${itemRecord.id ? '/' + itemRecord.id : ''}`, itemRecord).then(() => {
            fetchData();  // Обновляем список после сохранения
            closeModal();
            notification.success({ message: 'Item saved successfully' });
        }).catch(err => {
            notification.error({ message: `Error saving item: ${err}`, description: err.message });
        });
    }

    function removeItem() {
        apiService.delete(`/item/${itemRecord.id}`).then(() => {
            fetchData();  // Обновляем список после удаления
            closeModal();
            notification.success({ message: 'Item deleted successfully' });
        }).catch(err => {
            notification.error({ message: 'Error deleting item', description: err.message });
        });
    }

    function addToFavorites(itemId) {
        console.log('Current user info:', currentUserInfo); // Debugging information
        if (currentUserInfo && currentUserInfo.id) {
            apiService.postToFavorites(currentUserInfo.id, itemId).then(() => {
                notification.success({ message: 'Added to favorites successfully' });
            }).catch(err => {
                notification.error({ message: 'Error adding to favorites', description: err.message });
            });
        } else {
            notification.error({ message: 'You need to log in to add to favorites' });
        }
    }

    function closeModal() {
        setModalVisible(false);
        setDetailModalVisible(false);
        setItemRecord({});
    }

    function resetSearch() {
        setSearchQuery('');  // Сбрасываем поисковый запрос
        fetchData();  // Загружаем все элементы
    }

    return (
        <>
            <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col>
                    <Button type="default" icon={<ReloadOutlined />} onClick={resetSearch}>
                        Reset Search
                    </Button>
                </Col>
                {currentUserInfo && currentUserInfo.role === "admin" && (
                    <Col>
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => showItem({})}>
                            Add New Item
                        </Button>
                    </Col>
                )}
            </Row>
            <Row gutter={16}>
                {items.map(item => (
                    <Col key={item.id} xs={24} sm={12} md={8} lg={6}>
                        <Card
                            hoverable
                            title={item.name}
                            extra={<>
                                <Button type="link" onClick={() => showItemDetails(item)}>
                                    <EyeOutlined />
                                </Button>
                                {currentUserInfo && currentUserInfo.role === "admin" && (
                                    <Button type="link" onClick={() => showItem(item)}>
                                        <EditOutlined />
                                    </Button>
                                )}
                                <Button type="link" onClick={() => addToFavorites(item.id)}>
                                    <HeartOutlined />
                                </Button>
                            </>}
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
            {modalVisible && (
                <Modal
                    title={itemRecord.id ? `Edit Item ${itemRecord.id}` : 'Add New Item'}
                    visible={modalVisible}
                    onOk={saveItem}
                    onCancel={closeModal}
                    footer={[
                        <Button key="back" onClick={closeModal}>Cancel</Button>,
                        <Button key="delete" danger onClick={removeItem}>Delete</Button>,
                        <Button key="submit" type="primary" onClick={saveItem}>Save</Button>
                    ]}
                >
                    <Form layout="vertical" onFinish={saveItem} initialValues={{ ...itemRecord }}>
                        <Form.Item label="Name" name="name">
                            <Input onChange={e => setItemRecord({ ...itemRecord, name: e.target.value })} />
                        </Form.Item>
                        <Form.Item label="Description" name="description">
                            <Input.TextArea onChange={e => setItemRecord({ ...itemRecord, description: e.target.value })} />
                        </Form.Item>
                        <Form.Item label="Brand ID" name="id_brand">
                            <Input type="number" onChange={e => setItemRecord({ ...itemRecord, id_brand: parseInt(e.target.value, 10) })} />
                        </Form.Item>
                        <Form.Item label="Country ID" name="id_country">
                            <Input type="number" onChange={e => setItemRecord({ ...itemRecord, id_country: parseInt(e.target.value, 10) })} />
                        </Form.Item>
                        <Form.Item label="Quantity" name="quantity">
                            <Input type="number" onChange={e => setItemRecord({ ...itemRecord, quantity: parseInt(e.target.value, 10) })} />
                        </Form.Item>
                        <Form.Item label="Cost" name="cost">
                            <Input
                                prefix="$"
                                type="number"
                                onChange={e => setItemRecord({ ...itemRecord, cost: parseFloat(e.target.value) })}
                            />
                        </Form.Item>
                    </Form>
                </Modal>
            )}
            {detailModalVisible && (
                <Modal
                    title={`Details for ${itemRecord.name}`}
                    visible={detailModalVisible}
                    onCancel={() => setDetailModalVisible(false)}
                    footer={[
                        <Button key="close" onClick={() => setDetailModalVisible(false)}>Close</Button>
                    ]}
                >
                    <p><strong>Brand:</strong> {itemRecord.brand_name}</p>
                    <p><strong>Country:</strong> {itemRecord.country_name}</p>
                    <p><strong>Description:</strong> {itemRecord.description}</p>
                    <img src={itemRecord.photo} alt={itemRecord.name} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                    <p><strong>Quantity:</strong> {itemRecord.quantity}</p>
                    <p><strong>Cost:</strong> ${itemRecord.cost}</p>
                </Modal>
            )}
        </>
    );
}

export default CrudExample;
