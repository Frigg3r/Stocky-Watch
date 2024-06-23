import React, { useEffect, useState } from 'react';
import './App.css';
import Content from './components/Content';
import Footer from './components/Footer';
import Header from './components/Header';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { AuthService } from './services/auth.service';

const authService = new AuthService();

function App() {
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);
    const [currentUserInfo, setCurrentUserInfo] = useState(null);

    useEffect(() => {
        authService.checkSession().then(res => {
            if (res.success) {
                setCurrentUserInfo(res.userInfo);
                setIsLoggedIn(true);
            }
            setLoading(false);
        });
    }, []);

    if (loading) {
        return (
            <Spin
                indicator={<LoadingOutlined style={{ fontSize: 100 }} />}
                style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            />
        );
    }

    return (
        <div className='app'>
            <Header setSearchQuery={setSearchQuery} />
            <Content 
                searchQuery={searchQuery} 
                setSearchQuery={setSearchQuery} 
                currentUserInfo={currentUserInfo} 
                setCurrentUserInfo={setCurrentUserInfo} 
                setIsLoggedIn={setIsLoggedIn} 
            />
            <Footer />
        </div>
    );
}

export default App;
