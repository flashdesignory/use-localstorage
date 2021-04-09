import React from 'react';
import useLocalStorage from './useLocalStorage';
import logo from './logo.svg';
import './App.css';

/* istanbul ignore next */
const App = () => {
  const [localValue, setLocalValue] = useLocalStorage('foo', 'bar');

  const handleClick = () => {
    localValue === 'bar' ? setLocalValue('poo') : setLocalValue('bar');
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <div>local value is: {localValue}</div>
        <button onClick={handleClick}>toggle</button>
      </header>
    </div>
  );
}

export default App;
