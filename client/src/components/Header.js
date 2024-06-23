// Header.js
import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Button, Form } from 'react-bootstrap';
import { Input } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { AuthService } from '../services/auth.service';
import logo from '../images/stockywatch.png';
import '../styles/Header.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const authService = new AuthService();

function Header({ setSearchQuery, resetTrigger }) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [searchValue, setSearchValue] = useState(''); // Добавить состояние для поиска
    const location = useLocation();

    useEffect(() => {
        authService.checkSession().then(res => {
            setIsLoggedIn(res.success);
        });
    }, []);

    useEffect(() => {
        if (resetTrigger) {
            setSearchValue(''); // Сбросить значение поиска
            setSearchQuery(''); // Сбросить поисковый запрос
        }
    }, [resetTrigger, setSearchQuery]);

    function handleSearch(value) {
        setSearchValue(value);
        setSearchQuery(value);
    }

    function logout() {
        authService.logout().then(() => {
            document.location.reload();
        });
    }

    return (
        <Navbar collapseOnSelect expand="lg" className="custom-navbar">
            <Container>
                <Navbar.Brand href="/">
                    <img src={logo} alt="Stocky Watch" style={{ width: '200px', height: 'auto' }} />
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse id="responsive-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/store">Каталог</Nav.Link>
                        <Nav.Link as={Link} to="/favorites">Избранное</Nav.Link>
                    </Nav>
                    {location.pathname === '/store' && (
                        <Form inline="true">
                            <Input.Search
                                onSearch={handleSearch}
                                placeholder="Поиск..."
                                enterButton="Найти"
                                size="large"
                                className="custom-search-button"
                                value={searchValue} // Привязка к состоянию поиска
                                onChange={(e) => setSearchValue(e.target.value)} // Обновление состояния поиска
                            />
                        </Form>
                    )}
                    <Nav className="ml-auto">
                        {isLoggedIn ? (
                            <>
                                <Link to="/profile" className="nav-link">Профиль</Link>
                                <Button variant="outline-light" onClick={logout}>Выйти</Button>
                            </>
                        ) : (
                            <Link to="/login" className="nav-link">Войти</Link>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default Header;
