"use client"

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { resolverAPI, orderAPI, analyticsAPI, Resolver, Order } from '@/lib/api';
import { 
  ResolverCard, 
  ResolverDetails, 
  PlatformStats, 
  ResolverFilters 
} from '@/components/Resolvers';

const ResolversPage = () => {

  // State management
  const [resolvers, setResolvers] = useState<Resolver[]>([]);
  const [filteredResolvers, setFilteredResolvers] = useState<Resolver[]>([]);
  const [selectedResolver, setSelectedResolver] = useState<Resolver | null>(null);
  const [resolverOrders, setResolverOrders] = useState<Order[]>([]);
  const [platformStats, setPlatformStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'reputation' | 'volume' | 'successRate' | 'orders'>('reputation');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [countryFilter, setCountryFilter] = useState('');

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  // Apply filters whenever dependencies change
  useEffect(() => {
    applyFilters();
  }, [resolvers, searchTerm, sortBy, sortOrder, statusFilter, countryFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load resolvers and platform stats in parallel
      const [resolversData, statsData] = await Promise.all([
        resolverAPI.getAllResolvers(),
        analyticsAPI.getPlatformStats()
      ]);

      setResolvers(resolversData);
      setPlatformStats(statsData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load resolver data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const applyFilters = () => {
    let filtered = [...resolvers];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(resolver =>
        resolver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resolver.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resolver.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(resolver =>
        statusFilter === 'active' ? resolver.isActive : !resolver.isActive
      );
    }

    // Country filter
    if (countryFilter) {
      filtered = filtered.filter(resolver =>
        resolver.country === countryFilter
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: number;
      let bValue: number;

      switch (sortBy) {
        case 'reputation':
          aValue = a.reputation;
          bValue = b.reputation;
          break;
        case 'volume':
          aValue = parseFloat(a.volumeTotal);
          bValue = parseFloat(b.volumeTotal);
          break;
        case 'successRate':
          aValue = a.successRate;
          bValue = b.successRate;
          break;
        case 'orders':
          aValue = a.totalExecuted;
          bValue = b.totalExecuted;
          break;
        default:
          aValue = a.reputation;
          bValue = b.reputation;
      }

      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    setFilteredResolvers(filtered);
  };

  const handleResolverClick = async (resolver: Resolver) => {
    try {
      setSelectedResolver(resolver);
      // Load resolver orders
      const orders = await orderAPI.getOrdersByResolver(resolver.address);
      setResolverOrders(orders);
    } catch (err) {
      console.error('Error loading resolver orders:', err);
      setResolverOrders([]);
    }
  };

  const handleCloseDetails = () => {
    setSelectedResolver(null);
    setResolverOrders([]);
  };

  // Get unique countries for filter
  const countries = Array.from(new Set(resolvers.map(r => r.country))).sort();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-lg">Loading resolver network...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <button
            onClick={loadData}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-10 py-8">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Resolver Network
              </h1>
              <p className="text-slate-400 text-lg">
                Discover and monitor intelligent agents executing cross-chain swaps
              </p>
            </div>
            <button
              onClick={refreshData}
              disabled={refreshing}
              className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw 
                size={20} 
                className={`text-slate-400 ${refreshing ? 'animate-spin' : ''}`} 
              />
            </button>
          </div>
        </motion.div>

        {/* Platform Stats */}
        {/* {platformStats && <PlatformStats stats={platformStats} />} */}

        {/* Filters */}
        {/* <ResolverFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          sortBy={sortBy}
          onSortChange={setSortBy}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          countryFilter={countryFilter}
          onCountryFilterChange={setCountryFilter}
          countries={countries}
        /> */}

        {/* Results Summary */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <p className="text-slate-400">
            Showing {filteredResolvers.length} of {resolvers.length} resolvers
          </p>
        </motion.div>

        {/* Resolvers Grid/List */}
        {filteredResolvers.length > 0 ? (
          <motion.div
            className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
                : 'grid-cols-1'
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {filteredResolvers.map((resolver, index) => (
              <ResolverCard
                key={resolver.address}
                resolver={resolver}
                rank={index + 1}
                onClick={handleResolverClick}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Bot size={48} className="text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-400 mb-2">
              No resolvers found
            </h3>
            <p className="text-slate-500">
              Try adjusting your search or filter criteria
            </p>
          </motion.div>
        )}

        {/* Resolver Details Modal */}
        <AnimatePresence>
          {selectedResolver && (
            <ResolverDetails
              resolver={selectedResolver}
              orders={resolverOrders}
              onClose={handleCloseDetails}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ResolversPage;
