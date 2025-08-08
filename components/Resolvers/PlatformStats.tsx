"use client"

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Activity, Users, DollarSign, Clock, Target } from 'lucide-react';

interface PlatformStatsProps {
  stats: {
    activeResolvers: number;
    totalResolvers: number;
    totalOrders: number;
    completedOrders: number;
    successRate: number;
    totalVolume: string;
    orders24h: number;
    volume24h: string;
  };
}

const PlatformStats: React.FC<PlatformStatsProps> = ({ stats }) => {
  const formatVolume = (volume: string) => {
    const value = parseFloat(volume);
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(2)}`;
  };

  const statCards = [
    {
      title: 'Active Resolvers',
      value: stats.activeResolvers,
      subtitle: `${stats.totalResolvers} total`,
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10 border-blue-500/30'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders.toLocaleString(),
      subtitle: `${stats.orders24h} in 24h`,
      icon: Activity,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-500/10 border-green-500/30'
    },
    {
      title: 'Success Rate',
      value: `${stats.successRate.toFixed(1)}%`,
      subtitle: `${stats.completedOrders} completed`,
      icon: Target,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10 border-purple-500/30'
    },
    {
      title: 'Total Volume',
      value: formatVolume(stats.totalVolume),
      subtitle: `${formatVolume(stats.volume24h)} in 24h`,
      icon: DollarSign,
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-500/10 border-yellow-500/30'
    }
  ];

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          className={`${stat.bgColor} border rounded-xl p-6 backdrop-blur-sm`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
              <stat.icon size={20} className="text-white" />
            </div>
            <TrendingUp size={16} className="text-green-400" />
          </div>
          
          <div className="text-2xl font-bold text-white mb-1">
            {stat.value}
          </div>
          
          <div className="text-slate-400 text-sm mb-2">
            {stat.title}
          </div>
          
          <div className="text-slate-500 text-xs">
            {stat.subtitle}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default PlatformStats;
