import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { AuthService } from '../services/auth.service';
import logo from '../images/stockywatch.png';
import '../styles/Header.css'; // Импорт пользовательских стилей
import 'bootstrap/dist/css/bootstrap.min.css';
import LoginForm from '../LoginForm'
import Content from '../components/Content';

const authService = new AuthService();

function Header(props) {
    function logout() {
        authService.logout().then(() => {
            document.location.reload();
        });
    }

    return (
        <Navbar collapseOnSelect expand="lg" className="custom-navbar">
            <Container>
                <Navbar.Brand href="#home">
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
                        <Link to="/login" className="nav-link" onClick={login}>Войти</Link>
                        <Link to="/register" className="nav-link">Зарегистрироваться</Link>
                        <Button variant="outline-light" onClick={logout}>Выйти</Button>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default Header;
