import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { AuthService } from '../services/auth.service';
import logo from '../images/stockywatch.png';
import '../styles/Header.css'; // Импорт пользовательских стилей
import 'bootstrap/dist/css/bootstrap.min.css';

const authService = new AuthService();

function Header(props) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        // Проверяем, авторизован ли пользователь при загрузке компонента
        authService.checkSession().then(res => {
            setIsLoggedIn(res.success);
        });
    }, []);

    function logout() {
        authService.logout().then(() => {
            document.location.reload();
        });
    }

    function login() {
        authService.login().then(() => {
            document.location.reload();
        });
    }   

    return (
        <Navbar collapseOnSelect expand="lg" className="custom-navbar">
            <Container>
                <Navbar.Brand href="/">
                    <img src={logo} alt="Магазин часов" style={{ width: '200px', height: 'auto' }} />
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse id="responsive-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link href="#features">Каталог</Nav.Link>
                        <Nav.Link href="#pricing">Избранное</Nav.Link>
                        <Nav.Link href="#pricing">О нас</Nav.Link>
                    </Nav>
                    <Nav className="ml-auto">
                        {isLoggedIn ? (
                            <>
                                <span className="nav-link">Авторизован</span>
                                <Button variant="outline-light" onClick={logout}>Выйти</Button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="nav-link">Войти</Link>
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default Header;
