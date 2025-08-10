"use client"

import React from 'react';
import { motion } from 'framer-motion';
import { Bot, CheckCircle, AlertCircle, Clock, Brain, TrendingUp, Activity, Globe, Mail, MessageCircle, Twitter } from 'lucide-react';
import { Resolver } from '@/lib/api';
import { utils } from '@/lib/api';

interface ResolverCardProps {
  resolver: Resolver;
  rank: number;
  onClick?: (resolver: Resolver) => void;
}

const ResolverCard: React.FC<ResolverCardProps> = ({ resolver, rank, onClick }) => {
  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'text-green-400' : 'text-red-400';
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? <CheckCircle size={16} /> : <AlertCircle size={16} />;
  };

  // const getReputationColor = (reputation: number) => {
  //   if (reputation >= 900) return 'text-emerald-400';
  //   if (reputation >= 700) return 'text-blue-400';
  //   if (reputation >= 500) return 'text-yellow-400';
  //   return 'text-red-400';
  // };

  const formatVolume = (volume: string) => {
    const value = parseFloat(volume);
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(2)}`;
  };

  return (
    <motion.div
      className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6 hover:border-blue-500/50 transition-all duration-300 cursor-pointer"
      onClick={() => onClick && onClick(resolver)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3"> 
          <div>
            <div className="text-white font-bold text-lg">{resolver.name}</div>
            <div className={`flex items-center gap-2 ${getStatusColor(resolver.isActive)}`}>
              {getStatusIcon(resolver.isActive)}
              <span className="text-sm">{resolver.isActive ? 'Active' : 'Inactive'}</span>
            </div>
          </div>
        </div>
        {/* <div className="text-right">
          <div className="text-slate-400 text-sm">Rank</div>
          <div className="text-2xl font-bold text-white">#{rank}</div>
        </div> */} 
      </div>

      {/* Description */}
      {resolver.description && (
        <div className="text-slate-300 text-sm mb-4 line-clamp-2">
          {resolver.description}
        </div>
      )}

      {/* Country & Contact Info */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1 text-slate-400 text-sm">
          <Globe size={14} />
          <span>{resolver.country}</span>
        </div>
        {resolver.website && (
          <div className="flex items-center gap-1 text-blue-400 text-sm">
            <Globe size={14} />
            <a href={resolver.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
              Website
            </a>
          </div>
        )} 
      </div>

      {/* Performance Metrics */}
      {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <div className={`font-bold text-lg ${getReputationColor(resolver.reputation)}`}>
            {resolver.reputation}
          </div>
          <div className="text-slate-400 text-xs">Reputation</div>
        </div>
        <div className="text-center">
          <div className="text-white font-bold">
            {utils.formatPercentage(resolver.successRate)}
          </div>
          <div className="text-slate-400 text-xs">Success Rate</div>
        </div>
        <div className="text-center">
          <div className="text-white font-bold">{resolver.totalExecuted}</div>
          <div className="text-slate-400 text-xs">Orders</div>
        </div>
        <div className="text-center">
          <div className="text-green-400 font-bold">
            {formatVolume(resolver.volumeTotal)}
          </div>
          <div className="text-slate-400 text-xs">Volume</div>
        </div>
      </div> */}

      {/* Additional Info */}
      {/* <div className="flex items-center justify-between text-xs">
        <div className="text-slate-400">
          Fee: {utils.formatPercentage(resolver.feeRate)}
        </div>
        {resolver.avgExecutionTime && (
          <div className="text-slate-400">
            Avg: {resolver.avgExecutionTime.toFixed(1)}s
          </div>
        )}
        <div className="text-slate-400">
          24h: {formatVolume(resolver.volume24h)}
        </div>
      </div> */}

      {/* Supported Chains */}
      {resolver.supportedChains && resolver.supportedChains.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-700/50">
          <div className="text-slate-400 text-xs mb-2">Supported Chains:</div>
          <div className="flex flex-wrap gap-1">
            {resolver.supportedChains.slice(0, 5).map((chain) => (
              <span
                key={chain}
                className="px-2 py-1 bg-slate-700/50 text-slate-300 text-xs rounded-md"
              >
                {chain}
              </span>
            ))}
            {resolver.supportedChains.length > 5 && (
              <span className="px-2 py-1 bg-slate-700/50 text-slate-400 text-xs rounded-md">
                +{resolver.supportedChains.length - 5}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Social Links */}
      {(resolver.telegram || resolver.discord || resolver.twitter) && (
        <div className="mt-4 pt-4 border-t border-slate-700/50">
          <div className="flex gap-3">
            {resolver.telegram && (
              <a
                href={`https://t.me/${resolver.telegram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                <MessageCircle size={16} />
              </a>
            )}
            {resolver.twitter && (
              <a
                href={`https://twitter.com/${resolver.twitter}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                <Twitter size={16} />
              </a>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ResolverCard;
