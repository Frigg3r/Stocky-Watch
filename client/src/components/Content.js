// Content.js
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Main from './pages/Main';
import Store from './pages/Store';
import LoginForm from '../LoginForm';
import Favorite from './pages/Favorite';
import UserProfile from './pages/UserProfile';

function Content({ searchQuery, setSearchQuery, currentUserInfo, setCurrentUserInfo, setIsLoggedIn }) {
    return (
        <div className='content-wrapper'>
            <div className='content'>
                <Routes>
                    <Route path='/' element={<Main />} />
                    <Route path='/store' element={<Store searchQuery={searchQuery} setSearchQuery={setSearchQuery} currentUserInfo={currentUserInfo} />} />
                    <Route path='/login' element={<LoginForm setCurrentUserInfo={setCurrentUserInfo} setIsLoggedIn={setIsLoggedIn} />} />
                    <Route path="/favorites" element={<Favorite currentUserInfo={currentUserInfo} />} />
                    <Route path="/profile" element={<UserProfile currentUserInfo={currentUserInfo} setCurrentUserInfo={setCurrentUserInfo} />} />
                </Routes>
            </div>
        </div>
    );
}

export default Content;
