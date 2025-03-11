import React from 'react';
import Logo from '../assets/logo.png';
const Navbar: React.FC = () => {
  return (
    <header>
        <nav className='w-full flex justify-between items-center'>
            <img src={Logo} alt="logo" />
        </nav>
    </header>
  )
}

export default Navbar;
