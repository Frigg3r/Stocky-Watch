// Header.js
import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Button, Form, FormControl } from 'react-bootstrap';
import { Input } from 'antd';
import { Link } from 'react-router-dom';
import { AuthService } from '../services/auth.service';
import logo from '../images/stockywatch.png';
import '../styles/Header.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const authService = new AuthService();

function Header({ setSearchQuery }) {  // Добавлен props для передачи поискового запроса
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        authService.checkSession().then(res => {
            setIsLoggedIn(res.success);
        });
    }, []);

    function handleSearch(value) {
        setSearchQuery(value);  // Обновление состояния поискового запроса в App
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
                        <Nav.Link href="#crud-example">Каталог</Nav.Link>
                        <Nav.Link href="#favorites">Избранное</Nav.Link>
                        <Nav.Link href="#about-us">О нас</Nav.Link>
                    </Nav>
                    <Form inline>
                        <Input.Search
                            onSearch={handleSearch}
                            placeholder="Search..."
                            enterButton="Найти"
                            size="large"
                        />
                    </Form>
                    <Nav className="ml-auto">
                        {isLoggedIn ? (
                            <>
                                <span className="nav-link">Авторизован</span>
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
