// App.js
import React from 'react';
import './App.css';
import Content from './components/Content';
import Footer from './components/Footer';
import Header from './components/Header';

function App({ currentUserInfo }) {
    const [searchQuery, setSearchQuery] = React.useState('');

    return (
        <div className='app'>
            <Header setSearchQuery={setSearchQuery} />
            <Content searchQuery={searchQuery} setSearchQuery={setSearchQuery} currentUserInfo={currentUserInfo} />
            <Footer />
        </div>
    );
}

export default App;