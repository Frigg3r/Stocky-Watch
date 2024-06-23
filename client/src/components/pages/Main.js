import React from 'react';
import '../../styles/Main.css'; // Обновляем путь к файлу стилей
import audemarshome from '../../images/audemarshome.jpg'; // Импортируем изображение

export default function Home() {
  return (
    <div className="home-container">
      <h1 className="main-heading-line1" style={{ fontFamily: 'Raleway', fontSize: '44px', fontWeight: '555', textAlign: 'center' }}>
        Лучшие часы в одном магазине.
      </h1>
      
      <h2 className="main-heading-line3">
        Звездные Audemars Piguet Royal Oak
      </h2>
      <div className="button-container">
        <button className="buy-button">Каталог</button>
      </div>
      <div className="image-container">
        <img src={audemarshome} alt="Audemars Home" className="audemars-image" />
      </div>
    </div>
  );
}
