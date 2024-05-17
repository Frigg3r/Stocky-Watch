import React, { useEffect, useState } from 'react';
import { Button, Card, Modal, Form, Input, notification, Col, Row, Select } from 'antd';
import { PlusOutlined, ReloadOutlined, EyeOutlined, EditOutlined, HeartOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { ApiService } from '../../services/api.service';
import '../../styles/CrudExample.css';

const apiService = new ApiService();
const { Option } = Select;

function CrudExample({ searchQuery, setSearchQuery, currentUserInfo }) {
    const [items, setItems] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [itemRecord, setItemRecord] = useState({});
    const [categories, setCategories] = useState([]);
    const [characteristics, setCharacteristics] = useState([]);
    const [brands, setBrands] = useState([]);
    const [countries, setCountries] = useState([]);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchData();
        fetchCategories();
        fetchCharacteristics();
        fetchBrands();
        fetchCountries();
    }, [searchQuery]);

    function fetchData() {
        const endpoint = searchQuery ? `/search?name=${encodeURIComponent(searchQuery)}` : '/items';
        apiService.get(endpoint).then(res => {
            setItems(res || []);
        }).catch(err => {
            notification.error({ message: 'Error fetching items', description: 'Could not retrieve data from server.' });
        });
    }

    function fetchCategories() {
        apiService.get('/categories').then(res => {
            setCategories(res || []);
        }).catch(err => {
            notification.error({ message: 'Error fetching categories', description: 'Could not retrieve data from server.' });
        });
    }

    function fetchCharacteristics() {
        apiService.get('/characteristics').then(res => {
            setCharacteristics(res || []);
        }).catch(err => {
            notification.error({ message: 'Error fetching characteristics', description: 'Could not retrieve data from server.' });
        });
    }

    function fetchBrands() {
        apiService.get('/brands').then(res => {
            setBrands(res || []);
        }).catch(err => {
            notification.error({ message: 'Error fetching brands', description: 'Could not retrieve data from server.' });
        });
    }

    function fetchCountries() {
        apiService.get('/countries').then(res => {
            setCountries(res || []);
        }).catch(err => {
            notification.error({ message: 'Error fetching countries', description: 'Could not retrieve data from server.' });
        });
    }

    function fetchItemWithDetails(id) {
        return apiService.get(`/item/${id}`).then(item => {
            return {
                ...item,
                categories: item.categories || [],
                characteristics: item.characteristics || [],
                photo: item.photo || ''
            };
        });
    }

    function showItemDetails(item) {
        fetchItemWithDetails(item.id).then(fullItem => {
            setItemRecord(fullItem);
            setDetailModalVisible(true);
        });
    }

    function showItem(item = {}) {
        form.resetFields(); // Reset the form fields before setting modal visible
        if (item.id) {
            fetchItemWithDetails(item.id).then(fullItem => {
                setItemRecord(fullItem);
                form.setFieldsValue(fullItem);
                setModalVisible(true);
            });
        } else {
            setItemRecord({}); // Reset itemRecord to an empty object
            setModalVisible(true); // Open the modal after resetting the state
            form.setFieldsValue({ 
                name: '', 
                description: '', 
                id_brand: '', 
                id_country: '', 
                quantity: '', 
                cost: '', 
                categories: [], 
                characteristics: [], 
                photo: '' 
            }); // Ensure form fields are reset
        }
    }

    function saveItem() {
        form.validateFields().then(values => {
            const method = itemRecord.id ? 'put' : 'post';
            apiService[method](`/item${itemRecord.id ? '/' + itemRecord.id : ''}`, { ...itemRecord, ...values }).then(item => {
                // Сохраняем фото после создания/редактирования товара
                if (values.photo) {
                    const photoMethod = itemRecord.id ? 'put' : 'post';
                    const photoEndpoint = itemRecord.id ? `/photo/${itemRecord.id}` : '/photo';
                    apiService[photoMethod](photoEndpoint, { id_item: item.id, url: values.photo }).then(photoResponse => {
                        console.log('Photo saved:', photoResponse); // Логирование ответа
                        fetchData();  // Обновляем список после сохранения
                        closeModal();
                        notification.success({ message: 'Item saved successfully' });
                    }).catch(err => {
                        console.error('Error saving photo:', err); // Логирование ошибки
                        notification.error({ message: 'Error saving photo', description: err.message });
                    });
                } else {
                    fetchData();  // Обновляем список после сохранения
                    closeModal();
                    notification.success({ message: 'Item saved successfully' });
                }
            }).catch(err => {
                notification.error({ message: `Error saving item: ${err}`, description: err.message });
            });
        }).catch(info => {
            console.log('Validate Failed:', info);
        });
    }

    function removeItem() {
        apiService.delete(`/item/${itemRecord.id}`).then(() => {
            fetchData();  // Обновляем список после удаления
            closeModal();
            notification.success({ message: 'Item deleted successfully' });
        }).catch(err => {
            console.error('Error deleting item:', err); // Логирование ошибки на клиенте
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
        form.resetFields();
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
                            <p>Brand: {item.brand_name}</p>
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
                        itemRecord.id && (
                            <Button key="delete" danger onClick={removeItem}>Delete</Button>
                        ),
                        <Button key="submit" type="primary" onClick={saveItem}>Save</Button>
                    ]}
                >
                    <Form form={form} layout="vertical" onFinish={saveItem} initialValues={{ ...itemRecord }}>
                        <Form.Item label="Name" name="name" rules={[{ required: true, message: 'Please input the name!' }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item label="Description" name="description" rules={[{ required: true, message: 'Please input the description!' }]}>
                            <Input.TextArea />
                        </Form.Item>
                        <Form.Item label="Brand" name="id_brand" rules={[{ required: true, message: 'Please select the brand!' }]}>
                            <Select placeholder="Select brand">
                                {brands.map(brand => (
                                    <Option key={brand.id_brand} value={brand.id_brand}>
                                        {brand.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item label="Country" name="id_country" rules={[{ required: true, message: 'Please select the country!' }]}>
                            <Select placeholder="Select country">
                                {countries.map(country => (
                                    <Option key={country.id_country} value={country.id_country}>
                                        {country.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item label="Quantity" name="quantity" rules={[{ required: true, message: 'Please input the quantity!' }]}>
                            <Input type="number" />
                        </Form.Item>
                        <Form.Item label="Cost" name="cost" rules={[{ required: true, message: 'Please input the cost!' }]}>
                            <Input prefix="$" type="number" />
                        </Form.Item>
                        <Form.Item label="Photo URL" name="photo" rules={[{ required: true, message: 'Please input the photo URL!' }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item label="Categories" name="categories" initialValue={itemRecord.categories || []}>
                            <Select mode="multiple" placeholder="Select categories">
                                {categories.map(category => (
                                    <Option key={category.id_category} value={category.id_category}>
                                        {category.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.List name="characteristics" initialValue={itemRecord.characteristics || []}>
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map(({ key, name, fieldKey, ...restField }) => (
                                        <Row gutter={16} key={key}>
                                            <Col span={8}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'id_characteristic']}
                                                    fieldKey={[fieldKey, 'id_characteristic']}
                                                    rules={[{ required: true, message: 'Missing characteristic' }]}
                                                >
                                                    <Select placeholder="Select characteristic">
                                                        {characteristics.map(characteristic => (
                                                            <Option key={characteristic.id_characteristic} value={characteristic.id_characteristic}>
                                                                {characteristic.name}
                                                            </Option>
                                                        ))}
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                            <Col span={14}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'value']}
                                                    fieldKey={[fieldKey, 'value']}
                                                    rules={[{ required: true, message: 'Missing value' }]}
                                                >
                                                    <Input placeholder="Value" />
                                                </Form.Item>
                                            </Col>
                                            <Col span={2}>
                                                <Button
                                                    type="dashed"
                                                    onClick={() => remove(name)}
                                                    icon={<MinusCircleOutlined />}
                                                >
                                                </Button>
                                            </Col>
                                        </Row>
                                    ))}
                                    <Form.Item>
                                        <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                            Add characteristic
                                        </Button>
                                    </Form.Item>
                                </>
                            )}
                        </Form.List>
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
                    <p><strong>Categories:</strong> {categories.filter(c => itemRecord.categories.includes(c.id_category)).map(c => c.name).join(', ')}</p>
                    <p><strong>Characteristics:</strong></p>
                    <ul>
                        {itemRecord.characteristics.map(c => (
                            <li key={c.id_characteristic}>{characteristics.find(ch => ch.id_characteristic === c.id_characteristic)?.name}: {c.value}</li>
                        ))}
                    </ul>
                </Modal>
            )}
        </>
    );
}

export default CrudExample;
