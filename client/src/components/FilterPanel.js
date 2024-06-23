import React, { useEffect, useState } from 'react';
import { Select, Row, Col } from 'antd';
import { ApiService } from '../services/api.service';
import '../styles/FilterPanel.css';  // Подключаем CSS файл

const apiService = new ApiService();
const { Option } = Select;

function FilterPanel({ setSelectedCategories, setSelectedCharacteristics, resetTrigger }) {
    const [categories, setCategories] = useState([]);
    const [characteristics, setCharacteristics] = useState([]);
    const [brands, setBrands] = useState([]);
    const [countries, setCountries] = useState([]);

    useEffect(() => {
        fetchCategories();
        fetchCharacteristics();
        fetchBrands();
        fetchCountries();
    }, []);

    useEffect(() => {
        if (resetTrigger) {
            setSelectedCategories([]);
            setSelectedCharacteristics({});
        }
    }, [resetTrigger]);

    function fetchCategories() {
        apiService.getCategories().then(res => {
            setCategories(res || []);
        }).catch(err => {
            console.error('Ошибка загрузки категорий:', err);
        });
    }

    function fetchCharacteristics() {
        apiService.getCharacteristics().then(res => {
            setCharacteristics(res || []);
        }).catch(err => {
            console.error('Ошибка загрузки характеристик:', err);
        });
    }

    function fetchBrands() {
        apiService.getBrands().then(res => {
            setBrands(res || []);
        }).catch(err => {
            console.error('Ошибка загрузки брендов:', err);
        });
    }

    function fetchCountries() {
        apiService.getCountries().then(res => {
            setCountries(res || []);
        }).catch(err => {
            console.error('Ошибка загрузки стран:', err);
        });
    }

    function onCategoryChange(values) {
        setSelectedCategories(values);
    }

    function onCharacteristicChange(values, group) {
        setSelectedCharacteristics(prev => ({
            ...prev,
            [group]: values
        }));
    }

    function getCharacteristicsByGroup(groupName) {
        return characteristics.filter(c => c.name.startsWith(groupName + ':'));
    }

    return (
        <div className="filter-panel-container" style={{ marginBottom: '0', paddingBottom: '0', backgroundColor: 'transparent' }}>
            <div className="filter-panel" style={{ padding: '0', backgroundColor: 'transparent' }}>
                <Row gutter={16} wrap={false}>
                    <Col flex="1">
                        <div className="filter-group">
                            <label>Категории</label>
                            <Select
                                mode="multiple"
                                className="filter-select"
                                placeholder="Выберите категории"
                                onChange={onCategoryChange}
                                style={{ width: '100%' }}
                                value={resetTrigger ? [] : undefined}
                            >
                                {categories.map(category => (
                                    <Option key={category.id_category} value={category.id_category}>
                                        {category.name}
                                    </Option>
                                ))}
                            </Select>
                        </div>
                    </Col>
                    <Col flex="1">
                        <div className="filter-group">
                            <label>Водозащита</label>
                            <Select
                                mode="multiple"
                                className="filter-select"
                                placeholder="Выберите водозащиту"
                                onChange={(values) => onCharacteristicChange(values, 'Водозащита')}
                                style={{ width: '100%' }}
                                value={resetTrigger ? [] : undefined}
                            >
                                {getCharacteristicsByGroup('Водозащита').map(characteristic => (
                                    <Option key={characteristic.id_characteristic} value={characteristic.name.replace('Водозащита: ', '')}>
                                        {characteristic.name.replace('Водозащита: ', '')}
                                    </Option>
                                ))}
                            </Select>
                        </div>
                    </Col>
                    <Col flex="1">
                        <div className="filter-group">
                            <label>Материал</label>
                            <Select
                                mode="multiple"
                                className="filter-select"
                                placeholder="Выберите материал"
                                onChange={(values) => onCharacteristicChange(values, 'Материал')}
                                style={{ width: '100%' }}
                                value={resetTrigger ? [] : undefined}
                            >
                                {getCharacteristicsByGroup('Материал').map(characteristic => (
                                    <Option key={characteristic.id_characteristic} value={characteristic.name.replace('Материал: ', '')}>
                                        {characteristic.name.replace('Материал: ', '')}
                                    </Option>
                                ))}
                            </Select>
                        </div>
                    </Col>
                    <Col flex="1">
                        <div className="filter-group">
                            <label>Форма</label>
                            <Select
                                mode="multiple"
                                className="filter-select"
                                placeholder="Выберите форму"
                                onChange={(values) => onCharacteristicChange(values, 'Форма')}
                                style={{ width: '100%' }}
                                value={resetTrigger ? [] : undefined}
                            >
                                {getCharacteristicsByGroup('Форма').map(characteristic => (
                                    <Option key={characteristic.id_characteristic} value={characteristic.name.replace('Форма: ', '')}>
                                        {characteristic.name.replace('Форма: ', '')}
                                    </Option>
                                ))}
                            </Select>
                        </div>
                    </Col>
                    <Col flex="1">
                        <div className="filter-group">
                            <label>Производитель</label>
                            <Select
                                mode="multiple"
                                className="filter-select"
                                placeholder="Выберите производителя"
                                onChange={(values) => onCharacteristicChange(values, 'id_brand')}
                                style={{ width: '100%' }}
                                value={resetTrigger ? undefined : undefined}
                            >
                                {brands.map(brand => (
                                    <Option key={brand.id_brand} value={brand.id_brand}>
                                        {brand.name}
                                    </Option>
                                ))}
                            </Select>
                        </div>
                    </Col>
                    <Col flex="1">
                        <div className="filter-group">
                            <label>Страна</label>
                            <Select
                                mode="multiple"
                                className="filter-select"
                                placeholder="Выберите страну"
                                onChange={(values) => onCharacteristicChange(values, 'id_country')}
                                style={{ width: '100%' }}
                                value={resetTrigger ? undefined : undefined}
                            >
                                {countries.map(country => (
                                    <Option key={country.id_country} value={country.id_country}>
                                        {country.name}
                                    </Option>
                                ))}
                            </Select>
                        </div>
                    </Col>
                </Row>
            </div>
        </div>
    );
}

export default FilterPanel;
