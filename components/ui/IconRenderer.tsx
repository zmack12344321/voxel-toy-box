/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { 
  RiSparklingFill, 
  RiRobot2Fill, 
  RiBox3Fill,
  RiRocket2Fill,
  RiTeamFill,
  RiShieldFlashFill,
  RiBuilding2Fill
} from 'react-icons/ri';
import { FaPaw, FaCat, FaDog } from 'react-icons/fa6';
import { GiRabbit, GiEagleHead, GiCastle } from 'react-icons/gi';

interface IconRendererProps {
  name: string;
  size?: number;
  className?: string;
  animate?: boolean;
}

export const IconRenderer: React.FC<IconRendererProps> = ({ 
  name, 
  size = 18, 
  className = '',
  animate = true 
}) => {
  const getIconElement = () => {
    switch (name) {
      case 'PawPrint': 
      case 'Paw': return <FaPaw size={size} className={className} />;
      case 'Bird': return <GiEagleHead size={size} className={className} />;
      case 'Cat': return <FaCat size={size} className={className} />;
      case 'Rabbit': return <GiRabbit size={size} className={className} />;
      case 'Castle': 
      case 'Landmark': return <GiCastle size={size} className={className} />;
      case 'Bot': return <RiRobot2Fill size={size} className={className} />;
      case 'Rocket': return <RiRocket2Fill size={size} className={className} />;
      case 'Users': return <RiTeamFill size={size} className={className} />;
      case 'Shield': return <RiShieldFlashFill size={size} className={className} />;
      case 'Box': 
      case 'Shapes': return <RiBox3Fill size={size} className={className} />;
      default: return <RiSparklingFill size={size} className={className} />;
    }
  };

  if (!animate) {
    return getIconElement();
  }

  return (
    <motion.div
      whileHover={{ scale: 1.15, rotate: 5 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className="inline-flex items-center justify-center shrink-0"
    >
      {getIconElement()}
    </motion.div>
  );
};
