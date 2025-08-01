import React from 'react';
import PlayStore from "@/assets/playstore.png";
import { Link } from 'react-router-dom';

const GooglePlay: React.FC = () => {
  return (
    <Link to="https://play.google.com/store/apps/details?id=com.klout.app&pli=1" target='_blank'>
      <img src={PlayStore} alt="Google Play Store" width={182} height={44} className='w-[182px] h-[44px]' />
    </Link>
  )
}

export default GooglePlay;
