// Content.js
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Main from './pages/Main';
import SandBox from './pages/SandBox';
import CrudExample from './pages/CrudExample';
import LoginForm from '../LoginForm';
import Favorite from './pages/Favorite';

function Content({ searchQuery, setSearchQuery, currentUserInfo }) {
    return (
        <div className='content-wrapper'>
            <div className='content'>
                <Routes>
                    <Route path='/' element={<Main />} />
                    <Route path='/sandbox' element={<SandBox />} />
                    <Route path='/crud-example' element={<CrudExample searchQuery={searchQuery} setSearchQuery={setSearchQuery} currentUserInfo={currentUserInfo} />} />
                    <Route path='/login' element={<LoginForm />} />
                    <Route path="/favorites" element={<Favorite currentUserInfo={currentUserInfo} />} />
                </Routes>
            </div>
        </div>
    );
}

export default Content;
