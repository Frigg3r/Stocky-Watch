import React, { useEffect, useState, useCallback } from 'react';
import { Button, Card, Modal, Form, Input, notification, Col, Row, Select } from 'antd';
import { PlusOutlined, ReloadOutlined, EyeOutlined, EditOutlined, HeartOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { ApiService } from '../../services/api.service';
import '../../styles/CrudExample.css';
import FilterPanel from '../FilterPanel';

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
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedCharacteristics, setSelectedCharacteristics] = useState({});
    const [characteristicOptions, setCharacteristicOptions] = useState({});
    const [form] = Form.useForm();

    useEffect(() => {
        fetchData();
        fetchCategories();
        fetchCharacteristics();
        fetchBrands();
        fetchCountries();
    }, [searchQuery, selectedCategories, selectedCharacteristics]);

    const fetchData = useCallback(() => {
        const params = new URLSearchParams();
        if (searchQuery) params.append('name', searchQuery);
        if (selectedCategories.length > 0) params.append('categories', selectedCategories.join(','));

        Object.keys(selectedCharacteristics).forEach(key => {
            if (selectedCharacteristics[key].length > 0) {
                params.append(key, selectedCharacteristics[key].join(','));
            }
        });

        const endpoint = `/search?${params.toString()}`;
        apiService.get(endpoint).then(res => {
            setItems(res || []);
        }).catch(err => {
            notification.error({ message: 'Ошибка загрузки элементов', description: 'Не удалось получить данные с сервера.' });
        });
    }, [searchQuery, selectedCategories, selectedCharacteristics]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    function fetchCategories() {
        apiService.getCategories().then(res => {
            setCategories(res || []);
        }).catch(err => {
            notification.error({ message: 'Ошибка загрузки категорий', description: 'Не удалось получить данные с сервера.' });
        });
    }

    function fetchCharacteristics() {
        apiService.getCharacteristics().then(res => {
            setCharacteristics(res || []);
        }).catch(err => {
            notification.error({ message: 'Ошибка загрузки характеристик', description: 'Не удалось получить данные с сервера.' });
        });
    }

    function fetchBrands() {
        apiService.getBrands().then(res => {
            setBrands(res || []);
        }).catch(err => {
            notification.error({ message: 'Ошибка загрузки брендов', description: 'Не удалось получить данные с сервера.' });
        });
    }

    function fetchCountries() {
        apiService.getCountries().then(res => {
            setCountries(res || []);
        }).catch(err => {
            notification.error({ message: 'Ошибка загрузки стран', description: 'Не удалось получить данные с сервера.' });
        });
    }

    function fetchItemWithDetails(id) {
        return apiService.get(`/item/${id}`).then(item => {
            return {
                ...item,
                categories: item.categories || [],
                characteristics: item.characteristics.map(c => ({
                    id_characteristic: c.id_characteristic,
                    name: characteristics.find(char => char.id_characteristic === c.id_characteristic)?.name.split(': ')[0],
                    value: c.value
                })) || [],
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
        form.resetFields();
        setCharacteristicOptions({});
        if (item.id) {
            fetchItemWithDetails(item.id).then(fullItem => {
                setItemRecord(fullItem);
                form.setFieldsValue(fullItem);
                setModalVisible(true);
                updateCharacteristicOptions(fullItem.characteristics);
            });
        } else {
            setItemRecord({});
            setModalVisible(true);
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
            });
        }
    }

    function updateCharacteristicOptions(characteristics) {
        const options = {};
        characteristics.forEach(c => {
            if (c.name) {
                const name = c.name;
                const values = getValuesByCharacteristicName(name);
                options[name] = { name, values };
            }
        });
        setCharacteristicOptions(options);
    }

    function saveItem() {
        form.validateFields().then(values => {
            const method = itemRecord.id ? 'put' : 'post';
            const characteristicsData = values.characteristics
                .map(c => {
                    const id_characteristic = characteristics.find(ch => ch.name.split(': ')[0] === c.name)?.id_characteristic;
                    return id_characteristic ? { id_characteristic, value: c.value } : null;
                })
                .filter(c => c !== null && c.value);

            const itemData = { ...itemRecord, ...values, characteristics: characteristicsData };

            apiService[method](`/item${itemRecord.id ? '/' + itemRecord.id : ''}`, itemData).then(item => {
                fetchData();
                closeModal();
                notification.success({ message: 'Элемент успешно сохранен' });
            }).catch(err => {
                notification.error({ message: `Ошибка сохранения элемента: ${err.message}`, description: err.message });
            });
        }).catch(info => {
            console.log('Validate Failed:', info);
        });
    }

    function removeItem() {
        apiService.delete(`/item/${itemRecord.id}`).then(() => {
            fetchData();
            closeModal();
            notification.success({ message: 'Элемент успешно удален' });
        }).catch(err => {
            notification.error({ message: 'Ошибка удаления элемента', description: err.message });
        });
    }

    function addToFavorites(itemId) {
        if (currentUserInfo && currentUserInfo.id) {
            apiService.postToFavorites(currentUserInfo.id, itemId).then(() => {
                notification.success({ message: 'Добавлено в избранное' });
            }).catch(err => {
                notification.error({ message: 'Ошибка добавления в избранное', description: err.message });
            });
        } else {
            notification.error({ message: 'Необходимо войти в систему, чтобы добавить в избранное' });
        }
    }

    function closeModal() {
        setModalVisible(false);
        setDetailModalVisible(false);
        setItemRecord({});
        form.resetFields();
    }

    function resetSearch() {
        setSearchQuery('');
        setSelectedCategories([]);
        setSelectedCharacteristics({});
        fetchData();
    }

    function handleCharacteristicChange(value, fieldName) {
        const updatedCharacteristics = form.getFieldValue('characteristics').map((char, index) => {
            if (index === fieldName) {
                return { ...char, name: value, value: '' };
            }
            return char;
        });
        form.setFieldsValue({ characteristics: updatedCharacteristics });
        updateCharacteristicOptions(updatedCharacteristics);
    }

    function getValuesByCharacteristicName(name) {
        return characteristics.filter(c => c.name.startsWith(name)).map(c => c.name.split(': ')[1]);
    }

    function renderCharacteristicOptions() {
        const options = [...new Set(characteristics.map(c => c.name.split(': ')[0]))];
        return options.map(option => (
            <Option key={option} value={option}>
                {option}
            </Option>
        ));
    }

    function renderCharacteristicValues(name) {
        if (!name) return [];
        return characteristicOptions[name]?.values || [];
    }

    return (
        <>
            <Row gutter={16} className="filter-row">
                <FilterPanel 
                    setSelectedCategories={setSelectedCategories}
                    setSelectedCharacteristics={setSelectedCharacteristics}
                />
                <div className="button-group">
                    <Button type="default" icon={<ReloadOutlined />} onClick={resetSearch}>
                        Сбросить поиск
                    </Button>
                    {currentUserInfo && currentUserInfo.role === "admin" && (
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => showItem({})}>
                            Добавить новый элемент
                        </Button>
                    )}
                </div>
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
                                <Button
                                    type="link"
                                    onClick={() => addToFavorites(item.id)}
                                >
                                    <HeartOutlined />
                                </Button>
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
            {modalVisible && (
                <Modal
                    title={itemRecord.id ? `Редактировать элемент ${itemRecord.id}` : 'Добавить новый элемент'}
                    visible={modalVisible}
                    onOk={saveItem}
                    onCancel={closeModal}
                    footer={[
                        <Button key="back" onClick={closeModal}>Отмена</Button>,
                        itemRecord.id && (
                            <Button key="delete" danger onClick={removeItem}>Удалить</Button>
                        ),
                        <Button key="submit" type="primary" onClick={saveItem}>Сохранить</Button>
                    ]}
                >
                    <Form form={form} layout="vertical" onFinish={saveItem} initialValues={{ ...itemRecord }}>
                        <Form.Item label="Название" name="name" rules={[{ required: true, message: 'Пожалуйста, введите название!' }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item label="Описание" name="description" rules={[{ required: true, message: 'Пожалуйста, введите описание!' }]}>
                            <Input.TextArea />
                        </Form.Item>
                        <Form.Item label="Бренд" name="id_brand" rules={[{ required: true, message: 'Пожалуйста, выберите бренд!' }]}>
                            <Select placeholder="Выберите бренд">
                                {brands.map(brand => (
                                    <Option key={brand.id_brand} value={brand.id_brand}>
                                        {brand.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item label="Страна" name="id_country" rules={[{ required: true, message: 'Пожалуйста, выберите страну!' }]}>
                            <Select placeholder="Выберите страну">
                                {countries.map(country => (
                                    <Option key={country.id_country} value={country.id_country}>
                                        {country.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item label="Количество" name="quantity" rules={[{ required: true, message: 'Пожалуйста, введите количество!' }]}>
                            <Input type="number" />
                        </Form.Item>
                        <Form.Item label="Стоимость" name="cost" rules={[{ required: true, message: 'Пожалуйста, введите стоимость!' }]}>
                            <Input prefix="$" type="number" />
                        </Form.Item>
                        <Form.Item label="URL фотографии" name="photo" rules={[{ required: true, message: 'Пожалуйста, введите URL фотографии!' }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item label="Категории" name="categories" initialValue={itemRecord.categories || []}>
                            <Select mode="multiple" placeholder="Выберите категории">
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
                                                    name={[name, 'name']}
                                                    fieldKey={[fieldKey, 'name']}
                                                    rules={[{ required: true, message: 'Отсутствует характеристика' }]}
                                                >
                                                    <Select 
                                                        placeholder="Выберите характеристику" 
                                                        onChange={(value) => handleCharacteristicChange(value, name)}
                                                    >
                                                        {renderCharacteristicOptions()}
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                            <Col span={14}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'value']}
                                                    fieldKey={[fieldKey, 'value']}
                                                    rules={[{ required: true, message: 'Отсутствует значение' }]}
                                                >
                                                    <Select 
                                                        placeholder="Выберите значение"
                                                        value={form.getFieldValue(['characteristics', name, 'value'])}
                                                    >
                                                        {renderCharacteristicValues(form.getFieldValue(['characteristics', name, 'name'])).map(value => (
                                                            <Option key={value} value={value}>
                                                                {value}
                                                            </Option>
                                                        ))}
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                            <Col span={2}>
                                                <Button
                                                    type="dashed"
                                                    onClick={() => remove(name)}
                                                    icon={<MinusCircleOutlined />}
                                                />
                                            </Col>
                                        </Row>
                                    ))}
                                    <Form.Item>
                                        <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                            Добавить характеристику
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
                    title={`Описание ${itemRecord.name}`}
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
                            <p><strong>Категории:</strong> {categories.filter(c => itemRecord.categories.includes(c.id_category)).map(c => c.name).join(', ')}</p>
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

export default CrudExample;
